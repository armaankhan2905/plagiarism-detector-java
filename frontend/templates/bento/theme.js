/* Template 5 - BENTO
   A modern product UI: everything sits in rounded tiles of different sizes
   (a bento box). Pastel tiles, donut charts and a switcher to flip between pairs. */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [["index.html", "home", "Home"], ["compare.html", "compare", "Compare"], ["results.html", "results", "Results"], ["history.html", "history", "History"], ["method.html", "method", "Method"]];

  function header() {
    return `
      <header class="nav">
        <a class="brand" href="index.html"><span class="logo"><i></i><i></i><i></i><i></i></span>Bento<small>plagiarism</small></a>
        <nav class="tabs" id="tabs"><span class="ind" id="ind"></span>${NAV.map(([h, id, l]) => `<a href="${h}" class="${id === page ? "on" : ""}">${l}</a>`).join("")}</nav>
        <a class="btn sm" href="compare.html">New check</a>
      </header>`;
  }
  function footer() {
    return `<footer class="foot"><span>Bento · plagiarism detection using word frequency</span><span>Java backend · HTML/CSS/JS frontend</span></footer>`;
  }
  // Donut chart (conic-gradient) with the number in the middle
  function donut(p, label = "", cls = "") {
    return `<div class="donut ${cls} ${PD.level(p >= 60 ? "HIGH" : p >= 35 ? "MODERATE" : p >= 15 ? "LOW" : "")}" style="--p:${Math.min(p, 100)}"><div><b data-count="${p}">0</b><small>${label || "%"}</small></div></div>`;
  }
  const tag = (v) => `<span class="tag ${PD.level(v)}">${PD.levelLabel(v)}</span>`;
  const head = (title, text) => `<section class="head" data-reveal><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</section>`;

  const views = {
    home: () => {
      const s = window.SAMPLE;
      const top = s.results[0];
      return `
      <section class="bento home">
        <div class="tile t-hero mint" data-reveal>
          <span class="chip">Word frequency · cosine · jaccard · phrases</span>
          <h1>Catch copied<br>writing, <span>beautifully.</span></h1>
          <p>Compare up to ten documents at once and see exactly which words and phrases they share.</p>
          <div class="row"><a class="btn" href="compare.html">Start comparing →</a><a class="btn ghost" href="method.html">How it works</a></div>
        </div>
        <div class="tile t-donut" data-reveal style="--d:80ms">
          <p class="cap">Sample · most similar</p>
          ${donut(top.overall)}
          <p class="pair-name">${esc(top.documentA)} × ${esc(top.documentB)}</p>${tag(top.verdict)}
        </div>
        <div class="tile lilac t-metric" data-reveal style="--d:140ms"><p class="cap">Cosine</p><b data-count="${top.cosine}">0</b><span>word usage</span></div>
        <div class="tile peach t-metric" data-reveal style="--d:200ms"><p class="cap">Jaccard</p><b data-count="${top.jaccard}">0</b><span>vocabulary</span></div>
        <div class="tile sky t-metric" data-reveal style="--d:260ms"><p class="cap">Phrase</p><b data-count="${top.phraseMatch}">0</b><span>word order</span></div>
        <div class="tile t-words" data-reveal style="--d:120ms">
          <p class="cap">Shared words</p>
          <div class="cloud">${top.commonWords.map((w, i) => `<span style="--i:${i}">${esc(w.word)}</span>`).join("")}</div>
        </div>
        <div class="tile ink t-phrase" data-reveal style="--d:180ms">
          <p class="cap">Copied phrase</p>
          <p class="big-q">“${esc(top.commonPhrases[0] || "")}”</p>
        </div>
        <div class="tile t-steps" data-reveal style="--d:240ms">
          <p class="cap">Three steps</p>
          <ol><li><b>Add</b> 2–10 .txt files</li><li><b>Compare</b> on the Java server</li><li><b>Review</b> scores and copied text</li></ol>
        </div>
      </section>`;
    },

    compare: () => `
      ${head("New check", "Add between two and ten .txt documents. They stay in this browser tab until you compare.")}
      <section class="bento cmp">
        <div class="tile t-drop" data-reveal>
          <div id="dropZone" class="drop" tabindex="0">
            <input type="file" id="fileInput" accept=".txt" multiple hidden>
            <div class="stack"><i></i><i></i><i></i></div>
            <h3>Drop .txt files</h3>
            <p>or <button type="button" id="browseBtn" class="link">browse</button> · max 1 MB each</p>
          </div>
        </div>
        <div class="tile t-list" data-reveal style="--d:80ms">
          <div class="list-head"><p class="cap">Documents <span id="count">0/10</span></p><button type="button" id="clearBtn" class="link">Clear all</button></div>
          <ul id="docList" class="docs"></ul>
          <button type="button" id="compareBtn" class="btn wide" disabled></button>
          <p id="message" class="message" role="alert"></p>
        </div>
        <div class="tile lilac t-paste" data-reveal style="--d:120ms">
          <p class="cap">Paste text</p>
          <input type="text" id="pasteName" placeholder="Name, e.g. essay.txt">
          <textarea id="pasteText" placeholder="Paste the document here…"></textarea>
          <button type="button" id="addPasteBtn" class="btn ghost">Add document</button>
        </div>
        <div class="tile mint t-sample" data-reveal style="--d:160ms">
          <p class="cap">No files handy?</p>
          <h3>Try the sample set</h3>
          <p>original.txt, copied.txt and different.txt — one obvious copy and one original.</p>
          <button type="button" id="sampleBtn" class="btn">Load samples</button>
        </div>
      </section>`,

    results: () => `${head("Results", "")}<div id="out"></div>`,
    history: () => `${head("History", "Every comparison saved in this browser’s localStorage.")}<div id="out"></div>`,

    method: () => `
      ${head("How it works", "Six steps from raw text to a verdict, all inside the Java backend.")}
      <section class="bento method">
        ${[["mint", "01", "Normalize", "Lower-case, remove punctuation, drop stop words like “the” and “is”."],
           ["lilac", "02", "Count", "Build a HashMap<String, Integer> of word frequencies for each document."],
           ["peach", "03", "Cosine", "Compare the two frequency vectors by the angle between them."],
           ["sky", "04", "Jaccard", "Shared words ÷ all distinct words in both documents."],
           ["", "05", "Phrases", "Find runs of 4+ words in the same order in both texts."],
           ["ink", "06", "Verdict", "Overall = average of the three. Then map it onto the scale →"]]
          .map(([c, n, t, d], i) => `<div class="tile ${c}" data-reveal style="--d:${i * 70}ms"><span class="num">${n}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}
        <div class="tile t-scale" data-reveal>
          <p class="cap">Verdict scale</p>
          <div class="scale"><div class="original"><b>Original</b><span>&lt; 15%</span></div><div class="low"><b>Low</b><span>15–35%</span></div><div class="moderate"><b>Moderate</b><span>35–60%</span></div><div class="high"><b>High</b><span>≥ 60%</span></div></div>
          <div class="donuts">${[8, 26, 47, 81].map((v) => donut(v, "", "sm")).join("")}</div>
        </div>
      </section>`,
  };

  function renderPair(r, texts) {
    return `
      <div class="tile t-pairscore">
        <p class="cap">Overall</p>${donut(r.overall)}${tag(r.verdict)}
      </div>
      <div class="tile t-measures">
        <p class="cap">Measures</p>
        ${[["Cosine", "how often words are used", r.cosine, "lilac"], ["Jaccard", "which words are shared", r.jaccard, "peach"], ["Phrase match", "copied word order", r.phraseMatch, "sky"]]
          .map(([l, d, v, c]) => `<div class="meter"><div><b>${l}</b><small>${d}</small></div><div class="track ${c}"><i style="--w:${Math.min(v, 100)}%"></i></div><span>${v.toFixed(1)}%</span></div>`).join("")}
      </div>
      <div class="tile t-common">
        <p class="cap">Common words · ${r.commonWordCount}</p>
        <div class="chips">${r.commonWords.length ? r.commonWords.map((w) => `<span>${esc(w.word)}<i>${w.countA}/${w.countB}</i></span>`).join("") : "<em>none</em>"}</div>
      </div>
      <div class="tile ink t-phrases">
        <p class="cap">Copied phrases · ${r.commonPhrases.length}</p>
        ${r.commonPhrases.length ? `<ul>${r.commonPhrases.slice(0, 8).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "<p>No 4-word phrase in common.</p>"}
      </div>
      ${r.commonPhrases.length ? `<div class="tile t-texts">
        <p class="cap">Copied text, highlighted</p>
        <div class="sbs">${[r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("")}</div>
      </div>` : ""}`;
  }

  const after = {
    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty"><span>📄</span>No documents yet</li>`,
      renderDoc: (d, i, words) => `<li><span class="ic c${i % 4}">${esc(d.name.replace(/\.txt$/i, "").slice(0, 2).toUpperCase())}</span><div><b>${esc(d.name)}</b><small>${words} words · ${(d.text.length / 1024).toFixed(1)} KB</small></div><button data-remove="${i}" aria-label="Remove">✕</button></li>`,
      compareLabel: (n, min) => n < min ? `Add ${min - n} more` : `Compare ${n} documents →`,
      busyLabel: `<span class="spin"></span>Comparing…`,
      onRender: (list) => { $("#count").textContent = `${list.length}/${PD.MAX_DOCS}`; },
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        out.innerHTML = `<section class="bento"><div class="tile t-empty" data-reveal>${donut(0, "", "sm")}<h3>No results yet</h3><p>Compare some documents, or open a demo built from the sample set.</p><div class="row"><a class="btn" href="compare.html">New check</a><button class="btn ghost" id="demo">Open demo</button></div></div></section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        PD.reveal(out);
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0];
      out.innerHTML = `
        <section class="bento res">
          <div class="tile t-top" data-reveal>
            <p class="cap">Most similar pair ${demo ? `<span class="demo">demo data</span>` : ""}</p>
            <div class="top-in">${donut(top.overall, "", "lg")}<div><h2>${esc(top.documentA)}<br><span>×</span> ${esc(top.documentB)}</h2>${tag(top.verdict)}</div></div>
          </div>
          <div class="tile mint t-metric" data-reveal style="--d:60ms"><p class="cap">Average</p><b data-count="${data.summary.average}">0</b><span>% across all pairs</span></div>
          <div class="tile peach t-metric" data-reveal style="--d:120ms"><p class="cap">Flagged</p><b>${data.summary.flagged}</b><span>pairs at 35%+</span></div>
          <div class="tile sky t-metric" data-reveal style="--d:180ms"><p class="cap">Documents</p><b>${data.documents.length}</b><span>${data.summary.pairs} pairs</span></div>
          <div class="tile ink t-dl" data-reveal style="--d:240ms"><p class="cap">Export</p>${demo ? "<p>Downloads are available after a real comparison.</p>" : `<a href="${PD.downloadUrl(data.reportName, "txt")}">Report <b>.txt ↓</b></a><a href="${PD.downloadUrl(data.reportName, "csv")}">Table <b>.csv ↓</b></a>`}</div>
          <div class="tile t-matrix" data-reveal>
            <p class="cap">Similarity matrix</p>
            <div class="scroll"><div class="grid" style="--n:${data.documents.length}">
              <span></span>${data.documents.map((d, j) => `<span class="gh" title="${esc(d.name)}">D${j + 1}</span>`).join("")}
              ${data.matrix.map((row, i) => `<span class="gh row" title="${esc(data.documents[i].name)}">D${i + 1} <small>${esc(data.documents[i].name)}</small></span>${row.map((v, j) => i === j ? `<span class="cell self"></span>` : `<span class="cell" style="--v:${(v / 100).toFixed(3)}">${v.toFixed(0)}</span>`).join("")}`).join("")}
            </div></div>
          </div>
        </section>
        <section class="switch-wrap" data-reveal>
          <p class="cap">Pair details</p>
          <div class="switch" id="switch">${data.results.map((r, i) => `<button class="${i === 0 ? "on" : ""}" data-i="${i}"><span class="dot ${PD.level(r.verdict)}"></span>${esc(r.documentA)} × ${esc(r.documentB)}<b>${r.overall.toFixed(0)}%</b></button>`).join("")}</div>
        </section>
        <section class="bento pair" id="pair">${renderPair(top, texts)}</section>
        <section class="bento words">${data.documents.map((d, i) => {
          const max = d.topWords.length ? d.topWords[0].count : 1;
          return `<div class="tile" data-reveal style="--d:${i * 70}ms"><p class="cap">D${i + 1} · top words</p><h3>${esc(d.name)}</h3><p class="sub">${d.totalWords} words · ${d.uniqueKeywords} unique keywords</p>
            <div class="cols">${d.topWords.map((w) => `<div title="${esc(w.word)}: ${w.count}"><i style="--h:${(w.count / max) * 100}%"></i><span>${esc(w.word)}</span></div>`).join("")}</div></div>`;
        }).join("")}</section>
        ${data.reportText ? `<section class="bento"><div class="tile t-report" data-reveal><details><summary>Full text report</summary><pre>${esc(data.reportText)}</pre></details></div></section>` : ""}`;

      $$("[data-count]", out).forEach((el) => PD.countUp(el, Number(el.dataset.count)));
      $$("#switch button").forEach((b) => b.addEventListener("click", () => {
        $$("#switch button").forEach((x) => x.classList.toggle("on", x === b));
        const box = $("#pair");
        box.classList.add("swap");
        setTimeout(() => {
          box.innerHTML = renderPair(data.results[Number(b.dataset.i)], texts);
          $$("[data-count]", box).forEach((el) => PD.countUp(el, Number(el.dataset.count), 1, 700));
          box.classList.remove("swap");
        }, 180);
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="sub">Loading…</p>`;
      const { rows, demo, error } = await PD.history();
      if (error) { out.innerHTML = `<p class="sub">${esc(error)}</p>`; return; }
      if (!rows.length) { out.innerHTML = `<p class="sub">No comparisons yet. <a href="compare.html">Start one</a>.</p>`; return; }
      const avg = rows.reduce((a, h) => a + h.highestSimilarity, 0) / rows.length;
      const highs = rows.filter((h) => PD.level(h.verdict) === "high").length;
      out.innerHTML = `
        <section class="bento hist-top">
          <div class="tile mint t-metric" data-reveal><p class="cap">Checks</p><b>${rows.length}</b><span>${demo ? "demo history (server offline)" : "saved in this browser"}</span></div>
          <div class="tile peach t-metric" data-reveal style="--d:60ms"><p class="cap">High verdicts</p><b>${highs}</b><span>60% or more</span></div>
          <div class="tile lilac t-metric" data-reveal style="--d:120ms"><p class="cap">Avg. peak</p><b data-count="${avg}">0</b><span>% highest similarity</span></div>
          <div class="tile t-spark" data-reveal style="--d:180ms"><p class="cap">Peak similarity, oldest → newest</p>
            <div class="spark">${rows.slice().reverse().map((h) => `<i class="${PD.level(h.verdict)}" style="--h:${Math.max(h.highestSimilarity, 3)}%" title="${esc(h.date)}: ${h.highestSimilarity.toFixed(1)}%"></i>`).join("")}</div></div>
        </section>
        <section class="tile t-table" data-reveal>
          <div class="scroll"><table><tr><th>Date</th><th>Documents</th><th>Most similar pair</th><th>Peak</th><th>Verdict</th><th>Export</th></tr>
          ${rows.map((h) => `<tr><td>${esc(h.date)}</td><td><b>${h.documentCount}</b><small>${esc(h.documentNames)}</small></td><td>${esc(h.mostSimilarPair)}</td>
            <td><span class="bar"><i style="--w:${Math.min(h.highestSimilarity, 100)}%"></i></span>${h.highestSimilarity.toFixed(1)}%</td><td>${tag(h.verdict)}</td>
            <td>${demo ? "—" : `<a href="${PD.downloadUrl(h.reportName, "txt")}">.txt</a> <a href="${PD.downloadUrl(h.reportName, "csv")}">.csv</a>`}</td></tr>`).join("")}
          </table></div>
        </section>`;
      $$("[data-count]", out).forEach((el) => PD.countUp(el, Number(el.dataset.count)));
      PD.reveal(out);
    },
  };

  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();
  if (page === "home" || page === "method") $$("[data-count]").forEach((el) => PD.countUp(el, Number(el.dataset.count)));

  // sliding pill under the active tab
  function moveIndicator() {
    const on = $("#tabs a.on");
    const ind = $("#ind");
    if (!on) { ind.style.opacity = 0; return; }
    ind.style.width = on.offsetWidth + "px";
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  moveIndicator();
  window.addEventListener("resize", moveIndicator);
  $$("#tabs a").forEach((a) => a.addEventListener("mouseenter", () => { const ind = $("#ind"); ind.style.width = a.offsetWidth + "px"; ind.style.transform = `translateX(${a.offsetLeft}px)`; }));
  $("#tabs").addEventListener("mouseleave", moveIndicator);

  PD.reveal();
})();
