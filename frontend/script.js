/* ============================================================
   Plagiarism Detector - frontend logic

   The page only COLLECTS documents and SHOWS results.
   All the real work (normalizing, comparing, phrases, report)
   is done by the Java backend at POST /api/compare.
   ============================================================ */

// ---------- settings (same limits as the Java side) ----------
const MIN_DOCS = 2;
const MAX_DOCS = 10;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const SAMPLE_FILES = ["original.txt", "copied.txt", "different.txt"];
const MAX_PHRASES_SHOWN = 8;

// ---------- state ----------
// Every document the user added: { name: "essay.txt", text: "..." }
let documents = [];
// Copy of the texts used in the LAST comparison (needed to highlight copied phrases)
let comparedTexts = {};

// Short helper to find an element by id
const $ = (id) => document.getElementById(id);


/* ============================================================
   1. ADDING DOCUMENTS
   ============================================================ */

function addDocument(name, text) {
  if (documents.length >= MAX_DOCS) {
    showMessage(`You can compare at most ${MAX_DOCS} documents.`);
    return false;
  }
  if (text.trim() === "") {
    showMessage(`"${name}" is empty.`);
    return false;
  }
  documents.push({ name: uniqueName(name), text: text });
  renderDocumentList();
  return true;
}

// If the name already exists, add (2), (3) ... so every document has its own name
function uniqueName(name) {
  let result = name;
  let counter = 2;
  while (documents.some((d) => d.name === result)) {
    result = name.replace(/(\.txt)?$/i, ` (${counter})$1`);
    counter++;
  }
  return result;
}

// Files chosen with "browse" or dropped on the drop zone
async function handleFiles(fileList) {
  showMessage("");
  const errors = [];

  for (const file of fileList) {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      errors.push(`${file.name}: only .txt files are allowed`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: larger than 1 MB`);
      continue;
    }
    const text = await file.text();
    if (!addDocument(file.name, text)) {
      return; // limit reached or empty file, message already shown
    }
  }

  if (errors.length > 0) {
    showMessage(errors.join(" · "));
  }
}

async function loadSamples() {
  showMessage("");
  for (const fileName of SAMPLE_FILES) {
    const response = await fetch(`/samples/${fileName}`);
    if (!response.ok) {
      showMessage(`Could not load sample ${fileName}. Is the Java server running?`);
      return;
    }
    if (!addDocument(fileName, await response.text())) {
      return;
    }
  }
}

function addPastedDocument() {
  const name = $("pasteName").value.trim() || `pasted-${documents.length + 1}.txt`;
  const text = $("pasteText").value;
  if (addDocument(name, text)) {
    $("pasteName").value = "";
    $("pasteText").value = "";
    $("pasteBox").classList.add("hidden");
    showMessage("");
  }
}

function removeDocument(index) {
  documents.splice(index, 1);
  renderDocumentList();
}

function renderDocumentList() {
  const list = $("docList");
  list.innerHTML = "";

  documents.forEach((doc, index) => {
    const wordCount = doc.text.trim().split(/\s+/).length;
    const item = document.createElement("li");
    item.innerHTML = `
      <div class="doc-icon">D${index + 1}</div>
      <div class="doc-info">
        <div class="doc-name">${escapeHtml(doc.name)}</div>
        <div class="doc-meta">${wordCount} words</div>
      </div>
      <button class="remove-btn" title="Remove">&times;</button>`;
    item.querySelector(".remove-btn").addEventListener("click", () => removeDocument(index));
    list.appendChild(item);
  });

  const compareButton = $("compareBtn");
  compareButton.disabled = documents.length < MIN_DOCS;
  compareButton.textContent = documents.length < MIN_DOCS
    ? `Add at least ${MIN_DOCS - documents.length} more document(s)`
    : `Compare ${documents.length} documents`;
}


/* ============================================================
   2. SENDING DOCUMENTS TO THE JAVA SERVER
   ============================================================ */

// Builds the text format that RequestParser.java understands:
//   ===DOCUMENT: name.txt
//   text...
function buildRequestBody() {
  return documents
    .map((doc) => `===DOCUMENT: ${doc.name}\n${doc.text}\n`)
    .join("");
}

async function compareDocuments() {
  setLoading(true);
  showMessage("");

  try {
    const response = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
      body: buildRequestBody(),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Something went wrong.");
      return;
    }

    // Remember the texts so we can highlight copied phrases later
    comparedTexts = {};
    documents.forEach((doc) => (comparedTexts[doc.name] = doc.text));

    renderResults(data);
    loadHistory(); // the new comparison is now in the history
  } catch (error) {
    showMessage("Could not reach the Java server. Start it with run-server.bat and reload the page.");
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  const button = $("compareBtn");
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span>Comparing...`;
  } else {
    renderDocumentList(); // restores the normal button text
  }
}


/* ============================================================
   3. SHOWING THE RESULTS
   ============================================================ */

function renderResults(data) {
  renderSummary(data);
  renderMatrix(data.documents, data.matrix);
  renderPairs(data.results);
  renderTopWords(data.documents);
  $("reportText").textContent = data.reportText;

  $("results").classList.remove("hidden");
  $("results").scrollIntoView({ behavior: "smooth" });
}

function renderSummary(data) {
  const top = data.results[0]; // results come sorted, most similar first
  const level = verdictLevel(top.verdict);

  $("summaryCards").innerHTML = `
    ${statCard("Documents", data.documents.length, "")}
    ${statCard("Pairs compared", data.summary.pairs, "")}
    ${statCard("Average similarity", data.summary.average.toFixed(2) + "%", "")}
    ${statCard("Flagged pairs", data.summary.flagged, "35% or more")}
    ${statCard("Most similar pair",
        `<span class="text-${level}">${top.overall.toFixed(2)}%</span>`,
        `${escapeHtml(top.documentA)} vs ${escapeHtml(top.documentB)}`)}`;

  const name = encodeURIComponent(data.reportName);
  $("downloadRow").innerHTML = `
    <a class="btn primary small" href="/api/download?name=${name}.txt">Download report (.txt)</a>
    <a class="btn secondary small" href="/api/download?name=${name}.csv">Download table (.csv)</a>`;
}

function statCard(label, value, sub) {
  return `
    <div class="stat">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-sub">${sub}</div>
    </div>`;
}

function renderMatrix(docs, matrix) {
  let html = `<table class="matrix"><tr><th></th>`;
  docs.forEach((d, j) => (html += `<th title="${escapeHtml(d.name)}">D${j + 1}</th>`));
  html += `</tr>`;

  matrix.forEach((row, i) => {
    html += `<tr><th class="row-head">D${i + 1} &middot; ${escapeHtml(docs[i].name)}</th>`;
    row.forEach((value, j) => {
      if (i === j) {
        html += `<td class="self">&mdash;</td>`;
      } else {
        html += `<td style="background:${heatColor(value)}">${value.toFixed(1)}%</td>`;
      }
    });
    html += `</tr>`;
  });

  $("matrix").innerHTML = html + `</table>`;
}

// 0% -> green, 100% -> red
function heatColor(percent) {
  const hue = 120 - Math.min(percent, 100) * 1.2;
  return `hsl(${hue}, 75%, 85%)`;
}

function renderPairs(results) {
  const container = $("pairs");
  container.innerHTML = "";

  results.forEach((r) => {
    const level = verdictLevel(r.verdict);
    const pair = document.createElement("div");
    pair.className = "pair";

    const wordChips = r.commonWords.length === 0
      ? `<span class="none">No common words</span>`
      : r.commonWords
          .map((w) => `<span class="chip">${escapeHtml(w.word)}<small>${w.countA}/${w.countB}</small></span>`)
          .join("");

    const phraseItems = r.commonPhrases.length === 0
      ? `<span class="none">No common phrases (4+ words in a row)</span>`
      : `<ol class="phrases">${r.commonPhrases
          .slice(0, MAX_PHRASES_SHOWN)
          .map((p) => `<li>"${escapeHtml(p)}"</li>`)
          .join("")}</ol>`;

    pair.innerHTML = `
      <div class="pair-head">
        <div class="pair-title">${escapeHtml(r.documentA)}<span class="vs">vs</span>${escapeHtml(r.documentB)}</div>
        <div class="pair-score">
          <span class="pair-percent text-${level}">${r.overall.toFixed(2)}%</span>
          <span class="badge ${level}">${escapeHtml(r.verdict)}</span>
        </div>
      </div>

      <div class="metrics">
        ${metricRow("Cosine similarity", "how often words are used", r.cosine)}
        ${metricRow("Jaccard similarity", "which words are shared", r.jaccard)}
        ${metricRow("Phrase match", "copied word order", r.phraseMatch)}
      </div>

      <div class="sub-title">Common words (${r.commonWordCount})
        <span class="hint">&middot; count in ${escapeHtml(r.documentA)} / ${escapeHtml(r.documentB)}</span></div>
      <div class="chips">${wordChips}</div>

      <div class="sub-title">Common phrases (${r.commonPhrases.length})</div>
      ${phraseItems}

      ${r.commonPhrases.length > 0
        ? `<button class="btn secondary small highlight-btn">Highlight copied text</button>
           <div class="side-by-side hidden"></div>`
        : ""}`;

    // "Highlight copied text" button: builds the side-by-side view the first time it is opened
    const button = pair.querySelector(".highlight-btn");
    if (button) {
      const view = pair.querySelector(".side-by-side");
      button.addEventListener("click", () => {
        if (view.innerHTML === "") {
          view.innerHTML = `
            <div class="doc-text"><h4>${escapeHtml(r.documentA)}</h4>${highlightPhrases(comparedTexts[r.documentA], r.commonPhrases)}</div>
            <div class="doc-text"><h4>${escapeHtml(r.documentB)}</h4>${highlightPhrases(comparedTexts[r.documentB], r.commonPhrases)}</div>`;
        }
        view.classList.toggle("hidden");
        button.textContent = view.classList.contains("hidden") ? "Highlight copied text" : "Hide highlighted text";
      });
    }

    container.appendChild(pair);
  });
}

function metricRow(name, description, value) {
  return `
    <div class="metric">
      <div class="metric-name">${name}<small>${description}</small></div>
      <div class="bar"><div class="bar-fill" style="width:${Math.min(value, 100)}%"></div></div>
      <div class="metric-value">${value.toFixed(2)}%</div>
    </div>`;
}

function renderTopWords(docs) {
  $("topWords").innerHTML = docs.map((doc, i) => {
    const max = doc.topWords.length > 0 ? doc.topWords[0].count : 1;
    const rows = doc.topWords.map((w) => `
      <div class="word-row">
        <span>${escapeHtml(w.word)}</span>
        <div class="bar"><div class="bar-fill" style="width:${(w.count / max) * 100}%"></div></div>
        <span>${w.count}</span>
      </div>`).join("");

    return `
      <div class="top-words">
        <h3>D${i + 1} &middot; ${escapeHtml(doc.name)}</h3>
        <div class="hint">${doc.totalWords} words &middot; ${doc.uniqueKeywords} unique keywords</div>
        ${rows}
      </div>`;
  }).join("");
}


/* ============================================================
   4. HIGHLIGHTING COPIED PHRASES IN THE ORIGINAL TEXT

   The server sends phrases in normalized form ("heat from the sun").
   The original text may have capitals and punctuation ("Heat, from the Sun").
   So for each phrase we build a regular expression that allows ANY
   punctuation/spaces between the words, and find it in the original text.
   ============================================================ */

function highlightPhrases(text, phrases) {
  // 1. find the [start, end] position of every phrase in the text
  const ranges = [];
  phrases.forEach((phrase) => {
    const words = phrase.split(" ").map((w) => w.split("").join("'?")); // "dont" also matches "don't"
    const pattern = new RegExp("(?<![a-z0-9])" + words.join("[^a-z0-9]+") + "(?![a-z0-9])", "gi");
    let match;
    while ((match = pattern.exec(text)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  });

  // 2. sort and merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  ranges.forEach((range) => {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([...range]);
    }
  });

  // 3. build the HTML: normal text is escaped, copied parts go inside <mark>
  let html = "";
  let position = 0;
  merged.forEach(([start, end]) => {
    html += escapeHtml(text.slice(position, start));
    html += `<mark>${escapeHtml(text.slice(start, end))}</mark>`;
    position = end;
  });
  html += escapeHtml(text.slice(position));
  return html;
}


/* ============================================================
   5. HISTORY OF PAST COMPARISONS (GET /api/history)
   ============================================================ */

async function loadHistory() {
  const container = $("history");
  try {
    const response = await fetch("/api/history");
    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = `<span class="none">${escapeHtml(data.error || "Could not load history.")}</span>`;
      return;
    }
    if (data.history.length === 0) {
      container.innerHTML = `<span class="none">No comparisons yet.</span>`;
      return;
    }

    const rows = data.history.map((h) => {
      const name = encodeURIComponent(h.reportName);
      const level = verdictLevel(h.verdict);
      return `
        <tr>
          <td>${escapeHtml(h.date)}</td>
          <td>${h.documentCount}<div class="names">${escapeHtml(h.documentNames)}</div></td>
          <td>${escapeHtml(h.mostSimilarPair)}</td>
          <td><b class="text-${level}">${h.highestSimilarity.toFixed(2)}%</b></td>
          <td><span class="badge ${level}">${escapeHtml(h.verdict)}</span></td>
          <td>
            <a href="/api/download?name=${name}.txt">.txt</a>
            <a href="/api/download?name=${name}.csv">.csv</a>
          </td>
        </tr>`;
    }).join("");

    container.innerHTML = `
      <table class="history-table">
        <tr><th>Date</th><th>Documents</th><th>Most similar pair</th><th>Highest</th><th>Verdict</th><th>Report</th></tr>
        ${rows}
      </table>`;
  } catch (error) {
    container.innerHTML = `<span class="none">Could not reach the Java server.</span>`;
  }
}


/* ============================================================
   6. SMALL HELPERS
   ============================================================ */

// "HIGH plagiarism" -> "high" (used as a CSS class for colours)
function verdictLevel(verdict) {
  if (verdict.startsWith("HIGH")) return "high";
  if (verdict.startsWith("MODERATE")) return "moderate";
  if (verdict.startsWith("LOW")) return "low";
  return "original";
}

// Stops text like "<script>" inside a document from being treated as HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showMessage(text, type = "error") {
  const message = $("message");
  message.textContent = text;
  message.className = "message " + type;
}

function clearAll() {
  documents = [];
  comparedTexts = {};
  renderDocumentList();
  $("results").classList.add("hidden");
  showMessage("");
}


/* ============================================================
   7. CONNECTING BUTTONS AND EVENTS
   ============================================================ */

const dropZone = $("dropZone");
const fileInput = $("fileInput");

$("browseBtn").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
  fileInput.value = ""; // allows choosing the same file again
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault(); // needed, otherwise the browser opens the file
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");
  handleFiles(event.dataTransfer.files);
});

$("pasteToggleBtn").addEventListener("click", () => $("pasteBox").classList.toggle("hidden"));
$("addPasteBtn").addEventListener("click", addPastedDocument);
$("sampleBtn").addEventListener("click", loadSamples);
$("compareBtn").addEventListener("click", compareDocuments);
$("clearBtn").addEventListener("click", clearAll);

renderDocumentList();
loadHistory();
