/* Shared sample data for the design templates.
   Real output of the Java backend (/api/compare) for the three sample documents,
   plus real rows from reports/history.csv. */
window.SAMPLE = {
 "reportName": "report_23-11-2026_15-10-24_6",
 "summary": {
  "pairs": 3,
  "average": 25.57,
  "flagged": 1
 },
 "documents": [
  {
   "name": "original.txt",
   "totalWords": 125,
   "uniqueKeywords": 61,
   "topWords": [
    {
     "word": "water",
     "count": 7
    },
    {
     "word": "vapour",
     "count": 3
    },
    {
     "word": "cycle",
     "count": 2
    },
    {
     "word": "droplets",
     "count": 2
    },
    {
     "word": "oceans",
     "count": 2
    },
    {
     "word": "process",
     "count": 2
    },
    {
     "word": "atmosphere",
     "count": 1
    },
    {
     "word": "back",
     "count": 1
    }
   ],
   "text": "The water cycle describes how water moves continuously between the Earth and the atmosphere.\nHeat from the sun causes water in oceans, lakes and rivers to evaporate and rise as vapour.\nAs the vapour rises it cools down and condenses into tiny droplets that form clouds.\nWhen the droplets join together and become heavy, they fall back to the ground as rain, snow or hail.\nThis process is called precipitation. Some of the water flows over the land as runoff and returns to the oceans,\nwhile some of it soaks into the soil and becomes groundwater. Plants also release water vapour through their leaves,\na process known as transpiration. The water cycle is essential for life because it supplies fresh water to every living thing."
  },
  {
   "name": "copied.txt",
   "totalWords": 107,
   "uniqueKeywords": 52,
   "topWords": [
    {
     "word": "water",
     "count": 5
    },
    {
     "word": "back",
     "count": 2
    },
    {
     "word": "cycle",
     "count": 2
    },
    {
     "word": "droplets",
     "count": 2
    },
    {
     "word": "oceans",
     "count": 2
    },
    {
     "word": "part",
     "count": 2
    },
    {
     "word": "vapour",
     "count": 2
    },
    {
     "word": "atmosphere",
     "count": 1
    }
   ],
   "text": "The water cycle explains how water moves continuously between the Earth and the atmosphere!\nHeat from the sun makes the water in oceans, lakes and rivers evaporate and rise as vapour.\nWhen the vapour rises it cools down and condenses into tiny droplets that form clouds.\nOnce the droplets join together and become heavy, they fall back to the ground as rain, snow or hail;\nthis step is called precipitation. Part of the water flows over the land as runoff and goes back to the oceans,\nand part of it soaks into the soil and becomes groundwater. The water cycle is essential for life on our planet."
  },
  {
   "name": "different.txt",
   "totalWords": 83,
   "uniqueKeywords": 45,
   "topWords": [
    {
     "word": "class",
     "count": 4
    },
    {
     "word": "object",
     "count": 4
    },
    {
     "word": "called",
     "count": 2
    },
    {
     "word": "objects",
     "count": 2
    },
    {
     "word": "program",
     "count": 2
    },
    {
     "word": "acts",
     "count": 1
    },
    {
     "word": "actual",
     "count": 1
    },
    {
     "word": "allows",
     "count": 1
    }
   ],
   "text": "Object oriented programming organises a program around objects instead of plain functions.\nEach object combines data, called fields, with behaviour, called methods.\nA class acts as a blueprint, and many objects can be created from the same class.\nInheritance lets a new class reuse the code of an existing class, while polymorphism allows\none method call to behave differently depending on the actual object. Encapsulation hides the\ninternal details of an object and exposes only what other parts of the program really need."
  }
 ],
 "results": [
  {
   "documentA": "original.txt",
   "documentB": "copied.txt",
   "cosine": 85.36,
   "jaccard": 66.18,
   "phraseMatch": 72.41,
   "overall": 74.65,
   "verdict": "HIGH plagiarism",
   "commonWordCount": 45,
   "commonWords": [
    {
     "word": "water",
     "countA": 7,
     "countB": 5
    },
    {
     "word": "vapour",
     "countA": 3,
     "countB": 2
    },
    {
     "word": "cycle",
     "countA": 2,
     "countB": 2
    },
    {
     "word": "droplets",
     "countA": 2,
     "countB": 2
    },
    {
     "word": "oceans",
     "countA": 2,
     "countB": 2
    },
    {
     "word": "back",
     "countA": 1,
     "countB": 2
    },
    {
     "word": "atmosphere",
     "countA": 1,
     "countB": 1
    },
    {
     "word": "become",
     "countA": 1,
     "countB": 1
    },
    {
     "word": "becomes",
     "countA": 1,
     "countB": 1
    },
    {
     "word": "between",
     "countA": 1,
     "countB": 1
    },
    {
     "word": "called",
     "countA": 1,
     "countB": 1
    },
    {
     "word": "clouds",
     "countA": 1,
     "countB": 1
    }
   ],
   "commonPhrases": [
    "the droplets join together and become heavy they fall back to the ground as rain snow or hail this",
    "how water moves continuously between the earth and the atmosphere heat from the sun",
    "the vapour rises it cools down and condenses into tiny droplets that form clouds",
    "of the water flows over the land as runoff and",
    "of it soaks into the soil and becomes groundwater",
    "the water cycle is essential for life",
    "water in oceans lakes and rivers",
    "evaporate and rise as vapour"
   ]
  },
  {
   "documentA": "copied.txt",
   "documentB": "different.txt",
   "cosine": 2.25,
   "jaccard": 1.04,
   "phraseMatch": 0.0,
   "overall": 1.1,
   "verdict": "ORIGINAL (no significant similarity)",
   "commonWordCount": 1,
   "commonWords": [
    {
     "word": "called",
     "countA": 1,
     "countB": 2
    }
   ],
   "commonPhrases": []
  },
  {
   "documentA": "original.txt",
   "documentB": "different.txt",
   "cosine": 1.92,
   "jaccard": 0.95,
   "phraseMatch": 0.0,
   "overall": 0.96,
   "verdict": "ORIGINAL (no significant similarity)",
   "commonWordCount": 1,
   "commonWords": [
    {
     "word": "called",
     "countA": 1,
     "countB": 2
    }
   ],
   "commonPhrases": []
  }
 ],
 "matrix": [
  [
   100.0,
   74.65,
   0.96
  ],
  [
   74.65,
   100.0,
   1.1
  ],
  [
   0.96,
   1.1,
   100.0
  ]
 ],
 "history": [
  {
   "date": "23-11-2026 15:10:24",
   "reportName": "report_23-11-2026_15-10-24_6",
   "documentCount": "3",
   "documentNames": "original.txt | copied.txt | different.txt",
   "mostSimilarPair": "original.txt vs copied.txt",
   "highestSimilarity": "74.65",
   "verdict": "HIGH plagiarism"
  },
  {
   "date": "23-11-2026 14:46:36",
   "reportName": "report_23-11-2026_14-46-36_5",
   "documentCount": "4",
   "documentNames": "copied.txt | different.txt | original.txt | renewable_energy_student_copy.txt",
   "mostSimilarPair": "copied.txt vs original.txt",
   "highestSimilarity": "74.65",
   "verdict": "HIGH plagiarism"
  },
  {
   "date": "23-11-2026 14:45:55",
   "reportName": "report_23-11-2026_14-45-55_4",
   "documentCount": "3",
   "documentNames": "copied.txt | different.txt | original.txt",
   "mostSimilarPair": "copied.txt vs original.txt",
   "highestSimilarity": "74.65",
   "verdict": "HIGH plagiarism"
  },
  {
   "date": "23-11-2026 14:45:30",
   "reportName": "report_23-11-2026_14-45-30_3",
   "documentCount": "3",
   "documentNames": "renewable_energy_original.txt | renewable_energy_student_copy.txt | copied.txt",
   "mostSimilarPair": "renewable_energy_original.txt vs renewable_energy_student_copy.txt",
   "highestSimilarity": "56.99",
   "verdict": "MODERATE plagiarism"
  },
  {
   "date": "23-11-2026 14:36:26",
   "reportName": "report_23-11-2026_14-36-26_2",
   "documentCount": "2",
   "documentNames": "renewable_energy_original.txt | renewable_energy_student_copy.txt",
   "mostSimilarPair": "renewable_energy_original.txt vs renewable_energy_student_copy.txt",
   "highestSimilarity": "56.99",
   "verdict": "MODERATE plagiarism"
  },
  {
   "date": "23-11-2026 14:35:03",
   "reportName": "report_23-11-2026_14-35-03_1",
   "documentCount": "3",
   "documentNames": "original.txt | copied.txt | different.txt",
   "mostSimilarPair": "original.txt vs copied.txt",
   "highestSimilarity": "74.65",
   "verdict": "HIGH plagiarism"
  },
  {
   "date": "05-11-2026 15:39:40",
   "reportName": "report_05-11-2026_15-39-40_1",
   "documentCount": "3",
   "documentNames": "original.txt | copied.txt | different.txt",
   "mostSimilarPair": "original.txt vs copied.txt",
   "highestSimilarity": "74.65",
   "verdict": "HIGH plagiarism"
  }
 ]
};

/* Wraps the common phrases inside a document's original text in <mark> tags.
   Phrases are normalized (lower case, no punctuation), so matching is done word by word. */
window.markCopied = function (text, phrases, tag) {
  tag = tag || "mark";
  var parts = text.split(/(\s+)/);
  var words = [];
  parts.forEach(function (p, i) {
    if (!/^\s+$/.test(p) && p.length) words.push({ i: i, w: p.toLowerCase().replace(/[^a-z0-9]/g, "") });
  });
  var hit = new Array(words.length).fill(false);
  phrases.forEach(function (ph) {
    var pw = ph.split(" ");
    for (var s = 0; s + pw.length <= words.length; s++) {
      var ok = true;
      for (var k = 0; k < pw.length; k++) if (words[s + k].w !== pw[k]) { ok = false; break; }
      if (ok) for (var k2 = 0; k2 < pw.length; k2++) hit[s + k2] = true;
    }
  });
  var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
  var out = parts.map(esc);
  words.forEach(function (w, n) {
    if (hit[n] && (n === 0 || !hit[n - 1])) out[w.i] = "<" + tag + ">" + out[w.i];
    if (hit[n] && (n === words.length - 1 || !hit[n + 1])) out[w.i] = out[w.i] + "</" + tag + ">";
  });
  return out.join("");
};

/* Simple hash router: shows the <section data-page="name"> matching location.hash. */
window.startRouter = function (defaultPage) {
  function show() {
    var name = (location.hash || "").slice(1) || defaultPage;
    var pages = document.querySelectorAll("[data-page]");
    var found = false;
    pages.forEach(function (p) { if (p.getAttribute("data-page") === name) found = true; });
    if (!found) name = defaultPage;
    pages.forEach(function (p) { p.hidden = p.getAttribute("data-page") !== name; });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === name);
      if (a.getAttribute("data-nav") === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);
  show();
};

window.verdictLevel = function (pct) {
  return pct >= 60 ? "high" : pct >= 35 ? "moderate" : pct >= 15 ? "low" : "original";
};

/* Same normalization as TextNormalizer.java: lower case, anything that is not
   a letter/digit/space becomes a space, split, drop stop words. */
window.STOP_WORDS = new Set(("a an the and or but if then so of to in on at by for with from as into is am are was were be been being " +
  "has have had do does did it its this that these those i me my we our you your he him his she her they them their " +
  "which who whom what when where why how not no can will would should could may might also very than there here all any such " +
  "some each other more most only while just").split(" "));
window.wordsOf = function (text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
};
/* word -> count, stop words removed (WordFrequencyCounter) */
window.wordFreq = function (text) {
  var m = new Map();
  wordsOf(text).forEach(function (w) { if (!STOP_WORDS.has(w)) m.set(w, (m.get(w) || 0) + 1); });
  return m;
};
/* Splits two documents' vocabularies into only-A, shared and only-B (Jaccard sets) */
window.vocabSplit = function (textA, textB) {
  var a = wordFreq(textA), b = wordFreq(textB), onlyA = [], onlyB = [], both = [];
  a.forEach(function (c, w) { if (b.has(w)) both.push({ word: w, a: c, b: b.get(w) }); else onlyA.push({ word: w, a: c }); });
  b.forEach(function (c, w) { if (!a.has(w)) onlyB.push({ word: w, b: c }); });
  var byA = function (x, y) { return (y.a || y.b) - (x.a || x.b) || x.word.localeCompare(y.word); };
  return { onlyA: onlyA.sort(byA), onlyB: onlyB.sort(byA), both: both.sort(function (x, y) { return (y.a + y.b) - (x.a + x.b) || x.word.localeCompare(y.word); }), a: a, b: b };
};
window.docByName = function (n) { return SAMPLE.documents.filter(function (d) { return d.name === n; })[0]; };
window.escHtml = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
window.shortVerdict = function (v) { return v.replace(" (no significant similarity)", "").replace(" plagiarism", "").replace(" similarity", ""); };
/* Wraps every word of a text in <span class="w" data-w="normalized">, adding
   class "cp" to words inside a common phrase. Whitespace is kept as is. */
window.tokenHtml = function (text, phrases) {
  var parts = text.split(/(\s+)/), words = [];
  parts.forEach(function (p, i) { if (p && !/^\s+$/.test(p)) words.push({ i: i, w: p.toLowerCase().replace(/[^a-z0-9]/g, "") }); });
  var hit = new Array(words.length).fill(false);
  (phrases || []).forEach(function (ph) {
    var pw = ph.split(" ");
    for (var s = 0; s + pw.length <= words.length; s++) {
      var ok = true;
      for (var k = 0; k < pw.length; k++) if (words[s + k].w !== pw[k]) { ok = false; break; }
      if (ok) for (var k2 = 0; k2 < pw.length; k2++) hit[s + k2] = true;
    }
  });
  var out = parts.map(escHtml);
  words.forEach(function (w, n) { out[w.i] = '<span class="w' + (hit[n] ? " cp" : "") + '" data-w="' + w.w + '">' + out[w.i] + "</span>"; });
  return out.join("");
};
/* Entrance animations only switch on once the browser is actually painting
   frames, so a paused or background page still shows everything at rest. */
requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add("anim"); }); });
