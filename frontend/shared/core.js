/* ============================================================
   Shared logic for every design template.

   The templates only look different. They all use this file to:
     - keep the list of documents between pages (sessionStorage)
     - send documents to the Java server (POST /api/compare)
     - keep the comparison history in the browser (localStorage)
     - highlight copied phrases inside the original text

   If the Java server is not running, the Results page
   can show a demo using real output saved in sample.js.
   ============================================================ */

const PD = (() => {
  const MIN_DOCS = 2;
  const MAX_DOCS = 10;
  const MAX_FILE_SIZE = 1024 * 1024; // 1 MB, same as the Java side
  const SAMPLE_FILES = ["original.txt", "copied.txt", "different.txt"];
  const KEYS = { docs: "pd.docs", result: "pd.result", history: "pd.history" };
  const MAX_HISTORY = 50; // oldest entries are dropped after this

  /* ---------- storage (falls back to memory if blocked) ---------- */
  const memory = {};
  function read(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return memory[key] || null;
    }
  }
  function write(key, value) {
    memory[key] = value;
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  }

  /* ---------- documents ---------- */
  function docs() { return read(KEYS.docs) || []; }

  function uniqueName(list, name) {
    let result = name;
    let counter = 2;
    while (list.some((d) => d.name === result)) {
      result = name.replace(/(\.txt)?$/i, ` (${counter})$1`);
      counter++;
    }
    return result;
  }

  function addDoc(name, text) {
    const list = docs();
    if (list.length >= MAX_DOCS) return `You can compare at most ${MAX_DOCS} documents.`;
    if (!text || text.trim() === "") return `"${name}" is empty.`;
    list.push({ name: uniqueName(list, name), text });
    write(KEYS.docs, list);
    return null;
  }

  function removeDoc(index) {
    const list = docs();
    list.splice(index, 1);
    write(KEYS.docs, list);
  }

  function clearDocs() { write(KEYS.docs, []); }

  async function addFiles(fileList) {
    const errors = [];
    for (const file of fileList) {
      if (!file.name.toLowerCase().endsWith(".txt")) { errors.push(`${file.name}: only .txt files are allowed`); continue; }
      if (file.size > MAX_FILE_SIZE) { errors.push(`${file.name}: larger than 1 MB`); continue; }
      const problem = addDoc(file.name, await file.text());
      if (problem) { errors.push(problem); break; }
    }
    return errors.join(" · ");
  }

  async function loadSamples() {
    for (let i = 0; i < SAMPLE_FILES.length; i++) {
      const fileName = SAMPLE_FILES[i];
      let text = null;
      try {
        const response = await fetch(`/samples/${fileName}`);
        if (response.ok) text = await response.text();
      } catch (e) { /* server offline, use the saved copy below */ }
      if (text === null && window.SAMPLE) text = window.SAMPLE.documents[i].text;
      if (text === null) return `Could not load ${fileName}.`;
      const problem = addDoc(fileName, text);
      if (problem) return problem;
    }
    return "";
  }

  /* ---------- comparing (Java backend) ---------- */
  // Same text format that RequestParser.java reads:  ===DOCUMENT: name.txt \n text
  function requestBody(list) {
    return list.map((d) => `===DOCUMENT: ${d.name}\n${d.text}\n`).join("");
  }

  async function compare() {
    const list = docs();
    if (list.length < MIN_DOCS) return `Add at least ${MIN_DOCS} documents.`;
    let response;
    try {
      response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "text/plain; charset=UTF-8" },
        body: requestBody(list),
      });
    } catch (e) {
      return "Could not reach the Java server. Start it with run-server.bat and reload.";
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return data.error || "Something went wrong on the server.";

    const texts = {};
    list.forEach((d) => (texts[d.name] = d.text));
    write(KEYS.result, { data, texts, demo: false });
    saveHistory(data, list);
    return null;
  }

  function result() { return read(KEYS.result); }

  function useDemo() {
    const data = window.SAMPLE;
    const texts = {};
    data.documents.forEach((d) => (texts[d.name] = d.text));
    write(KEYS.result, { data, texts, demo: true });
    return result();
  }

  /* ---------- history (localStorage) ----------
     History lives ONLY in this browser, under the key "pd.history".
     localStorage (unlike sessionStorage) survives closing the tab and
     restarting the computer. The Java server stores nothing for it. */
  function readHistory() {
    try {
      const rows = JSON.parse(localStorage.getItem(KEYS.history) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return memory[KEYS.history] || []; // storage blocked or damaged
    }
  }

  function writeHistory(rows) {
    memory[KEYS.history] = rows;
    try { localStorage.setItem(KEYS.history, JSON.stringify(rows)); } catch (e) { /* memory only */ }
  }

  // One short summary per comparison, newest first
  function saveHistory(data, list) {
    const top = data.results[0]; // results come sorted, most similar first
    const pad = (n) => String(n).padStart(2, "0");
    const d = new Date();
    const entry = {
      date: `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      reportName: data.reportName,
      documentCount: list.length,
      documentNames: list.map((doc) => doc.name).join(" | "),
      mostSimilarPair: `${top.documentA} vs ${top.documentB}`,
      highestSimilarity: top.overall,
      verdict: top.verdict,
    };
    writeHistory([entry, ...readHistory()].slice(0, MAX_HISTORY));
  }

  // Kept async so the pages can use it the same way as before
  async function history() {
    return { rows: readHistory(), demo: false, error: null };
  }

  function clearHistory() { writeHistory([]); }

  /* ---------- highlighting copied phrases ----------
     Phrases come back normalized ("heat from the sun"), the text may say
     "Heat, from the Sun". So we allow any punctuation between the words. */
  function highlight(text, phrases, tag = "mark") {
    const ranges = [];
    phrases.forEach((phrase) => {
      const words = phrase.split(" ").map((w) => w.split("").join("'?"));
      const pattern = new RegExp("(?<![a-z0-9])" + words.join("[^a-z0-9]+") + "(?![a-z0-9])", "gi");
      let match;
      while ((match = pattern.exec(text)) !== null) ranges.push([match.index, match.index + match[0].length]);
    });
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach((r) => {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push([...r]);
    });
    let html = "";
    let position = 0;
    merged.forEach(([start, end]) => {
      html += esc(text.slice(position, start)) + `<${tag}>${esc(text.slice(start, end))}</${tag}>`;
      position = end;
    });
    return html + esc(text.slice(position));
  }

  /* ---------- small helpers ---------- */
  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function level(verdict) {
    const v = String(verdict).toUpperCase();
    if (v.startsWith("HIGH")) return "high";
    if (v.startsWith("MODERATE")) return "moderate";
    if (v.startsWith("LOW")) return "low";
    return "original";
  }
  const LEVEL_LABEL = { high: "High", moderate: "Moderate", low: "Low", original: "Original" };
  function levelLabel(verdict) { return LEVEL_LABEL[level(verdict)]; }
  function wordCount(text) { return text.trim() === "" ? 0 : text.trim().split(/\s+/).length; }
  function downloadUrl(reportName, ext) { return `/api/download?name=${encodeURIComponent(reportName)}.${ext}`; }
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Animates a number from 0 up to its value, e.g. "0.0%" -> "74.7%"
  function countUp(el, to, decimals = 1, ms = 1100, suffix = "") {
    if (reduceMotion()) { el.textContent = to.toFixed(decimals) + suffix; return; }
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (to * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Elements with [data-reveal] get the class "in" when they scroll into view
  function reveal(root = document) {
    const items = $$("[data-reveal]:not(.in)", root);
    if (!("IntersectionObserver" in window) || reduceMotion()) { items.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- the Compare page: same element ids in every template ----------
     #dropZone #fileInput #browseBtn #pasteName #pasteText #addPasteBtn
     #sampleBtn #compareBtn #clearBtn #docList #message
     The template only decides how a document looks (renderDoc). */
  function bindCompare({ renderDoc, emptyHtml = "", compareLabel, busyLabel = "Comparing…", onRender }) {
    const show = (text) => { const m = $("#message"); if (m) { m.textContent = text || ""; m.classList.toggle("show", !!text); } };
    const button = $("#compareBtn");

    function render() {
      const list = docs();
      $("#docList").innerHTML = list.length === 0 ? emptyHtml : list.map((d, i) => renderDoc(d, i, wordCount(d.text))).join("");
      $$("[data-remove]", $("#docList")).forEach((b) => b.addEventListener("click", () => { removeDoc(Number(b.dataset.remove)); render(); }));
      button.disabled = list.length < MIN_DOCS;
      button.innerHTML = compareLabel(list.length, MIN_DOCS);
      if (onRender) onRender(list);
    }

    const drop = $("#dropZone");
    const input = $("#fileInput");
    $("#browseBtn").addEventListener("click", (e) => { e.stopPropagation(); input.click(); });
    drop.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => { show(await addFiles(input.files)); input.value = ""; render(); });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", async (e) => { e.preventDefault(); drop.classList.remove("over"); show(await addFiles(e.dataTransfer.files)); render(); });

    $("#addPasteBtn").addEventListener("click", () => {
      const name = $("#pasteName").value.trim() || `pasted-${docs().length + 1}.txt`;
      const problem = addDoc(name, $("#pasteText").value);
      show(problem);
      if (!problem) { $("#pasteName").value = ""; $("#pasteText").value = ""; render(); }
    });
    $("#sampleBtn").addEventListener("click", async () => { show(await loadSamples()); render(); });
    $("#clearBtn").addEventListener("click", () => { clearDocs(); show(""); render(); });
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.innerHTML = busyLabel;
      const problem = await compare();
      if (problem) { show(problem); render(); return; }
      location.href = "results.html";
    });
    render();
  }

  return {
    MIN_DOCS, MAX_DOCS, docs, addDoc, removeDoc, clearDocs, addFiles, loadSamples,
    compare, result, useDemo, history, clearHistory, highlight, esc, level, levelLabel, wordCount,
    downloadUrl, $, $$, countUp, reveal, bindCompare, reduceMotion,
  };
})();
