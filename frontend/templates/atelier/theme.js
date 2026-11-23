/* Template 1 - ATELIER
   An art-gallery catalogue: white walls, a big italic serif, numbered plates,
   and every comparison drawn as two overlapping circles (a Venn diagram). */
(() => {
  const { esc, $, $$ } = PD;
  const page = document.body.dataset.page;
  const NAV = [["index.html", "home", "Index"], ["compare.html", "compare", "Compare"], ["results.html", "results", "Results"], ["history.html", "history", "Archive"], ["method.html", "method", "Method"]];
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

  /* ---------- pieces ---------- */
  function header() {
    const links = NAV.map(([href, id, label], i) =>
      `<a href="${href}" class="${id === page ? "on" : ""}"><sup>0${i + 1}</sup>${label}</a>`).join("");
    return `
      <header class="top">
        <a class="mark" href="index.html">Atelier<em>.</em><span>plagiarism studio</span></a>
        <button class="menu" aria-label="Menu" onclick="document.body.classList.toggle('nav-open')"><i></i><i></i></button>
        <nav>${links}</nav>
      </header>`;
  }
  function footer() {
    return `
      <footer class="foot">
        <div class="foot-big">Read<em>closely.</em></div>
        <div class="foot-row"><span>Atelier · word-frequency plagiarism studio</span><span>Java backend · HTML, CSS, JS</span><a href="#">Back to top ↑</a></div>
      </footer>`;
  }
  // Two circles. The more similar, the more they overlap.
  function venn(p, label = "") {
    const r = 70, w = 260, h = 170;
    const half = (2 * r * (1 - Math.min(p, 100) / 100)) / 2;
    return `
      <svg class="venn" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} ${p.toFixed(1)} percent overlap">
        <circle class="va" cx="${w / 2}" cy="${h / 2}" r="${r}" style="--x:${-half}px;--from:${-r - 20}px"/>
        <circle class="vb" cx="${w / 2}" cy="${h / 2}" r="${r}" style="--x:${half}px;--from:${r + 20}px"/>
      </svg>`;
  }
  const tag = (verdict) => `<span class="tag ${PD.level(verdict)}">${PD.levelLabel(verdict)}</span>`;
  const kicker = (n, text) => `<p class="kicker"><span>${n}</span>${text}</p>`;

  /* ---------- pages ---------- */
  const views = {
    home: () => {
      const s = window.SAMPLE.results[0];
      return `
      <section class="hero">
        <p class="eyebrow" data-reveal>Exhibition No. 01 — on originality</p>
        <h1 data-reveal>Two texts.<br><em>One overlap.</em></h1>
        <div class="hero-art" data-reveal>${venn(s.overall)}<p class="caption">Plate 0 · <i>${esc(s.documentA)}</i> &amp; <i>${esc(s.documentB)}</i>, ${s.overall.toFixed(1)}% shared</p></div>
        <div class="hero-side" data-reveal>
          <p>Atelier measures how much two pieces of writing share — the words they lean on, the vocabulary they have in common, and whole phrases lifted word for word.</p>
          <a class="btn" href="compare.html">Begin a comparison <span>→</span></a>
          <a class="link" href="results.html">or view the latest results</a>
        </div>
      </section>
      <section class="trio">
        ${[["Frequency", "Cosine similarity compares how often each word appears — the rhythm of a text."],
           ["Vocabulary", "Jaccard similarity compares which words are used at all — the palette."],
           ["Phrasing", "Phrase match finds four or more words copied in the same order — the brushstroke."]]
          .map(([t, d], i) => `<article data-reveal style="--d:${i * 120}ms"><span class="num">${ROMAN[i]}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}
      </section>
      <section class="quote" data-reveal>
        <blockquote>“Overall similarity is the average of the three. Above <em>60%</em>, we call it high.”</blockquote>
        <a class="btn ghost" href="method.html">Read the method</a>
      </section>`;
    },

    compare: () => `
      <section class="page-head">
        ${kicker("02", "Compare")}
        <h1 data-reveal>Hang the <em>works.</em></h1>
        <p class="lede" data-reveal>Add between two and ten plain-text documents. Every pair is compared.</p>
      </section>
      <section class="studio">
        <div class="wall">
          <div id="dropZone" class="drop" tabindex="0">
            <input type="file" id="fileInput" accept=".txt" multiple hidden>
            <div class="frame"><span>+</span></div>
            <p><strong>Drop .txt files</strong> or <button type="button" id="browseBtn" class="inline">choose from disk</button></p>
            <small>2 – 10 documents · up to 1 MB each</small>
          </div>
          <div class="row">
            <button type="button" id="sampleBtn" class="btn ghost">Load the sample set</button>
            <button type="button" id="clearBtn" class="link">Clear the wall</button>
          </div>
          <details class="paste">
            <summary>Paste text instead</summary>
            <input type="text" id="pasteName" placeholder="Title, e.g. essay.txt">
            <textarea id="pasteText" placeholder="Paste the document here…"></textarea>
            <button type="button" id="addPasteBtn" class="btn small">Add to the wall</button>
          </details>
          <p id="message" class="message" role="alert"></p>
        </div>
        <aside class="catalogue">
          <h2>Catalogue</h2>
          <ol id="docList" class="cat-list"></ol>
          <button type="button" id="compareBtn" class="btn wide" disabled></button>
        </aside>
      </section>`,

    results: () => `
      <section class="page-head">
        ${kicker("03", "Results")}
        <h1 data-reveal>The <em>findings.</em></h1>
        <p class="lede" id="lede" data-reveal></p>
      </section>
      <div id="out"></div>`,

    history: () => `
      <section class="page-head">
        ${kicker("04", "Archive")}
        <h1 data-reveal>Past <em>exhibitions.</em></h1>
        <p class="lede" data-reveal>Every comparison saved in this browser (<code>localStorage</code>).</p>
      </section>
      <div id="out" class="archive"></div>`,

    method: () => `
      <section class="page-head">
        ${kicker("05", "Method")}
        <h1 data-reveal>How a text<br>is <em>read.</em></h1>
      </section>
      <section class="steps">
        ${[
          ["Clean", "Every document is lower-cased, punctuation is removed and the text is split into words. Stop words such as <i>the</i>, <i>is</i> and <i>and</i> are set aside."],
          ["Count", "A <code>HashMap&lt;String, Integer&gt;</code> records how many times each remaining word appears — the word-frequency profile."],
          ["Cosine", "Both profiles become vectors. The angle between them tells how alike the word usage is, from 0% to 100%."],
          ["Jaccard", "Shared words divided by all distinct words. It ignores counts and asks only: do they use the same vocabulary?"],
          ["Phrases", "Sequences of four or more words that appear in the same order in both texts. Phrase match is the share of words covered by them."],
          ["Verdict", "The overall score is the average of the three. 60%+ is high, 35%+ moderate, 15%+ low, anything below is original."],
        ].map(([t, d], i) => `<article data-reveal><span class="num">${ROMAN[i]}</span><div><h3>${t}</h3><p>${d}</p></div></article>`).join("")}
      </section>
      <section class="scale" data-reveal>
        <h2>The scale</h2>
        <div class="scale-bar"><span class="original">Original<br><small>0 – 15</small></span><span class="low">Low<br><small>15 – 35</small></span><span class="moderate">Moderate<br><small>35 – 60</small></span><span class="high">High<br><small>60 – 100</small></span></div>
        <div class="vennrow">${[10, 30, 50, 80].map((p) => `<figure>${venn(p)}<figcaption>${p}%</figcaption></figure>`).join("")}</div>
      </section>`,
  };

  /* ---------- behaviour ---------- */
  const after = {
    compare: () => PD.bindCompare({
      emptyHtml: `<li class="empty">Nothing on the wall yet.</li>`,
      renderDoc: (d, i, words) => `
        <li><span class="num">${ROMAN[i]}</span><div><b>${esc(d.name)}</b><small>${words} words</small></div>
        <button data-remove="${i}" aria-label="Remove ${esc(d.name)}">×</button></li>`,
      compareLabel: (n, min) => n < min ? `Add ${min - n} more to compare` : `Compare ${n} works →`,
    }),

    results: () => {
      const saved = PD.result();
      const out = $("#out");
      if (!saved) {
        $("#lede").textContent = "No comparison yet.";
        out.innerHTML = `<section class="empty-state" data-reveal>${venn(0)}<p>The wall is empty. Compare some documents, or open the demo made from the sample set.</p>
          <div class="row"><a class="btn" href="compare.html">Compare documents</a><button class="btn ghost" id="demo">Open the demo</button></div></section>`;
        $("#demo").onclick = () => { PD.useDemo(); location.reload(); };
        return;
      }
      const { data, texts, demo } = saved;
      const top = data.results[0];
      $("#lede").innerHTML = `${data.documents.length} documents, ${data.summary.pairs} pairs. ${demo ? "<b>Demo data</b> from the sample set." : ""}`;
      out.innerHTML = `
        <section class="feature" data-reveal>
          <div>${venn(top.overall, "Most similar pair")}</div>
          <div>
            <p class="eyebrow">Most similar pair</p>
            <h2><i>${esc(top.documentA)}</i> &amp; <i>${esc(top.documentB)}</i></h2>
            <div class="giant"><span data-count="${top.overall}">0.0</span><small>%</small></div>
            ${tag(top.verdict)}
          </div>
        </section>
        <section class="facts" data-reveal>
          <div><b data-count="${data.summary.average}">0</b><span>average similarity, %</span></div>
          <div><b>${data.summary.flagged}</b><span>pairs flagged at 35%+</span></div>
          <div><b>${data.summary.pairs}</b><span>pairs compared</span></div>
          <div class="dl">${demo ? "" : `<a href="${PD.downloadUrl(data.reportName, "txt")}">Report .txt ↓</a><a href="${PD.downloadUrl(data.reportName, "csv")}">Table .csv ↓</a>`}</div>
        </section>
        <section class="block" data-reveal>
          <h2 class="h">Matrix <small>bigger dot, more similar</small></h2>
          <div class="scroll"><table class="dots"><tr><th></th>${data.documents.map((d, j) => `<th title="${esc(d.name)}">${ROMAN[j]}</th>`).join("")}</tr>
          ${data.matrix.map((row, i) => `<tr><th>${ROMAN[i]} <span>${esc(data.documents[i].name)}</span></th>${row.map((v, j) => i === j ? `<td class="self">—</td>` :
            `<td title="${v.toFixed(1)}%"><i style="--s:${(0.2 + v / 100 * 0.8).toFixed(2)}" class="${PD.level(v >= 60 ? "HIGH" : v >= 35 ? "MODERATE" : v >= 15 ? "LOW" : "")}"></i><span>${v.toFixed(0)}</span></td>`).join("")}</tr>`).join("")}</table></div>
        </section>
        <section class="block">
          <h2 class="h" data-reveal>Plates <small>each pair, most similar first</small></h2>
          ${data.results.map((r, i) => `
          <article class="plate" data-reveal>
            <div class="plate-art">${venn(r.overall)}<p class="caption">Plate ${ROMAN[i]}</p></div>
            <div class="plate-body">
              <h3><i>${esc(r.documentA)}</i> <span>&amp;</span> <i>${esc(r.documentB)}</i></h3>
              <div class="plate-score"><b>${r.overall.toFixed(2)}%</b>${tag(r.verdict)}</div>
              <dl class="measures">
                ${[["Frequency", "cosine", r.cosine], ["Vocabulary", "jaccard", r.jaccard], ["Phrasing", "phrase match", r.phraseMatch]].map(([a, b, v]) =>
                  `<div><dt>${a}<small>${b}</small></dt><dd><span class="rule"><i style="--w:${Math.min(v, 100)}%"></i></span>${v.toFixed(1)}%</dd></div>`).join("")}
              </dl>
              <p class="label">Shared words (${r.commonWordCount})</p>
              <p class="words">${r.commonWords.length ? r.commonWords.map((w) => `<span>${esc(w.word)}<sub>${w.countA}·${w.countB}</sub></span>`).join("") : "<i>none</i>"}</p>
              <p class="label">Copied phrases (${r.commonPhrases.length})</p>
              ${r.commonPhrases.length ? `<ul class="phrases">${r.commonPhrases.slice(0, 8).map((p) => `<li>“${esc(p)}”</li>`).join("")}</ul>
                <button class="btn ghost small" data-hl="${i}">Show copied text side by side</button><div class="sbs" hidden></div>` : `<p class="none">No phrase of four or more words is shared.</p>`}
            </div>
          </article>`).join("")}
        </section>
        <section class="block" data-reveal>
          <h2 class="h">Vocabulary <small>most frequent words, stop words ignored</small></h2>
          <div class="vocab">${data.documents.map((d, i) => {
            const max = d.topWords.length ? d.topWords[0].count : 1;
            return `<div><h3><span>${ROMAN[i]}</span>${esc(d.name)}</h3><p class="small">${d.totalWords} words · ${d.uniqueKeywords} unique keywords</p>
              <p class="cloud">${d.topWords.map((w) => `<span style="font-size:${(0.9 + (w.count / max) * 1.5).toFixed(2)}rem">${esc(w.word)}<sup>${w.count}</sup></span>`).join(" ")}</p></div>`;
          }).join("")}</div>
        </section>
        ${data.reportText ? `<section class="block" data-reveal><details class="report"><summary>Full text report</summary><pre>${esc(data.reportText)}</pre></details></section>` : ""}`;

      $$("[data-count]").forEach((el) => PD.countUp(el, Number(el.dataset.count), el.closest(".giant") ? 1 : 1));
      $$("[data-hl]").forEach((btn) => btn.addEventListener("click", () => {
        const r = data.results[Number(btn.dataset.hl)];
        const box = btn.nextElementSibling;
        if (!box.innerHTML) box.innerHTML = [r.documentA, r.documentB].map((n) => `<div><h4>${esc(n)}</h4><p>${PD.highlight(texts[n] || "", r.commonPhrases)}</p></div>`).join("");
        box.hidden = !box.hidden;
        btn.textContent = box.hidden ? "Show copied text side by side" : "Hide copied text";
      }));
    },

    history: async () => {
      const out = $("#out");
      out.innerHTML = `<p class="small">Loading the archive…</p>`;
      const { rows, demo, error } = await PD.history();
      if (error) { out.innerHTML = `<p class="none">${esc(error)}</p>`; return; }
      if (!rows.length) { out.innerHTML = `<p class="none">No comparisons yet. <a href="compare.html">Start one.</a></p>`; return; }
      out.innerHTML = (demo ? `<p class="notice">The Java server is offline, so this is saved demo data.</p>` : "") +
        rows.map((h, i) => `
          <article class="entry" data-reveal style="--d:${Math.min(i, 6) * 60}ms">
            <span class="num">${ROMAN[i] || i + 1}</span>
            <div class="when">${esc(h.date)}</div>
            <div class="what"><b>${esc(h.mostSimilarPair)}</b><small>${h.documentCount} documents · ${esc(h.documentNames)}</small></div>
            <div class="score">${h.highestSimilarity.toFixed(1)}%</div>
            ${tag(h.verdict)}
            <div class="files">${demo ? "" : `<a href="${PD.downloadUrl(h.reportName, "txt")}">.txt</a><a href="${PD.downloadUrl(h.reportName, "csv")}">.csv</a>`}</div>
          </article>`).join("");
      PD.reveal(out);
    },
  };

  document.body.innerHTML = header() + `<main>${views[page]()}</main>` + footer();
  if (after[page]) after[page]();
  PD.reveal();
})();
