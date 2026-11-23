/* Template 2 - BLUEPRINT
   A technical drawing on white paper: fine grid, crop marks, dimension lines,
   monospace labels and an analogue dial for every similarity score. */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [["index.html", "home", "Overview"], ["compare.html", "compare", "Input"], ["results.html", "results", "Analysis"], ["history.html", "history", "Log"], ["method.html", "method", "Spec"]];
  const sheet = NAV.findIndex((n) => n[1] === page) + 1;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function header() {
    return `
      <header class="hd">
        <a class="logo" href="index.html"><b>PD</b><span>Plagiarism<br>Detector</span></a>
        <nav>${NAV.map(([h, id, l], i) => `<a href="${h}" class="${id === page ? "on" : ""}"><small>0${i + 1}</small>${l}</a>`).join("")}</nav>
        <div class="sheet">SHEET <b>${sheet}</b>/5<span>REV 3.0</span></div>
      </header>`;
  }
  function footer() {
    return `
      <footer class="ft">
        <div class="tb">
          <div><small>PROJECT</small>Plagiarism detection using word frequency</div>
          <div><small>BACKEND</small>Java · com.sun.net.httpserver</div>
          <div><small>FRONTEND</small>HTML · CSS · JavaScript</div>
          <div><small>SHEET</small>${sheet} of 5</div>
        </div>
      </footer>`;
  }
  // Half-circle dial with tick marks and a needle that swings to the value
  function dial(p, size = "") {
    const ticks = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (1 - i / 20);
      const r1 = i % 5 === 0 ? 74 : 80;
      ticks.push(`<line x1="${100 + Math.cos(a) * r1}" y1="${100 - Math.sin(a) * r1}" x2="${100 + Math.cos(a) * 88}" y2="${100 - Math.sin(a) * 88}"/>`);
    }
    const arc = (from, to, cls) => {
      const a1 = Math.PI * (1 - from / 100), a2 = Math.PI * (1 - to / 100), r = 94;
      return `<path class="${cls}" d="M${100 + Math.cos(a1) * r} ${100 - Math.sin(a1) * r} A${r} ${r} 0 0 1 ${100 + Math.cos(a2) * r} ${100 - Math.sin(a2) * r}"/>`;
    };
    return `
      <div class="dial ${size}">
        <svg viewBox="0 0 200 112" aria-hidden="true">
          ${arc(0, 15, "z-original")}${arc(15, 35, "z-low")}${arc(35, 60, "z-moderate")}${arc(60, 100, "z-high")}
          <g class="ticks">${ticks.join("")}</g>
          <text x="10" y="110">0</text><text x="96" y="8">50</text><text x="180" y="110">100</text>
          <g class="needle" style="--a:${(Math.min(p, 100) / 100) * 180 - 90}deg"><line x1="100" y1="100" x2="100" y2="26"/><circle cx="100" cy="100" r="6"/></g>
        </svg>
        <div class="dial-val"><span data-count="${p}">0.0</span>%</div>
      </div>`;
  }
  // A bar drawn like a dimension line: |<------ 74.6% ------>|
  const dim = (label, v, note) => `
    <div class="dim"><div class="dim-l"><b>${label}</b><small>${note}</small></div>
      <div class="dim-track"><i style="--w:${Math.min(v, 100)}%"><em>${v.toFixed(1)}%</em></i></div></div>`;
  const tag = (verdict) => `<span class="tag ${PD.level(verdict)}">${PD.levelLabel(verdict)}</span>`;
  const head = (ref, title, text) => `
    <section class="ph"><div class="ref">REF ${ref}</div><h1 data-reveal>${title}</h1>${text ? `<p data-reveal>${text}</p>` : ""}</section>`;

  const views = {
    home: () => {
      const s = window.SAMPLE.results[0];
      return `
      <section class="hero">
        <div class="hero-copy">
          <div class="ref">REF 01 · OVERVIEW</div>
          <h1 data-reveal>Measure<br>every <span class="hl">word.</span></h1>
          <p data-reveal>An engineering-grade look at two texts. Word frequencies are counted, vectors compared, and copied phrases traced back to the line they came from.</p>
          <div class="cta" data-reveal><a class="btn" href="compare.html">Start analysis ⟶</a><a class="btn line" href="method.html">Read the spec</a></div>
        </div>
        <div class="hero-draw card" data-reveal>
          <span class="card-label">FIG. 1 — ${esc(s.documentA)} × ${esc(s.documentB)}</span>
          <svg class="docs" viewBox="0 0 420 200" aria-hidden="true">
            <rect x="20" y="20" width="120" height="160"/><rect x="280" y="20" width="120" height="160"/>
            ${[50, 70, 90, 110, 130, 150].map((y, i) => `<line x1="34" y1="${y}" x2="${i % 2 ? 110 : 126}" y2="${y}" class="t"/><line x1="294" y1="${y}" x2="${i % 3 ? 386 : 360}" y2="${y}" class="t"/>`).join("")}
            <line x1="34" y1="90" x2="126" y2="90" class="c"/><line x1="294" y1="110" x2="386" y2="110" class="c"/>
            <path d="M126 90 C 200 90, 220 110, 294 110" class="link"/>
            <line x1="140" y1="190" x2="280" y2="190" class="dl"/><line x1="140" y1="184" x2="140" y2="196" class="dl"/><line x1="280" y1="184" x2="280" y2="196" class="dl"/>
            <text x="210" y="186" text-anchor="middle">${s.overall.toFixed(2)}% overall</text>
          </svg>
          ${dial(s.overall)}
        </div>
      </section>
      <section class="specs">
        ${[["COS", "Cosine", "Angle between two word-frequency vectors.", s.cosine],
           ["JAC", "Jaccard", "Shared vocabulary over total vocabulary.", s.jaccard],
           ["PHR", "Phrase match", "Words covered by 4+ word copied runs.", s.phraseMatch]]
          .map(([c, t, d, v], i) => `<article class="card" data-reveal style="--d:${i * 100}ms"><span class="card-label">${c}-0${i + 1}</span><h3>${t}</h3><p>${d}</p>${dim("Sample", v, "original × copied")}</article>`).join("")}
      </section>
      <section class="strip" data-reveal>
        <div><b>2–10</b><span>documents per run</span></div>
        <div><b>4</b><span>words = one phrase</span></div>
        <div><b>3</b><span>independent measures</span></div>
        <div><b>4</b><span>server threads</span></div>
      </section>`;
    },

    compare: () => `
      ${head("02 · INPUT", "Load the <span class='hl'>specimens.</span>", "Two to ten .txt documents, 1 MB each. Every pair will be measured.")}
      <section class="bench">
        <div class="card">
          <span class="card-label">INPUT A — FILES</span>
          <div id="dropZone" class="drop" tabindex="0">
            <input type="file" id="fileInput" accept=".txt" multiple hidden>
            <svg viewBox="0 0 80 90" aria-hidden="true"><path d="M10 5 H52 L70 23 V85 H10 Z M52 5 V23 H70"/><path d="M40 70 V38 M28 50 L40 38 L52 50" class="arrow"/></svg>
            <p><b>Drop .txt files here</b></p>
            <button type="button" id="browseBtn" class="btn line small">Browse files</button>
          </div>
          <div class="cta"><button type="button" id="sampleBtn" class="btn line small">Load sample set</button><button type="button" id="clearBtn" class="btn ghost small">Clear</button></div>
          <span class="card-label second">INPUT B — PASTE</span>
          <div class="paste">
            <input type="text" id="pasteName" placeholder="name.txt">
            <textarea id="pasteText" placeholder="Paste text…"></textarea>
            <button type="button" id="addPasteBtn" class="btn line small">Add document</button>
          </div>
          <p id="message" class="message" role="alert"></p>
        </div>
        <div class="card queue">
          <span class="card-label">QUEUE</span>
          <div class="queue-head"><span>ID</span><span>FILE</span><span>WORDS</span><span></span></div>
          <ul id="docList"></ul>
          <div class="pairs-note" id="pairsNote"></div>
          <button type="button" id="compareBtn" class="btn wide" disabled></button>
        </div>
      </section>`,

    results: () => `${head("03 · ANALYSIS", "Analysis <span class='hl'>report.</span>", "")}<p class="sub" id="sub"></p><div id="out"></div>`,
    history: () => `${head("04 · LOG", "Revision <span class='hl'>log.</span>", "Read from this browser’s localStorage.")}<div id="out"></div>`,

    method: () => `
      ${head("05 · SPEC", "System <span class='hl'>spec.</span>", "What happens between pressing Compare and seeing a number.")}
      <section class="flow">
        ${[["01", "READ", "DocumentReader", "Loads each .txt file, rejects empty or invalid ones."],
           ["02", "NORMALIZE", "TextNormalizer", "Lower-case, strip punctuation, drop stop words."],
           ["03", "COUNT", "WordFrequencyCounter", "HashMap of word → count for every document."],
           ["04", "MEASURE", "SimilarityCalculator", "Cosine and Jaccard similarity, 0–100%."],
           ["05", "TRACE", "PhraseFinder", "Shared runs of 4+ words, and the share of words they cover."],
           ["06", "REPORT", "ReportGenerator", "Verdict, .txt report, .csv table and history entry."]]
          .map(([n, t, c, d], i) => `<article class="card node" data-reveal style="--d:${i * 90}ms"><span class="card-label">STEP ${n}</span><h3>${t}</h3><code>${c}.java</code><p>${d}</p></article>`).join("")}
      </section>
      <section class="card formula" data-reveal>
        <span class="card-label">EQ. 1 — OVERALL SCORE</span>
        <p class="eq">overall = ( cosine + jaccard + phrase ) ÷ 3</p>
        <div class="zones"><span class="original">ORIGINAL &lt;15</span><span class="low">LOW 15–35</span><span class="moderate">MODERATE 35–60</span><span class="high">HIGH ≥60</span></div>
        <div class="dial-row">${[8, 25, 48, 82].map((v) => dial(v, "sm")).join("")}</div>
      </section>`,
  };

  const after = {
    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty">— queue empty —</li>`,
      renderDoc: (d, i, words) => `<li><span>${LETTERS[i]}</span><span class="nm">${esc(d.name)}</span><span>${words}</span><button data-remove="${i}" aria-label="Remove">✕</button></li>`,
      compareLabel: (n, min) => n < min ? `NEED ${min - n} MORE` : `RUN ANALYSIS · ${n} DOCS ⟶`,
      busyLabel: `<span class="spin"></span>MEASURING…`,
      onRender: (list) => { const n = list.length; $("#pairsNote").textContent = n >= 2 ? `${n} documents → ${(n * (n - 1)) / 2} pairs will be measured` : ""; },
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        $("#sub").textContent = "";
        out.innerHTML = `<section class="card empty" data-reveal><span class="card-label">NO DATA</span>${dial(0)}<p>No analysis has been run in this session.</p><div class="cta"><a class="btn" href="compare.html">Go to input</a><button class="btn line" id="demo">Load demo analysis</button></div></section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        PD.reveal(out);
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0];
      const docs = data.documents;
      $("#sub").innerHTML = `${docs.length} specimens · ${data.summary.pairs} pairs ${demo ? "· <b>DEMO DATA</b>" : `· ${esc(data.reportName)}`}`;
      out.innerHTML = `
        <section class="summary">
          <div class="card big" data-reveal>
            <span class="card-label">PEAK — ${esc(top.documentA)} × ${esc(top.documentB)}</span>
            ${dial(top.overall)}
            ${tag(top.verdict)}
          </div>
          <div class="card" data-reveal>
            <span class="card-label">SPEC SHEET</span>
            <table class="kv">
              <tr><th>Documents</th><td>${docs.length}</td></tr>
              <tr><th>Pairs</th><td>${data.summary.pairs}</td></tr>
              <tr><th>Average</th><td>${data.summary.average.toFixed(2)}%</td></tr>
              <tr><th>Flagged ≥35%</th><td>${data.summary.flagged}</td></tr>
              <tr><th>Peak</th><td>${top.overall.toFixed(2)}%</td></tr>
            </table>
            ${demo ? "" : `<div class="cta"><a class="btn small" href="${PD.downloadUrl(data.reportName, "txt")}">REPORT .TXT ↓</a><a class="btn line small" href="${PD.downloadUrl(data.reportName, "csv")}">TABLE .CSV ↓</a></div>`}
          </div>
        </section>
        <section class="card" data-reveal>
          <span class="card-label">FIG. 2 — SIMILARITY MATRIX</span>
          <div class="scroll"><table class="matrix"><tr><th></th>${docs.map((d, j) => `<th title="${esc(d.name)}">${LETTERS[j]}</th>`).join("")}</tr>
          ${data.matrix.map((row, i) => `<tr><th><b>${LETTERS[i]}</b> ${esc(docs[i].name)}</th>${row.map((v, j) => i === j ? `<td class="self"></td>` :
            `<td style="--v:${(v / 100).toFixed(3)}"><span>${v.toFixed(1)}</span></td>`).join("")}</tr>`).join("")}</table></div>
        </section>
        ${data.results.map((r, i) => `
        <section class="card detail" data-reveal>
          <span class="card-label">DETAIL ${String(i + 1).padStart(2, "0")} — ${esc(r.documentA)} × ${esc(r.documentB)}</span>
          <div class="detail-grid">
            <div class="detail-dial">${dial(r.overall, "sm")}${tag(r.verdict)}</div>
            <div>
              ${dim("Cosine", r.cosine, "frequency")}${dim("Jaccard", r.jaccard, "vocabulary")}${dim("Phrase", r.phraseMatch, "word order")}
            </div>
          </div>
          <div class="two">
            <div><h4>COMMON WORDS · ${r.commonWordCount}</h4><div class="chips">${r.commonWords.length ? r.commonWords.map((w) => `<span>${esc(w.word)}<i>${w.countA}:${w.countB}</i></span>`).join("") : "<em>none</em>"}</div></div>
            <div><h4>COPIED PHRASES · ${r.commonPhrases.length}</h4>${r.commonPhrases.length ? `<ol class="phr">${r.commonPhrases.slice(0, 8).map((p) => `<li>${esc(p)}</li>`).join("")}</ol>` : "<em>No 4-word run shared.</em>"}</div>
          </div>
          ${r.commonPhrases.length ? `<button class="btn line small" data-hl="${i}">OVERLAY SOURCE TEXT</button><div class="sbs" hidden></div>` : ""}
        </section>`).join("")}
        <section class="card" data-reveal>
          <span class="card-label">FIG. 3 — WORD FREQUENCY</span>
          <div class="freq">${docs.map((d, i) => {
            const max = d.topWords.length ? d.topWords[0].count : 1;
            return `<div><h4>${LETTERS[i]} · ${esc(d.name)}</h4><small>${d.totalWords} words · ${d.uniqueKeywords} unique</small>
              ${d.topWords.map((w) => `<div class="fr"><span>${esc(w.word)}</span><i style="--w:${(w.count / max) * 100}%"></i><b>${w.count}</b></div>`).join("")}</div>`;
          }).join("")}</div>
        </section>
        ${data.reportText ? `<section class="card" data-reveal><span class="card-label">APPENDIX — TEXT REPORT</span><details><summary>Expand</summary><pre>${esc(data.reportText)}</pre></details></section>` : ""}`;

      $$("[data-count]", out).forEach((el) => PD.countUp(el, Number(el.dataset.count)));
      $$("[data-hl]").forEach((btn) => btn.addEventListener("click", () => {
        const r = data.results[Number(btn.dataset.hl)];
        const box = btn.nextElementSibling;
        if (!box.innerHTML) box.innerHTML = [r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("");
        box.hidden = !box.hidden;
        btn.textContent = box.hidden ? "OVERLAY SOURCE TEXT" : "HIDE OVERLAY";
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="sub">Reading log…</p>`;
      const { rows, demo, error } = await PD.history();
      if (error) { out.innerHTML = `<p class="sub">${esc(error)}</p>`; return; }
      if (!rows.length) { out.innerHTML = `<p class="sub">Log is empty. <a href="compare.html">Run an analysis.</a></p>`; return; }
      out.innerHTML = `<section class="card" data-reveal><span class="card-label">${demo ? "DEMO LOG — SERVER OFFLINE" : "LOG — browser localStorage"}</span>
        <div class="scroll"><table class="log"><tr><th>#</th><th>TIMESTAMP</th><th>DOCS</th><th>PEAK PAIR</th><th>PEAK</th><th>VERDICT</th><th>FILES</th></tr>
        ${rows.map((h, i) => `<tr><td>${String(rows.length - i).padStart(3, "0")}</td><td>${esc(h.date)}</td><td title="${esc(h.documentNames)}">${h.documentCount}</td><td>${esc(h.mostSimilarPair)}</td>
          <td><span class="mini"><i style="--w:${Math.min(h.highestSimilarity, 100)}%"></i></span>${h.highestSimilarity.toFixed(1)}%</td><td>${tag(h.verdict)}</td>
          <td>${demo ? "—" : `<a href="${PD.downloadUrl(h.reportName, "txt")}">txt</a> <a href="${PD.downloadUrl(h.reportName, "csv")}">csv</a>`}</td></tr>`).join("")}
        </table></div></section>`;
      PD.reveal(out);
    },
  };

  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();
  $$(".hero [data-count], .formula [data-count], .specs [data-count]").forEach((el) => PD.countUp(el, Number(el.dataset.count)));
  PD.reveal();
})();
