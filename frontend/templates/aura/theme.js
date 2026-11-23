/* Template 3 - AURA
   Soft white with slowly drifting pastel light behind frosted-glass cards.
   Each comparison is three rings (cosine, jaccard, phrase) around the overall score. */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [["index.html", "home", "Home"], ["compare.html", "compare", "Compare"], ["results.html", "results", "Results"], ["history.html", "history", "History"], ["method.html", "method", "How it works"]];
  const COLORS = { cosine: "var(--c1)", jaccard: "var(--c2)", phrase: "var(--c3)" };

  function header() {
    return `
      <div class="aura" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <header class="pill-wrap">
        <nav class="pill">
          <a class="brand" href="index.html"><span class="orb"></span>aura</a>
          ${NAV.map(([h, id, l]) => `<a href="${h}" class="${id === page ? "on" : ""}">${l}</a>`).join("")}
          <a class="go" href="compare.html">Check now</a>
        </nav>
      </header>`;
  }
  function footer() {
    return `
      <footer class="foot glass">
        <div><span class="orb"></span><b>aura</b><p>Plagiarism detection by word frequency.<br>A Java server does the maths; this page just makes it look calm.</p></div>
        <div class="foot-links">${NAV.map(([h, , l]) => `<a href="${h}">${l}</a>`).join("")}</div>
      </footer>`;
  }
  // Three concentric rings, like a fitness tracker
  function rings(r, size = "") {
    const list = [["cosine", r.cosine, 88], ["jaccard", r.jaccard, 68], ["phrase", r.phraseMatch, 48]];
    return `
      <div class="rings ${size}">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          ${list.map(([k, v, rad]) => {
            const c = 2 * Math.PI * rad;
            return `<circle class="track" cx="100" cy="100" r="${rad}"/>
              <circle class="ring" cx="100" cy="100" r="${rad}" stroke="${COLORS[k]}" style="--c:${c};--off:${c * (1 - Math.min(v, 100) / 100)}"/>`;
          }).join("")}
        </svg>
        <div class="rings-mid"><b data-count="${r.overall}">0</b><small>overall %</small></div>
      </div>`;
  }
  const legend = (r) => `
    <ul class="legend">
      <li><i style="background:var(--c1)"></i>Cosine<b>${r.cosine.toFixed(1)}%</b></li>
      <li><i style="background:var(--c2)"></i>Jaccard<b>${r.jaccard.toFixed(1)}%</b></li>
      <li><i style="background:var(--c3)"></i>Phrase<b>${r.phraseMatch.toFixed(1)}%</b></li>
    </ul>`;
  const tag = (v) => `<span class="tag ${PD.level(v)}"><i></i>${PD.levelLabel(v)}</span>`;
  const head = (eyebrow, title, text) => `
    <section class="head"><p class="eyebrow" data-reveal>${eyebrow}</p><h1 data-reveal>${title}</h1>${text ? `<p class="lede" data-reveal>${text}</p>` : ""}</section>`;

  const views = {
    home: () => {
      const s = window.SAMPLE.results[0];
      return `
      <section class="hero">
        <p class="eyebrow" data-reveal><span class="dot"></span>Word-frequency plagiarism detection</p>
        <h1 data-reveal>See what your<br>words <span class="grad">quietly share.</span></h1>
        <p class="lede" data-reveal>Drop in a few essays. Aura counts every word, compares the patterns, and gently highlights the sentences that were borrowed.</p>
        <div class="cta" data-reveal><a class="btn" href="compare.html">Compare documents</a><a class="btn soft" href="method.html">How it works</a></div>
        <div class="hero-card glass float" data-reveal>
          ${rings(s)}
          <div><p class="mini">Live sample</p><h3>${esc(s.documentA)} <span>×</span> ${esc(s.documentB)}</h3>${legend(s)}${tag(s.verdict)}</div>
        </div>
      </section>
      <section class="features">
        ${[["◐", "Frequency", "Cosine similarity reads how often each word appears and compares the overall rhythm."],
           ["◑", "Vocabulary", "Jaccard similarity checks how much of the word list the two texts share."],
           ["◒", "Phrasing", "Runs of four or more identical words in a row are traced and highlighted."]]
          .map(([ic, t, d], i) => `<article class="glass" data-reveal style="--d:${i * 120}ms"><span class="ic c${i + 1}">${ic}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}
      </section>
      <section class="band glass" data-reveal>
        <h2>Gentle on the eyes,<br>strict with the numbers.</h2>
        <div class="band-stats"><div><b>10</b><span>documents at once</span></div><div><b>45</b><span>pairs compared</span></div><div><b>1 MB</b><span>per file</span></div></div>
      </section>`;
    },

    compare: () => `
      ${head("Step 1 of 2", "Add your <span class='grad'>documents.</span>", "Between two and ten .txt files. Drop them, paste them, or try the sample set.")}
      <section class="compare">
        <div class="glass pad">
          <div id="dropZone" class="drop" tabindex="0">
            <input type="file" id="fileInput" accept=".txt" multiple hidden>
            <div class="bubble"><span>↑</span></div>
            <h3>Drop .txt files here</h3>
            <p>or <button type="button" id="browseBtn" class="text-btn">browse your computer</button></p>
          </div>
          <div class="or"><span>or paste text</span></div>
          <div class="paste">
            <input type="text" id="pasteName" placeholder="Name, e.g. essay.txt">
            <textarea id="pasteText" placeholder="Paste the document here…"></textarea>
            <button type="button" id="addPasteBtn" class="btn soft">Add pasted text</button>
          </div>
          <p id="message" class="message" role="alert"></p>
        </div>
        <aside class="glass pad side">
          <div class="side-top"><h3>Your documents</h3><button type="button" id="clearBtn" class="text-btn">Clear</button></div>
          <ul id="docList" class="docs"></ul>
          <button type="button" id="sampleBtn" class="btn soft wide">✦ Use sample documents</button>
          <button type="button" id="compareBtn" class="btn wide" disabled></button>
        </aside>
      </section>`,

    results: () => `${head("Step 2 of 2", "Your <span class='grad'>results.</span>", "")}<p class="lede center" id="lede"></p><div id="out"></div>`,
    history: () => `${head("Saved in this browser", "Past <span class='grad'>checks.</span>", "Every comparison is kept in this browser’s localStorage, even after you close the tab.")}<div id="out" class="hist"></div>`,

    method: () => `
      ${head("Under the hood", "How it <span class='grad'>works.</span>", "Five calm steps, all done by the Java backend.")}
      <section class="timeline">
        ${[["Normalize", "Lower-case everything, remove punctuation and numbers, and skip common stop words like “the” and “and”."],
           ["Count", "Build a word-frequency map for each document — a HashMap from word to count."],
           ["Compare usage", "Cosine similarity treats each map as a vector and measures the angle between them."],
           ["Compare vocabulary", "Jaccard similarity divides the shared words by every distinct word in either text."],
           ["Find phrases", "Any run of four or more words that appears in both texts counts as a copied phrase."]]
          .map(([t, d], i) => `<article class="glass" data-reveal><span class="step">${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div></article>`).join("")}
      </section>
      <section class="glass pad formula" data-reveal>
        <div>${rings({ cosine: 85, jaccard: 62, phraseMatch: 77, overall: 74.7 })}</div>
        <div>
          <h2>Three rings, one number.</h2>
          <p>The overall score is the average of the three rings. Then it’s placed on a simple scale:</p>
          <ul class="scale"><li>${tag("ORIGINAL")} under 15%</li><li>${tag("LOW")} 15 – 35%</li><li>${tag("MODERATE")} 35 – 60%</li><li>${tag("HIGH")} 60% and up</li></ul>
        </div>
      </section>`,
  };

  const after = {
    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty"><span>✧</span>No documents yet</li>`,
      renderDoc: (d, i, words) => `<li><span class="av c${(i % 3) + 1}">${esc(d.name.charAt(0).toUpperCase())}</span><div><b>${esc(d.name)}</b><small>${words} words</small></div><button data-remove="${i}" aria-label="Remove">✕</button></li>`,
      compareLabel: (n, min) => n < min ? `Add ${min - n} more to compare` : `Compare ${n} documents →`,
      busyLabel: `<span class="spin"></span>Comparing…`,
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        out.innerHTML = `<section class="glass pad empty" data-reveal>${rings({ cosine: 0, jaccard: 0, phraseMatch: 0, overall: 0 }, "sm")}<h3>Nothing to show yet</h3><p>Run a comparison, or peek at a demo made from the sample documents.</p><div class="cta"><a class="btn" href="compare.html">Compare documents</a><button class="btn soft" id="demo">See a demo</button></div></section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        PD.reveal(out);
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0];
      $("#lede").innerHTML = `${data.documents.length} documents · ${data.summary.pairs} pairs${demo ? ` · <span class="demo">demo data</span>` : ""}`;
      out.innerHTML = `
        <section class="top glass" data-reveal>
          ${rings(top)}
          <div>
            <p class="mini">Most similar pair</p>
            <h2>${esc(top.documentA)} <span>×</span> ${esc(top.documentB)}</h2>
            ${legend(top)}
            ${tag(top.verdict)}
            ${demo ? "" : `<div class="cta"><a class="btn" href="${PD.downloadUrl(data.reportName, "txt")}">Download report</a><a class="btn soft" href="${PD.downloadUrl(data.reportName, "csv")}">CSV table</a></div>`}
          </div>
        </section>
        <section class="tiles">
          <div class="glass" data-reveal><b data-count="${data.summary.average}">0</b><span>Average similarity %</span></div>
          <div class="glass" data-reveal style="--d:80ms"><b>${data.summary.flagged}</b><span>Pairs flagged (35%+)</span></div>
          <div class="glass" data-reveal style="--d:160ms"><b>${data.summary.pairs}</b><span>Pairs compared</span></div>
        </section>
        <section class="glass pad" data-reveal>
          <h2 class="sec">Similarity map</h2>
          <div class="scroll"><table class="heat"><tr><th></th>${data.documents.map((d) => `<th title="${esc(d.name)}">${esc(d.name)}</th>`).join("")}</tr>
          ${data.matrix.map((row, i) => `<tr><th>${esc(data.documents[i].name)}</th>${row.map((v, j) => i === j ? `<td class="self"></td>` : `<td><span style="--v:${(v / 100).toFixed(3)}">${v.toFixed(1)}%</span></td>`).join("")}</tr>`).join("")}</table></div>
        </section>
        <h2 class="sec out-sec" data-reveal>Every pair</h2>
        ${data.results.map((r, i) => `
        <section class="pair glass" data-reveal>
          <div class="pair-head">
            ${rings(r, "sm")}
            <div><h3>${esc(r.documentA)} <span>×</span> ${esc(r.documentB)}</h3>${legend(r)}${tag(r.verdict)}</div>
          </div>
          <div class="pair-body">
            <div><p class="mini">Common words · ${r.commonWordCount}</p><div class="chips">${r.commonWords.length ? r.commonWords.map((w) => `<span>${esc(w.word)}<i>${w.countA}/${w.countB}</i></span>`).join("") : "<em>none</em>"}</div></div>
            <div><p class="mini">Copied phrases · ${r.commonPhrases.length}</p>${r.commonPhrases.length ? `<div class="quotes">${r.commonPhrases.slice(0, 8).map((p) => `<q>${esc(p)}</q>`).join("")}</div>` : "<em>No four-word phrase in common.</em>"}</div>
          </div>
          ${r.commonPhrases.length ? `<button class="btn soft" data-hl="${i}">✦ Highlight copied text</button><div class="sbs" hidden></div>` : ""}
        </section>`).join("")}
        <h2 class="sec out-sec" data-reveal>Favourite words</h2>
        <section class="words">${data.documents.map((d, i) => {
          const max = d.topWords.length ? d.topWords[0].count : 1;
          return `<div class="glass" data-reveal><h3>${esc(d.name)}</h3><p class="mini">${d.totalWords} words · ${d.uniqueKeywords} unique</p>
            ${d.topWords.map((w) => `<div class="wr"><span>${esc(w.word)}</span><i class="c${(i % 3) + 1}" style="--w:${(w.count / max) * 100}%"></i><b>${w.count}</b></div>`).join("")}</div>`;
        }).join("")}</section>
        ${data.reportText ? `<section class="glass pad" data-reveal><details><summary>Full text report</summary><pre>${esc(data.reportText)}</pre></details></section>` : ""}`;

      $$("[data-count]", out).forEach((el) => PD.countUp(el, Number(el.dataset.count)));
      $$("[data-hl]").forEach((btn) => btn.addEventListener("click", () => {
        const r = data.results[Number(btn.dataset.hl)];
        const box = btn.nextElementSibling;
        if (!box.innerHTML) box.innerHTML = [r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("");
        box.hidden = !box.hidden;
        btn.textContent = box.hidden ? "✦ Highlight copied text" : "Hide highlights";
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="lede center">Loading…</p>`;
      const { rows, demo, error } = await PD.history();
      if (error) { out.innerHTML = `<p class="lede center">${esc(error)}</p>`; return; }
      if (!rows.length) { out.innerHTML = `<p class="lede center">No checks yet. <a href="compare.html">Start one</a>.</p>`; return; }
      out.innerHTML = (demo ? `<p class="note glass">The Java server is offline, so you’re seeing saved demo history.</p>` : "") +
        rows.map((h, i) => `
        <article class="h-row glass" data-reveal style="--d:${Math.min(i, 6) * 60}ms">
          <div class="h-ring" style="--p:${Math.min(h.highestSimilarity, 100)}"><span>${h.highestSimilarity.toFixed(0)}%</span></div>
          <div class="h-main"><b>${esc(h.mostSimilarPair)}</b><small>${esc(h.date)} · ${h.documentCount} documents</small><small class="names">${esc(h.documentNames)}</small></div>
          ${tag(h.verdict)}
          <div class="h-dl">${demo ? "" : `<a href="${PD.downloadUrl(h.reportName, "txt")}">.txt</a><a href="${PD.downloadUrl(h.reportName, "csv")}">.csv</a>`}</div>
        </article>`).join("");
      PD.reveal(out);
    },
  };

  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();
  $$(".hero [data-count], .formula [data-count]").forEach((el) => PD.countUp(el, Number(el.dataset.count)));
  PD.reveal();
})();
