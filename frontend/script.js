/* ============================================================
   COPYSCOPE - the website (all five pages)

   Every page has the same <body data-page="..."> shell. This file builds
   the header, the page content and the footer, then connects the buttons.
   The real work (reading, comparing, reports) is done by the
   Java backend; shared/core.js talks to it.
   ============================================================ */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [
    ["index.html", "home", "Home"],
    ["compare.html", "compare", "Compare"],
    ["results.html", "results", "Results"],
    ["history.html", "history", "History"],
    ["method.html", "method", "How it works"],
  ];
  const EXAMPLES = [["Original", 0], ["Copied", 1], ["Different", 2]];

  /* ============================================================
     SHARED PIECES
     ============================================================ */
  const ICON = {
    logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 6h11l-4 10h10L9 28l3-9H4z" fill="currentColor"/><circle cx="24" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
    send: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10l14-7-5 15-2.5-6z" fill="currentColor"/></svg>`,
    up: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M5 8l5-5 5 5M3 15v2h14v-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    check: `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6 10l3 3 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
    arrow: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  function header() {
    return `
      <div class="nav-wrap">
        <header class="nav">
          <a class="brand" href="index.html"><span class="brand-ic">${ICON.logo}</span>Copyscope<span class="dot">.</span></a>
          <nav id="menu">${NAV.map(([href, id, label]) => `<a href="${href}" class="${id === page ? "on" : ""}">${label}</a>`).join("")}</nav>
          <div class="nav-right">
            <span class="status" id="status"><i></i>Server</span>
            <a class="btn orange sm" href="compare.html">Start checking</a>
            <button class="burger" aria-label="Menu" onclick="document.body.classList.toggle('open')"><i></i><i></i></button>
          </div>
        </header>
      </div>`;
  }

  function footer() {
    return `
      <footer class="foot">
        <div class="foot-in">
          <div class="foot-brand">
            <a class="brand" href="index.html"><span class="brand-ic">${ICON.logo}</span>Copyscope<span class="dot">.</span></a>
            <p>Plagiarism detection using word frequency. A Java project.</p>
          </div>
          <div><h4>Product</h4><a href="compare.html">Compare documents</a><a href="results.html">Latest results</a><a href="history.html">History</a></div>
          <div><h4>Learn</h4><a href="method.html">How it works</a><a href="method.html#scale">Verdict scale</a><a href="method.html#measures">The three measures</a></div>
          <div><h4>Limits</h4><span>2 – 10 documents</span><span>.txt files, 1 MB each</span><span>Phrases of 4+ words</span></div>
        </div>
        <div class="foot-base"><span>© Copyscope · Java project</span></div>
      </footer>`;
  }

  // Illustrated panel: a campus at golden hour (pure SVG, no image files)
  function scene(extraClass = "") {
    const trees = [[60, 330, 46], [128, 352, 34], [470, 320, 52], [545, 346, 38], [300, 368, 26]];
    const leaves = Array.from({ length: 12 }, (_, i) =>
      `<ellipse class="leaf" cx="${40 + i * 47}" cy="-10" rx="5" ry="3" style="--d:${(i * 0.9) % 7}s;--x:${(i % 2 ? 1 : -1) * (20 + i * 3)}px;--t:${7 + (i % 4)}s"/>`).join("");
    return `
      <svg class="scene ${extraClass}" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3f2"/><stop offset=".7" stop-color="#f6e9d6"/></linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d2ac"/><stop offset="1" stop-color="#d9b98a"/></linearGradient>
          <pattern id="brick" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="#c8673f"/><path d="M0 0h16M8 0v4M0 4h16M0 4v4" stroke="#b55a35" stroke-width=".8"/></pattern>
        </defs>
        <rect width="600" height="520" fill="url(#sky)"/>
        <circle cx="470" cy="110" r="44" fill="#fbe3b8" opacity=".9"/>
        <g class="cloud c1"><ellipse cx="120" cy="80" rx="46" ry="14" fill="#fff" opacity=".8"/><ellipse cx="150" cy="70" rx="28" ry="14" fill="#fff" opacity=".8"/></g>
        <g class="cloud c2"><ellipse cx="380" cy="60" rx="36" ry="10" fill="#fff" opacity=".7"/></g>
        <!-- tower -->
        <rect x="70" y="70" width="70" height="270" fill="url(#brick)"/>
        <polygon points="62,70 105,22 148,70" fill="#8f3f24"/>
        <rect x="88" y="100" width="34" height="44" rx="17" fill="#f3e3c4"/>
        <circle cx="105" cy="122" r="12" fill="#fff8ea" stroke="#8f3f24" stroke-width="2"/>
        <path d="M105 122v-8M105 122l6 3" stroke="#8f3f24" stroke-width="2" stroke-linecap="round"/>
        <!-- main hall with arches -->
        <rect x="140" y="170" width="330" height="190" fill="url(#brick)"/>
        <rect x="134" y="160" width="342" height="14" fill="#efe0c4"/>
        ${[0, 1, 2, 3, 4].map((i) => `<path d="M${165 + i * 62} 360v-90a22 22 0 0 1 44 0v90z" fill="#f3e3c4"/><path d="M${171 + i * 62} 360v-86a16 16 0 0 1 32 0v86z" fill="#5c6f7d" opacity=".55"/>`).join("")}
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${172 + i * 62}" y="190" width="30" height="34" fill="#f3e3c4"/><rect x="176" y="194" width="22" height="26" fill="#6d8392" opacity=".5" transform="translate(${i * 62} 0)"/>`).join("")}
        <!-- ground & path -->
        <rect y="356" width="600" height="164" fill="url(#ground)"/>
        <path d="M250 520 C 290 440, 330 400, 330 360 L 370 360 C 380 400, 420 450, 470 520 Z" fill="#f2e2c3"/>
        <!-- trees -->
        ${trees.map(([x, y, r]) => `<g class="tree"><rect x="${x - 4}" y="${y}" width="8" height="${r + 20}" fill="#6b3f26"/><circle cx="${x}" cy="${y - r * .3}" r="${r}" fill="#e2732c"/><circle cx="${x - r * .5}" cy="${y}" r="${r * .7}" fill="#f0943f"/><circle cx="${x + r * .45}" cy="${y - r * .1}" r="${r * .65}" fill="#c95b22"/></g>`).join("")}
        <!-- walker -->
        <g class="walker"><circle cx="0" cy="0" r="7" fill="#3a2a22"/><path d="M-7 8h14l3 30h-20z" fill="#2f5d46"/><rect x="-6" y="38" width="5" height="20" fill="#2b2b33"/><rect x="2" y="38" width="5" height="20" fill="#2b2b33"/><rect x="6" y="12" width="12" height="16" rx="2" fill="#e2732c"/></g>
        ${leaves}
      </svg>`;
  }

  const verdictTag = (verdict) => `<span class="tag ${PD.level(verdict)}">${PD.levelLabel(verdict)}</span>`;
  const levelOf = (v) => PD.level(v >= 60 ? "HIGH" : v >= 35 ? "MODERATE" : v >= 15 ? "LOW" : "");

  // Circle score (used on results/history)
  function ring(p, size = "") {
    const c = 2 * Math.PI * 52;
    return `<div class="ring ${size} ${levelOf(p)}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" style="--c:${c};--o:${c * (1 - Math.min(p, 100) / 100)}"/></svg><div><b data-count="${p}">0.0</b><small>%</small></div></div>`;
  }

  function pageHead(kicker, title, text) {
    return `
      <section class="phead">
        <div class="phead-text" data-reveal>
          ${kicker ? `<span class="pill">${kicker}</span>` : ""}
          <h1>${title}</h1>
          ${text ? `<p>${text}</p>` : ""}
        </div>
        <div class="phead-art" data-reveal>${scene("small")}</div>
      </section>`;
  }

  /* ============================================================
     THE CHECKER CARD (home page hero + compare page)
     Home uses its own small version; Compare uses the full one
     with the standard ids that PD.bindCompare() connects.
     ============================================================ */
  const featureRow = `
    <div class="feat-row">
      <span><i class="f1">${ICON.check}</i>Word frequency</span>
      <span><i class="f2">${ICON.check}</i>Cosine + Jaccard</span>
      <span><i class="f3">${ICON.check}</i>Copied phrases</span>
      <span><i class="f4">${ICON.check}</i>Saved reports</span>
    </div>`;

  // Home page: a PREVIEW of the checker. It looks like the real one,
  // but the whole card is one link that opens the Compare page.
  function quickCard() {
    return `
      <a class="checker preview" href="compare.html" aria-label="Open the checker on the Compare page">
        ${featureRow}
        <div class="fake-text">Paste or type some text to check for plagiarism…</div>
        <div class="examples"><span>Try an example:</span>${EXAMPLES.map(([l]) => `<span class="ex">${l}</span>`).join("")}</div>
        <div class="checker-foot">
          <span class="btn outline">Upload ${ICON.up}</span>
          <span class="btn green">Compare ${ICON.send}</span>
        </div>
        <span class="open-hint">Open the checker ${ICON.arrow}</span>
      </a>`;
  }

  /* ============================================================
     PAGES
     ============================================================ */
  const views = {
    home: () => `
      <section class="hero">
        <div class="hero-text">
          <span class="pill" id="usage" data-reveal><span class="pill-ic">${ICON.logo}</span>Word-frequency plagiarism detection</span>
          <h1 data-reveal>A plagiarism checker that <em>actually reads.</em></h1>
          <p class="lede" data-reveal>Compare two to ten documents and see how much they share — the words they lean on, the vocabulary they have in common, and the exact phrases copied word for word.</p>
          <div class="cta" data-reveal>
            <a class="btn orange" href="compare.html">Try it for free <span class="btn-ic">${ICON.send}</span></a>
            <a class="btn peach" href="method.html">How it works</a>
          </div>
          <div class="proof" data-reveal>
            <div class="proof-marks"><span>COSINE</span><span>JACCARD</span><span>4-GRAM</span></div>
            <p>Three independent measures, averaged into one <b>clear verdict</b>. Every check is saved as a <b>.txt report</b> and a <b>.csv table</b>.</p>
          </div>
        </div>
        <div class="hero-art">
          ${scene()}
          <div class="hero-card" data-reveal>${quickCard()}</div>
        </div>
      </section>
      <section class="section">
        <div class="sec-head" data-reveal><span class="pill">Three measures</span><h2>One number you can <em>explain.</em></h2></div>
        <div class="features">
          ${[["Frequency", "Cosine similarity", "Compares how often each word appears. Two essays with the same rhythm of words score high.", [90, 70, 55, 40, 30], "f1"],
             ["Vocabulary", "Jaccard similarity", "Compares which words are used at all — shared words divided by every distinct word.", [60, 85, 45, 75, 50], "f2"],
             ["Phrasing", "Phrase match", "Finds runs of four or more words in the same order in both texts, and highlights them.", [20, 95, 95, 95, 25], "f3"]]
            .map(([t, s, d, bars, c], i) => `
            <article class="feature" data-reveal style="--d:${i * 100}ms">
              <div class="mini ${c}">${bars.map((h, j) => `<i style="--h:${h}%;--j:${j}"></i>`).join("")}</div>
              <span class="kicker">${s}</span><h3>${t}</h3><p>${d}</p>
            </article>`).join("")}
        </div>
      </section>
      <section class="section steps-sec">
        <div class="sec-head" data-reveal><span class="pill">How a check works</span><h2>From upload to verdict <em>in seconds.</em></h2></div>
        <div class="steps">
          ${[["Add documents", "Drop .txt files, paste text, or load the sample set. Two to ten at a time."],
             ["Compare every pair", "The Java server normalizes the text, counts words and measures each pair."],
             ["Read the verdict", "See scores, shared words and copied phrases highlighted side by side."]]
            .map(([t, d], i) => `<article data-reveal style="--d:${i * 100}ms"><span class="step-n">${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}
        </div>
      </section>
      <section class="band" data-reveal>
        <div><h2>Ready to check your documents?</h2><p>No account, no upload to the internet. It all runs on your own Java server.</p></div>
        <a class="btn green" href="compare.html">Start a comparison ${ICON.arrow}</a>
      </section>`,

    compare: () => `
      ${pageHead("Step 1 of 2", "Add your <em>documents.</em>", "Between two and ten .txt files, up to 1 MB each. Every pair will be compared.")}
      <section class="compare">
        <div class="checker big">
          ${featureRow}
          <div id="dropZone" class="drop" tabindex="0">
            <input type="file" id="fileInput" accept=".txt" multiple hidden>
            <span class="drop-ic">${ICON.up}</span>
            <p><b>Drop .txt files here</b> or <button type="button" id="browseBtn" class="link">browse</button></p>
            <small>2 – 10 documents · max 1 MB each</small>
          </div>
          <div class="or"><span>or paste text</span></div>
          <input type="text" id="pasteName" class="field" placeholder="Document name (e.g. essay.txt)">
          <textarea id="pasteText" class="field" placeholder="Paste the document text here…"></textarea>
          <div class="checker-foot">
            <div class="examples"><span>No files?</span><button type="button" id="sampleBtn">Load sample documents</button></div>
            <button type="button" id="addPasteBtn" class="btn outline">Add document</button>
          </div>
          <p id="message" class="message" role="alert"></p>
        </div>
        <aside class="queue">
          <div class="queue-head"><h3>Your documents</h3><button type="button" id="clearBtn" class="link">Clear all</button></div>
          <ul id="docList" class="docs"></ul>
          <p class="pairs" id="pairs"></p>
          <button type="button" id="compareBtn" class="btn green wide" disabled></button>
        </aside>
      </section>`,

    results: () => `
      ${pageHead("Step 2 of 2", "Your <em>results.</em>", "")}
      <div id="out"></div>`,

    history: () => `
      ${pageHead("", "Comparison <em>history.</em>", "")}
      <div id="out"></div>`,

    method: () => `
      ${pageHead("Under the hood", "How it <em>works.</em>", "What happens between pressing Compare and seeing a verdict. All of it runs in the Java backend.")}
      <section class="section" id="pipeline">
        <div class="timeline">
          ${[["Read", "DocumentReader", "Each document is read and checked. Empty or invalid files are rejected with a clear message."],
             ["Normalize", "TextNormalizer", "Lower-case everything, remove punctuation and numbers, and skip stop words like “the”, “is” and “and”."],
             ["Count", "WordFrequencyCounter", "A HashMap<String, Integer> records how many times each word appears — the document’s word-frequency profile."],
             ["Measure", "SimilarityCalculator", "Cosine similarity compares the two profiles as vectors; Jaccard similarity compares the sets of words."],
             ["Trace phrases", "PhraseFinder", "Every run of 4 or more words found in both texts, in the same order, counts as a copied phrase."],
             ["Report", "ReportGenerator", "A verdict for every pair, a .txt report, a .csv table. The browser then adds the check to its own history."]]
            .map(([t, c, d], i) => `<article data-reveal><span class="step-n">${i + 1}</span><div><h3>${t}</h3><code>${c}.java</code><p>${d}</p></div></article>`).join("")}
        </div>
      </section>
      <section class="section" id="measures">
        <div class="sec-head" data-reveal><span class="pill">The three measures</span><h2>Averaged into <em>one score.</em></h2></div>
        <div class="formula" data-reveal>
          <div class="eq"><span class="f1">cosine</span> + <span class="f2">jaccard</span> + <span class="f3">phrase</span><span class="div">3</span></div>
          <p>Each measure is a percentage from 0 to 100. The overall similarity is their average.</p>
        </div>
      </section>
      <section class="section" id="scale">
        <div class="sec-head" data-reveal><span class="pill">Verdict scale</span><h2>What the number <em>means.</em></h2></div>
        <div class="scale" data-reveal>
          <div class="original"><b>Original</b><span>below 15%</span></div>
          <div class="low"><b>Low</b><span>15 – 35%</span></div>
          <div class="moderate"><b>Moderate</b><span>35 – 60%</span></div>
          <div class="high"><b>High</b><span>60% and above</span></div>
        </div>
        <div class="rings" data-reveal>${[8, 26, 47, 82].map((v) => ring(v, "sm")).join("")}</div>
      </section>`,
  };

  /* ============================================================
     PAGE BEHAVIOUR
     ============================================================ */
  const after = {
    home: () => {
      // Real number from this browser's history (localStorage)
      PD.history().then(({ rows }) => {
        if (rows.length) $("#usage").innerHTML = `<span class="pill-ic">${ICON.logo}</span>${rows.length} comparison${rows.length > 1 ? "s" : ""} run in this browser`;
      });
    },

    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty"><span>${ICON.up}</span>No documents yet.<br>Add at least two.</li>`,
      renderDoc: (d, i, words) => `
        <li><span class="doc-ic">D${i + 1}</span><div><b>${esc(d.name)}</b><small>${words} words</small></div>
        <button data-remove="${i}" aria-label="Remove ${esc(d.name)}">×</button></li>`,
      compareLabel: (n, min) => n < min ? `Add ${min - n} more document${min - n > 1 ? "s" : ""}` : `Compare ${n} documents ${ICON.send}`,
      busyLabel: `<span class="spin"></span>Comparing…`,
      onRender: (list) => { const n = list.length; $("#pairs").textContent = n >= 2 ? `${n} documents → ${(n * (n - 1)) / 2} pair${n > 2 ? "s" : ""} will be compared` : ""; },
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        out.innerHTML = `
          <section class="card empty-state" data-reveal>
            ${ring(0)}
            <h2>No results yet</h2>
            <p>Compare some documents first, or open a demo made from the sample documents.</p>
            <div class="cta"><a class="btn orange" href="compare.html">Compare documents</a><button class="btn peach" id="demo">See a demo</button></div>
          </section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0]; // sorted, most similar first
      const docs = data.documents;
      out.innerHTML = `
        ${demo ? `<p class="notice">You’re looking at <b>demo data</b> from the sample documents. <a href="compare.html">Run your own comparison →</a></p>` : ""}
        <section class="top-result card" data-reveal>
          ${ring(top.overall, "lg")}
          <div>
            <span class="kicker">Most similar pair</span>
            <h2>${esc(top.documentA)} <span>vs</span> ${esc(top.documentB)}</h2>
            ${verdictTag(top.verdict)}
            ${demo ? "" : `<div class="cta"><a class="btn orange sm" href="${PD.downloadUrl(data.reportName, "txt")}">Download report (.txt)</a><a class="btn outline sm" href="${PD.downloadUrl(data.reportName, "csv")}">Download table (.csv)</a></div>`}
          </div>
        </section>
        <section class="stats">
          ${[["Documents", docs.length, ""], ["Pairs compared", data.summary.pairs, ""], ["Average similarity", `<span data-count="${data.summary.average}">0</span>%`, ""], ["Flagged pairs", data.summary.flagged, "35% or more"]]
            .map(([l, v, s], i) => `<div class="stat card" data-reveal style="--d:${i * 70}ms"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join("")}
        </section>
        <section class="card" data-reveal>
          <div class="card-head"><h2>Similarity matrix</h2><p>Overall similarity between every pair. Darker orange means more similar.</p></div>
          <div class="scroll"><table class="matrix"><tr><th></th>${docs.map((d, j) => `<th title="${esc(d.name)}">D${j + 1}</th>`).join("")}</tr>
          ${data.matrix.map((row, i) => `<tr><th class="rh"><span>D${i + 1}</span>${esc(docs[i].name)}</th>${row.map((v, j) => i === j ? `<td class="self">—</td>` : `<td style="--v:${(v / 100).toFixed(3)}" class="${v >= 50 ? "dark" : ""}">${v.toFixed(1)}%</td>`).join("")}</tr>`).join("")}</table></div>
        </section>
        <div class="card-head outside" data-reveal><h2>Pair-by-pair comparison</h2><p>Most similar pair first. Open “Highlight copied text” to see the shared phrases inside both documents.</p></div>
        ${data.results.map((r, i) => `
        <section class="card pair" data-reveal>
          <div class="pair-head">
            ${ring(r.overall, "sm")}
            <div><h3>${esc(r.documentA)} <span>vs</span> ${esc(r.documentB)}</h3>${verdictTag(r.verdict)}</div>
          </div>
          <div class="metrics">
            ${[["Cosine similarity", "how often words are used", r.cosine, "f1"], ["Jaccard similarity", "which words are shared", r.jaccard, "f2"], ["Phrase match", "copied word order", r.phraseMatch, "f3"]]
              .map(([n, d, v, c]) => `<div class="metric"><div><b>${n}</b><small>${d}</small></div><div class="bar ${c}"><i style="--w:${Math.min(v, 100)}%"></i></div><span>${v.toFixed(2)}%</span></div>`).join("")}
          </div>
          <div class="pair-cols">
            <div><h4>Common words (${r.commonWordCount}) <small>count in ${esc(r.documentA)} / ${esc(r.documentB)}</small></h4>
              <div class="chips">${r.commonWords.length ? r.commonWords.map((w) => `<span>${esc(w.word)}<i>${w.countA}/${w.countB}</i></span>`).join("") : `<em>No common words</em>`}</div></div>
            <div><h4>Common phrases (${r.commonPhrases.length})</h4>
              ${r.commonPhrases.length ? `<ol class="phrases">${r.commonPhrases.slice(0, 8).map((p) => `<li>“${esc(p)}”</li>`).join("")}</ol>` : `<em>No common phrases (4+ words in a row)</em>`}</div>
          </div>
          ${r.commonPhrases.length ? `<button class="btn outline sm" data-hl="${i}">Highlight copied text</button><div class="sbs" hidden></div>` : ""}
        </section>`).join("")}
        <div class="card-head outside" data-reveal><h2>Most frequent words per document</h2><p>Stop words such as “the”, “is” and “and” are ignored.</p></div>
        <section class="words">${docs.map((d, i) => {
          const max = d.topWords.length ? d.topWords[0].count : 1;
          return `<div class="card" data-reveal style="--d:${i * 70}ms"><h3><span class="doc-ic">D${i + 1}</span>${esc(d.name)}</h3><p class="muted">${d.totalWords} words · ${d.uniqueKeywords} unique keywords</p>
            ${d.topWords.map((w) => `<div class="wrow"><span>${esc(w.word)}</span><div class="bar f1"><i style="--w:${(w.count / max) * 100}%"></i></div><b>${w.count}</b></div>`).join("")}</div>`;
        }).join("")}</section>
        ${data.reportText ? `<section class="card" data-reveal><details class="report"><summary>Full text report</summary><pre>${esc(data.reportText)}</pre></details></section>` : ""}`;

      $$("[data-count]", out).forEach((el) => PD.countUp(el, Number(el.dataset.count), el.closest(".ring") ? 1 : 2));
      $$("[data-hl]").forEach((btn) => btn.addEventListener("click", () => {
        const r = data.results[Number(btn.dataset.hl)];
        const box = btn.nextElementSibling;
        if (!box.innerHTML) box.innerHTML = [r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("");
        box.hidden = !box.hidden;
        btn.textContent = box.hidden ? "Highlight copied text" : "Hide highlighted text";
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="muted center">Loading history…</p>`;
      const { rows } = await PD.history();
      if (!rows.length) { out.innerHTML = `<section class="card empty-state"><h2>No comparisons yet</h2><p>Checks you run in this browser will appear here.</p><div class="cta"><a class="btn orange" href="compare.html">Start one</a></div></section>`; return; }
      const highs = rows.filter((h) => PD.level(h.verdict) === "high").length;
      out.innerHTML = `
        <div class="hist-bar"><p class="muted">Stored in this browser only · newest first · last ${rows.length} of max 50</p><button class="btn outline sm" id="clearHist">Clear history</button></div>
        <section class="stats three">
          <div class="stat card" data-reveal><span>Comparisons</span><b>${rows.length}</b></div>
          <div class="stat card" data-reveal style="--d:70ms"><span>High verdicts</span><b>${highs}</b><small>60% or more</small></div>
          <div class="stat card" data-reveal style="--d:140ms"><span>Latest peak</span><b>${rows[0].highestSimilarity.toFixed(1)}%</b><small>${esc(rows[0].date)}</small></div>
        </section>
        <section class="card" data-reveal>
          <div class="scroll"><table class="history">
            <tr><th>Date</th><th>Documents</th><th>Most similar pair</th><th>Highest</th><th>Verdict</th><th>Report</th></tr>
            ${rows.map((h) => `<tr>
              <td>${esc(h.date)}</td>
              <td><b>${h.documentCount}</b><small>${esc(h.documentNames)}</small></td>
              <td>${esc(h.mostSimilarPair)}</td>
              <td><span class="mini-bar ${PD.level(h.verdict)}"><i style="--w:${Math.min(h.highestSimilarity, 100)}%"></i></span><b>${h.highestSimilarity.toFixed(2)}%</b></td>
              <td>${verdictTag(h.verdict)}</td>
              <td class="files"><a href="${PD.downloadUrl(h.reportName, "txt")}">.txt</a><a href="${PD.downloadUrl(h.reportName, "csv")}">.csv</a></td>
            </tr>`).join("")}
          </table></div>
        </section>`;
      $("#clearHist").onclick = () => {
        if (confirm("Delete all comparison history from this browser? This cannot be undone.")) { PD.clearHistory(); after.history(); }
      };
      PD.reveal(out);
    },
  };

  /* ============================================================
     START
     ============================================================ */
  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();
  if (page === "method") $$("[data-count]").forEach((el) => PD.countUp(el, Number(el.dataset.count)));
  PD.reveal();

  // Small green/grey light in the header: is the Java server running?
  fetch("/samples/original.txt", { method: "HEAD" }).then((r) => $("#status").classList.toggle("up", r.ok)).catch(() => $("#status").classList.add("down"));
})();
