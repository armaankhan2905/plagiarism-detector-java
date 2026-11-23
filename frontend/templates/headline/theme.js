/* Template 4 - HEADLINE
   Kinetic typography: giant type on white, an acid-lime highlighter,
   scrolling tickers of shared words and a full-screen menu. */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [["index.html", "home", "Home"], ["compare.html", "compare", "Compare"], ["results.html", "results", "Results"], ["history.html", "history", "History"], ["method.html", "method", "Method"]];
  const current = NAV.find((n) => n[1] === page);

  function header() {
    return `
      <header class="bar">
        <a class="logo" href="index.html">COPY<span>/</span>CHECK</a>
        <span class="where">${String(NAV.indexOf(current) + 1).padStart(2, "0")} — ${current[2]}</span>
        <button class="menu-btn" id="menuBtn" aria-expanded="false">Menu <i></i></button>
      </header>
      <div class="overlay" id="overlay">
        <nav>${NAV.map(([h, id, l], i) => `<a href="${h}" class="${id === page ? "on" : ""}" style="--i:${i}"><small>0${i + 1}</small><span>${l}</span></a>`).join("")}</nav>
        <p>Plagiarism detection using word frequency · Java backend</p>
      </div>`;
  }
  function footer() {
    return `
      <footer class="foot">
        ${ticker(["Original", "Low", "Moderate", "High", "Cosine", "Jaccard", "Phrase match", "Word frequency"], "big")}
        <div class="foot-row"><a class="logo" href="index.html">COPY<span>/</span>CHECK</a>
        <div>${NAV.map(([h, , l]) => `<a href="${h}">${l}</a>`).join("")}</div><span>Java + HTML/CSS/JS</span></div>
      </footer>`;
  }
  // Endless horizontal strip of words (content is doubled so it loops seamlessly)
  function ticker(words, cls = "") {
    const strip = words.map((w) => `<span>${esc(w)}</span><b>✱</b>`).join("");
    return `<div class="ticker ${cls}" aria-hidden="true"><div>${strip}${strip}</div></div>`;
  }
  // Splits a headline into words that slide up one by one
  const split = (html) => html.split(" ").map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(" ");
  const tag = (v) => `<span class="tag ${PD.level(v)}">${PD.levelLabel(v)}</span>`;
  const head = (n, title, text) => `
    <section class="head">
      <p class="label">(${n})</p>
      <h1 class="split">${split(title)}</h1>
      ${text ? `<p class="lede" data-reveal>${text}</p>` : ""}
    </section>`;

  const views = {
    home: () => {
      const s = window.SAMPLE.results[0];
      return `
      <section class="hero">
        <h1 class="split">${split("Did they <mark>copy</mark> it?")}</h1>
        <div class="hero-row">
          <p class="lede" data-reveal>Upload two to ten documents. We count every word, compare the patterns and point at the exact phrases that were lifted. No guesswork.</p>
          <a class="round" href="compare.html" data-reveal><span>Start<br>checking</span></a>
        </div>
      </section>
      ${ticker(s.commonWords.map((w) => w.word))}
      <section class="proof">
        <p class="label" data-reveal>(Live sample)</p>
        <div class="proof-row" data-reveal>
          <div class="outline" data-count="${s.overall}" data-suffix="%">0%</div>
          <div><h2>${esc(s.documentA)}<br><span>vs</span> ${esc(s.documentB)}</h2>${tag(s.verdict)}</div>
        </div>
      </section>
      <section class="three">
        ${[["Cosine", "How often each word shows up. Same rhythm, high score.", s.cosine],
           ["Jaccard", "Which words show up at all. Same vocabulary, high score.", s.jaccard],
           ["Phrase", "Four or more words in the same order. The smoking gun.", s.phraseMatch]]
          .map(([t, d, v], i) => `<article data-reveal style="--d:${i * 120}ms"><span class="n">0${i + 1}</span><h3>${t}</h3><p>${d}</p><b>${v.toFixed(0)}<small>%</small></b></article>`).join("")}
      </section>`;
    },

    compare: () => `
      ${head("02", "Drop the <mark>evidence.</mark>", "Two to ten .txt files, up to 1 MB each.")}
      <section class="cmp">
        <div id="dropZone" class="drop" tabindex="0">
          <input type="file" id="fileInput" accept=".txt" multiple hidden>
          <span class="drop-big">DROP<br>FILES</span>
          <span class="drop-sub">.txt only — or <button type="button" id="browseBtn" class="u">browse</button></span>
        </div>
        <div class="cmp-side">
          <div class="cmp-actions"><button type="button" id="sampleBtn" class="btn">Use samples</button><button type="button" id="clearBtn" class="btn line">Clear</button></div>
          <ol id="docList" class="list"></ol>
          <details class="paste"><summary>Paste text instead +</summary>
            <input type="text" id="pasteName" placeholder="name.txt">
            <textarea id="pasteText" placeholder="Paste here"></textarea>
            <button type="button" id="addPasteBtn" class="btn">Add</button>
          </details>
          <p id="message" class="message" role="alert"></p>
          <button type="button" id="compareBtn" class="go" disabled></button>
        </div>
      </section>`,

    results: () => `${head("03", "The <mark>verdict.</mark>", "")}<p class="lede" id="lede"></p><div id="out"></div>`,
    history: () => `${head("04", "Case <mark>history.</mark>", "Every comparison the Java server saved, newest first.")}<div id="out"></div>`,

    method: () => `
      ${head("05", "How it <mark>works.</mark>", "")}
      <section class="method">
        ${[["Clean", "Lower-case. Strip punctuation. Throw away stop words like the, is, and."],
           ["Count", "A HashMap stores how many times every word appears in each document."],
           ["Cosine", "Turn the counts into vectors. Measure the angle. Small angle, similar texts."],
           ["Jaccard", "Shared words divided by all words. Pure vocabulary overlap."],
           ["Phrases", "Look for 4+ word runs that appear in both texts, in the same order."],
           ["Verdict", "Average the three. 60+ high, 35+ moderate, 15+ low, else original."]]
          .map(([t, d], i) => `<article data-reveal><span class="n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}
      </section>
      ${ticker(["Clean", "Count", "Cosine", "Jaccard", "Phrases", "Verdict"], "inv")}
      <section class="scale" data-reveal>
        ${[["original", "0–15", "Original"], ["low", "15–35", "Low"], ["moderate", "35–60", "Moderate"], ["high", "60–100", "High"]]
          .map(([c, r, l]) => `<div class="${c}"><b>${r}</b><span>${l}</span></div>`).join("")}
      </section>`,
  };

  const after = {
    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty">Nothing yet.</li>`,
      renderDoc: (d, i, words) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(d.name)}</b><small>${words}w</small><button data-remove="${i}" aria-label="Remove">✕</button></li>`,
      compareLabel: (n, min) => n < min ? `${min - n} more file${min - n > 1 ? "s" : ""}` : `Compare ${n} →`,
      busyLabel: "Checking…",
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        out.innerHTML = `<section class="none-yet" data-reveal><p class="outline">0%</p><p class="lede">Nothing checked yet.</p><div class="cmp-actions"><a class="btn" href="compare.html">Compare files</a><button class="btn line" id="demo">Show demo</button></div></section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        PD.reveal(out);
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0];
      $("#lede").innerHTML = `${data.documents.length} documents. ${data.summary.pairs} pairs. ${demo ? "<mark>Demo data.</mark>" : ""}`;
      out.innerHTML = `
        <section class="proof big" data-reveal>
          <div class="proof-row">
            <div class="outline" data-count="${top.overall}" data-suffix="%">0%</div>
            <div><p class="label">Most similar pair</p><h2>${esc(top.documentA)}<br><span>vs</span> ${esc(top.documentB)}</h2>${tag(top.verdict)}</div>
          </div>
        </section>
        <section class="stats" data-reveal>
          <div><b data-count="${data.summary.average}" data-suffix="%">0</b><span>average</span></div>
          <div><b>${data.summary.flagged}</b><span>flagged 35%+</span></div>
          <div><b>${data.summary.pairs}</b><span>pairs</span></div>
          ${demo ? "" : `<div class="dl"><a class="btn" href="${PD.downloadUrl(data.reportName, "txt")}">Report ↓</a><a class="btn line" href="${PD.downloadUrl(data.reportName, "csv")}">CSV ↓</a></div>`}
        </section>
        <section class="block" data-reveal>
          <h2 class="sec">Matrix</h2>
          <div class="scroll"><table class="mx"><tr><th></th>${data.documents.map((d, j) => `<th title="${esc(d.name)}">${String(j + 1).padStart(2, "0")}</th>`).join("")}</tr>
          ${data.matrix.map((row, i) => `<tr><th>${String(i + 1).padStart(2, "0")} ${esc(data.documents[i].name)}</th>${row.map((v, j) => i === j ? `<td class="self">/</td>` : `<td class="${v >= 35 ? "hot" : ""}" style="--v:${v}%">${v.toFixed(0)}</td>`).join("")}</tr>`).join("")}</table></div>
        </section>
        <h2 class="sec pad" data-reveal>Pair by pair</h2>
        ${data.results.map((r, i) => `
        <section class="pair" data-reveal>
          <div class="pair-top">
            <span class="n">${String(i + 1).padStart(2, "0")}</span>
            <h3>${esc(r.documentA)} <span>vs</span> ${esc(r.documentB)}</h3>
            <b class="pct">${r.overall.toFixed(1)}%</b>
            ${tag(r.verdict)}
          </div>
          <div class="bars">
            ${[["Cosine", r.cosine], ["Jaccard", r.jaccard], ["Phrase", r.phraseMatch]].map(([l, v]) => `<div><span>${l}</span><i style="--w:${Math.min(v, 100)}%"></i><b>${v.toFixed(1)}</b></div>`).join("")}
          </div>
          ${r.commonWords.length ? ticker(r.commonWords.map((w) => `${w.word} ${w.countA}/${w.countB}`), "small") : ""}
          <div class="pair-body">
            <p class="label">Copied phrases (${r.commonPhrases.length})</p>
            ${r.commonPhrases.length ? `<div class="phrases">${r.commonPhrases.slice(0, 8).map((p) => `<span>“${esc(p)}”</span>`).join("")}</div>
              <button class="btn" data-hl="${i}">Show me where</button><div class="sbs" hidden></div>` : `<p class="lede">No four-word phrase in common. Clean.</p>`}
          </div>
        </section>`).join("")}
        <h2 class="sec pad" data-reveal>Top words</h2>
        <section class="top-words">${data.documents.map((d, i) => `
          <div data-reveal><p class="label">${String(i + 1).padStart(2, "0")} — ${d.totalWords} words · ${d.uniqueKeywords} unique</p><h3>${esc(d.name)}</h3>
          <ol>${d.topWords.map((w) => `<li><span>${esc(w.word)}</span><b>${w.count}</b></li>`).join("")}</ol></div>`).join("")}</section>
        ${data.reportText ? `<section class="block" data-reveal><details><summary>Full text report +</summary><pre>${esc(data.reportText)}</pre></details></section>` : ""}`;

      $$("[data-hl]").forEach((btn) => btn.addEventListener("click", () => {
        const r = data.results[Number(btn.dataset.hl)];
        const box = btn.nextElementSibling;
        if (!box.innerHTML) box.innerHTML = [r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("");
        box.hidden = !box.hidden;
        btn.textContent = box.hidden ? "Show me where" : "Hide";
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="lede">Loading…</p>`;
      const { rows, demo, error } = await PD.history();
      if (error) { out.innerHTML = `<p class="lede">${esc(error)}</p>`; return; }
      if (!rows.length) { out.innerHTML = `<p class="lede">Empty. <a href="compare.html">Run a check.</a></p>`; return; }
      out.innerHTML = (demo ? `<p class="lede"><mark>Server offline — demo history.</mark></p>` : "") + `<section class="hist">` +
        rows.map((h, i) => `
          <article data-reveal>
            <span class="n">${String(rows.length - i).padStart(2, "0")}</span>
            <b class="pct">${h.highestSimilarity.toFixed(0)}<small>%</small></b>
            <div><h3>${esc(h.mostSimilarPair)}</h3><p>${esc(h.date)} · ${h.documentCount} docs · ${esc(h.documentNames)}</p></div>
            ${tag(h.verdict)}
            <div class="dl">${demo ? "" : `<a href="${PD.downloadUrl(h.reportName, "txt")}">TXT</a><a href="${PD.downloadUrl(h.reportName, "csv")}">CSV</a>`}</div>
          </article>`).join("") + `</section>`;
      PD.reveal(out);
    },
  };

  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();

  // menu
  const btn = $("#menuBtn");
  btn.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("menu-open"); });

  // numbers count up when they appear
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    PD.countUp(el, Number(el.dataset.count), el.classList.contains("outline") ? 1 : 1, 1300, el.dataset.suffix || "");
    io.unobserve(el);
  })) : null;
  $$("[data-count]").forEach((el) => io ? io.observe(el) : (el.textContent = Number(el.dataset.count).toFixed(1) + (el.dataset.suffix || "")));

  requestAnimationFrame(() => document.body.classList.add("ready"));
  PD.reveal();
})();
