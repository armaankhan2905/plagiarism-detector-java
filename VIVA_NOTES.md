# Viva Notes: Plagiarism Detection Using Word Frequency

## 1. The project in 30 seconds

> "My project reads two or more text documents, cleans the text by removing punctuation and
> converting it to lower case, and counts how often every word appears. It compares every pair
> of documents with three measures: **cosine similarity** (word frequency), **Jaccard similarity**
> (shared vocabulary) and **phrase match** (copied word order). The overall similarity is the
> average of the three, and it gives a verdict: HIGH, MODERATE, LOW or ORIGINAL. It also lists
> common words and common phrases, and generates a report as a text file and a CSV file.
> The backend is written in Java and the frontend is a web page that talks to the Java server."

## 2. Architecture

```
 ┌────────────────────────────┐        HTTP (localhost:8080)        ┌──────────────────────────────┐
 │  FRONTEND (browser)        │  POST /api/compare  (documents) ──► │  BACKEND (Java)              │
 │  index.html  - layout      │ ◄── JSON (scores, phrases, matrix)  │  server/  PlagiarismServer   │
 │  style.css   - design      │  GET /api/download  (report file)   │           + 4 handlers       │
 │  script.js   - logic       │  GET /api/history   (past results)  │  core/    the algorithms     │
 └────────────────────────────┘                                     │  report/  report files       │
                                                                    │  history/ history.csv        │
                                                                    └──────────────────────────────┘
```

**The browser only collects documents and shows results. All calculations happen in Java.**

## 3. Data flow (what happens when you click "Compare")

1. `script.js` joins the documents into one text: `===DOCUMENT: a.txt` + text, `===DOCUMENT: b.txt` + text.
2. It sends this with `POST /api/compare` to the Java server.
3. `CompareHandler` receives it on one of the 4 threads in the thread pool.
4. `RequestParser` splits the text into `Document` objects. Each `Document` constructor:
   - `TextNormalizer.toWords()` → lower case, remove punctuation, split into words
   - `TextNormalizer.removeStopWords()` → drop "the", "is", "and" …
   - `WordFrequencyCounter.countWords()` → `HashMap<String, Integer>` of word → count
5. `PlagiarismChecker.compareAll()` compares every pair (N × (N − 1) / 2 pairs):
   - `SimilarityCalculator` → cosine %, Jaccard %, common words
   - `PhraseFinder` → phrase match %, common phrases
   - result stored in a `ComparisonResult` object; list sorted highest first
6. `buildSimilarityMatrix()` → `double[][]` table.
7. `ReportGenerator` builds the text report; `ReportWriter` saves `.txt` and `.csv` files.
8. `HistoryManager` appends one line to `reports/history.csv`.
9. `JsonBuilder` converts everything to JSON → sent back → `script.js` draws the page.

## 4. Package and class guide

| Package | Class | Job |
|---|---|---|
| `exception` | `InvalidDocumentException` | Custom **checked** exception for bad input |
| `model` | `Document` | One document: name, raw text, words, keywords, frequency map |
| `model` | `ComparisonResult` | Scores of one pair, overall %, verdict |
| `core` | `DocumentReader` | Reads `.txt` files, validates input |
| `core` | `TextNormalizer` | Cleans text, stop words (static block) |
| `core` | `WordFrequencyCounter` | Counts words, sorts them |
| `core` | `SimilarityCalculator` | Cosine and Jaccard similarity, common words |
| `core` | `PhraseFinder` | Common phrases with n-grams, phrase match % |
| `core` | `PlagiarismChecker` | Compares all pairs, builds the matrix |
| `report` | `ReportGenerator` | Builds the text report (StringBuilder, Streams) |
| `report` | `ReportWriter` | Saves `.txt` / `.csv` files |
| `history` | `HistoryEntry` | One line of history, CSV save/load |
| `history` | `HistoryManager` | Reads/writes `history.csv` (synchronized) |
| `server` | `PlagiarismServer` | `main()`, starts server, thread pool, routes |
| `server` | `CompareHandler` | `POST /api/compare` |
| `server` | `DownloadHandler` | `GET /api/download` (safe file names only) |
| `server` | `HistoryHandler` | `GET /api/history` |
| `server` | `StaticFileHandler` | Sends the web page and sample files |
| `server` | `RequestParser` | Splits the uploaded text into documents |
| `server` | `JsonBuilder` | Java objects → JSON text |
| `server` | `HttpUtil` | Shared helpers for reading and sending |
| `app` | `Stage1Demo`, `Stage2Demo`, `Stage3Demo` | Console versions (no browser needed) |
| `test` | `PlagiarismTests` | 36 automated tests |

## 5. The three similarity measures (with a tiny example)

Doc A keywords: `water water rain cloud` → `{water=2, rain=1, cloud=1}`
Doc B keywords: `water rain rain sun` → `{water=1, rain=2, sun=1}`

**Cosine similarity** (frequency):
- dot product = water 2×1 + rain 1×2 = **4** (cloud and sun are not shared)
- |A| = √(2² + 1² + 1²) = √6 ≈ 2.449, |B| = √(1² + 2² + 1²) = √6 ≈ 2.449
- cosine = 4 / (2.449 × 2.449) = 4 / 6 = **66.67 %**

**Jaccard similarity** (vocabulary):
- shared = {water, rain} = 2, all = {water, rain, cloud, sun} = 4
- Jaccard = 2 / 4 = **50 %**

**Phrase match** (word order):
- every group of 4 consecutive words (a "4-gram") of B goes into a `HashSet`
- walk through A; when A's 4-gram is in the set, extend it word by word → longest common phrase
- phrase match = words of A and B inside common phrases ÷ all words of A and B

**Overall** = (cosine + Jaccard + phrase) / 3.
**Verdict:** ≥ 60 % HIGH · ≥ 35 % MODERATE · ≥ 15 % LOW · below 15 % ORIGINAL.

**Why three measures?** Cosine alone can be fooled because two essays on the same topic use the same words.
Jaccard ignores how often words appear. Phrase match catches copy-paste but misses reworded
text. Taking the average balances these weaknesses.

**Why remove stop words for frequency but keep them for phrases?** "the", "is" and "and" appear
in every English text and would make all documents look similar. For phrases, the exact word
order (including small words) is what proves copying.

## 6. Syllabus topics and where they are used

| Topic | Where |
|---|---|
| Classes, objects, constructors, `this` | `Document`, `ComparisonResult`, `HistoryEntry` |
| Encapsulation (private fields + getters) | all model classes |
| `static` methods, `static final` constants | all utility classes (`TextNormalizer`, …) |
| **Static block** | `TextNormalizer` fills the stop-word set once |
| Private constructor (utility class) | `TextNormalizer`, `PhraseFinder`, … |
| Static factory method | `HistoryEntry.fromComparison()`, `fromCsvLine()` |
| Interfaces, `implements`, `@Override` | every handler `implements HttpHandler` |
| Functional interface + lambda | `RiskyAction` in tests, comparators |
| `toString()` override | `Document`, `ComparisonResult` |
| Packages and access modifiers | 9 packages, `public` / `private` / `final` |
| Arrays, `boolean[]`, 2D array `double[][]` | `PhraseFinder`, similarity matrix |
| String methods, regex, `split`, `join` | `TextNormalizer`, `PhraseFinder` |
| `StringBuilder` (and why: Strings are immutable) | `ReportGenerator`, `JsonBuilder` |
| Wrapper classes, autoboxing | `Map<String, Integer>`, `Integer.parseInt`, `Double.parseDouble` |
| Custom checked exception | `InvalidDocumentException` |
| `try`/`catch`/`finally`, multi-catch, `throw`/`throws` | `DocumentReader`, `CompareHandler`, `Stage3Demo` |
| try-with-resources | every file read/write |
| Unchecked exceptions | `IllegalArgumentException`, `NumberFormatException` in `HistoryEntry` |
| Character streams | `FileReader`, `BufferedReader`, `FileWriter`, `BufferedWriter` |
| Byte streams | `FileInputStream`, `InputStream`, `OutputStream` (server) |
| CSV read/write + collections | `ReportWriter`, `HistoryManager` |
| `ArrayList`, `HashMap`, `TreeMap` | everywhere |
| `HashSet`, `LinkedHashSet` | stop words, n-grams, phrases, Jaccard |
| `retainAll` / `addAll` (set intersection / union) | `SimilarityCalculator.jaccardSimilarity` |
| Comparator and sorting | `topWords`, `findCommonWords`, `compareAll` |
| `Collections.reverse`, `subList` | `HistoryManager.loadRecent` |
| Lambdas, method references | comparators, `ComparisonResult::getOverallSimilarity` |
| Stream API: `filter`, `map`, `mapToDouble`, `average`, `count`, `limit`, `collect` | `ReportGenerator`, `JsonBuilder` |
| Multithreading (thread pool) | `PlagiarismServer` uses 4 threads |
| `synchronized`, race condition | `nextRequestNumber()`, `HistoryManager` |
| Testing / test evidence | `PlagiarismTests` (36 checks) |

## 7. Likely viva questions and answers

**Q: Why did you use a `HashMap` for word frequency?**
A: Each word is a unique key and its count is the value. `HashMap` gives very fast (average O(1))
lookup and update, which matters when a document has thousands of words.

**Q: Then why also `TreeMap`?**
A: `TreeMap` keeps keys sorted alphabetically. I use it when I need an ordered list of words.

**Q: Why `HashSet` for stop words and n-grams?**
A: I only need to ask "is this word or phrase present?" and `contains()` on a `HashSet` is very fast.
A Set also removes duplicates automatically.

**Q: What does `LinkedHashSet` do in `PhraseFinder`?**
A: It removes duplicate phrases like a `HashSet`, but it keeps the order in which they were found.

**Q: Why is `InvalidDocumentException` checked and not unchecked?**
A: A bad document (missing, empty, wrong type) is an expected situation that the caller must handle,
so the compiler should force the caller to catch it or declare `throws`.

**Q: What is a static block and why did you use it?**
A: It runs once when the class is loaded. I use it to fill the stop-word set once, instead of every time.

**Q: Why `StringBuilder` instead of `+`?**
A: Strings are immutable, so every `+` creates a new String object. `StringBuilder` changes one object in place,
which is much faster when building a large report.

**Q: What is try-with-resources?**
A: A `try (...)` that automatically closes the file or stream at the end, even if an exception happens.
It replaces a `finally { reader.close(); }` block.

**Q: How does your server handle many users?**
A: It uses a thread pool of 4 threads (`Executors.newFixedThreadPool(4)`), so 4 requests can run at the same time.

**Q: What is a race condition? Where did you prevent one?**
A: When two threads change shared data at the same time and the result depends on timing.
`requestCounter++` is really read → add → write, so two threads could get the same number.
I made `nextRequestNumber()` `synchronized`, so only one thread can run it at a time.
`HistoryManager` methods are also `synchronized`, so two threads never write to `history.csv` together.

**Q: What is JSON and why did you use it?**
A: A text format for data that JavaScript understands directly: `{ }` for objects, `[ ]` for arrays.
I build it by hand with `StringBuilder` in `JsonBuilder`, escaping quotes and new lines.

**Q: Is your server secure?**
A: It listens only on `localhost`. `DownloadHandler` only accepts names matching `report_[0-9_-]+.(txt|csv)`,
and `StaticFileHandler` checks the canonical path, so `../` tricks cannot read other files.
Request bodies are limited to 5 MB, and the page escapes HTML so document text cannot run scripts.

**Q: What are the limitations?**
A: It only detects copying in the same language, word by word. It cannot detect synonyms
("big" vs "large") or meaning-level paraphrasing, and it only accepts `.txt` files.
Possible improvements: stemming ("running" → "run"), synonym lists, PDF/DOCX support, and a database (JDBC) for history.

**Q: How did you test it?**
A: `PlagiarismTests` has 36 automated checks: normalization, counting, cosine/Jaccard with known
answers (e.g. Jaccard {a,b,c} vs {b,c,d} = 50 %), phrase detection, pair counting, the matrix,
validation errors, JSON escaping and history save/load. Run `run-tests.bat`; it prints PASS/FAIL.

## 8. Demo script for the viva (about 3 minutes)

1. Run `run-tests.bat` → show **36 passed**.
2. Run `run-server.bat` → open http://localhost:8080.
3. Click **Load sample documents** → **Compare**.
4. Show the summary, the matrix (original vs copied is red), and the pair card for original vs copied.
5. Click **Highlight copied text** → show the copied phrases marked in both documents.
6. Drag in the two files from `test-docs/` → Compare → **MODERATE** (partly copied, partly rewritten).
7. Download the `.txt` report and open the `.csv` in Excel.
8. Scroll to **Recent comparisons** → explain that `history.csv` keeps it after a restart.
9. Open `CompareHandler.java` and walk through the 5 steps of a request.
