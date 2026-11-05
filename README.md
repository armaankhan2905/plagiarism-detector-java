# Plagiarism Detection Using Word Frequency

A Java project that reads two or more text documents, normalizes them, compares their
word frequencies, finds common phrases, calculates similarity percentages and
generates a comparison report. It has a web page frontend and a Java backend
(no external libraries, only the JDK).

## Quick start

| What | How |
|---|---|
| Start the web app | Double-click `run-server.bat`, then open **http://localhost:8080** |
| Run the automated tests | Double-click `run-tests.bat` (36 tests) |
| Console versions | `run-stage1.bat`, `run-stage2.bat`, `run-stage3.bat` |

Needs Java 17 or newer (tested with JDK 26). Stop the server with `Ctrl + C`.
To use another port: `run-server.bat 8081`.

See **[VIVA_NOTES.md](VIVA_NOTES.md)** for the architecture, data flow, formulas,
syllabus mapping, likely viva questions and a demo script.

## Features

- Upload `.txt` files (drag and drop or browse), paste text, or load sample documents (2 to 10 documents)
- Text normalization: lower case, punctuation removed, stop words ignored for frequency
- Three similarity measures per pair: **cosine** (word frequency), **Jaccard** (shared words), **phrase match** (copied word order)
- Overall similarity % and verdict: HIGH / MODERATE / LOW / ORIGINAL
- Common words (with counts in each document) and common phrases (4+ words in a row)
- Similarity matrix of every document against every other
- Side-by-side view with copied text highlighted
- Report saved as `.txt` and `.csv` and downloadable from the page
- History of past comparisons saved in `reports/history.csv`
- Input validation with clear error messages; multithreaded server

## Stages

| Stage | What it adds | Status |
|-------|--------------|--------|
| 1 | Reading documents, removing punctuation, normalizing, counting word frequency | Done |
| 2 | Comparing documents: similarity % (cosine + Jaccard + phrase match), common words, common phrases | Done |
| 3 | Comparison report saved as a text and CSV file | Done |
| 4 | Java web server (backend) that the web page talks to | Done |
| 5 | Frontend: upload documents, see results, download the report | Done |
| 6 | Final polish: comparison history, automated tests, viva notes | **Done, waiting for review** |

## Folder structure

```
src/plagiarism/
    exception/InvalidDocumentException.java   custom checked exception
    model/Document.java                       one document + its words and frequencies
    model/ComparisonResult.java               scores for one pair + overall % + verdict
    core/TextNormalizer.java                  lower case, remove punctuation, stop words
    core/WordFrequencyCounter.java            word -> count (HashMap / TreeMap / sorting)
    core/DocumentReader.java                  reads .txt files (FileReader, BufferedReader)
    core/SimilarityCalculator.java            cosine and Jaccard similarity, common words
    core/PhraseFinder.java                    common phrases (4+ words in the same order)
    core/PlagiarismChecker.java               compares every pair, builds the similarity matrix
    report/ReportGenerator.java               builds the full text report (StringBuilder, Stream API)
    report/ReportWriter.java                  saves .txt and .csv reports (FileWriter, BufferedWriter)
    history/HistoryEntry.java                 one past comparison, saved as a CSV line
    history/HistoryManager.java               reads/writes reports/history.csv (synchronized)
    server/PlagiarismServer.java              starts the web server (main method, thread pool)
    server/CompareHandler.java                POST /api/compare  -> compare documents, answer JSON
    server/DownloadHandler.java               GET  /api/download -> download a saved report
    server/HistoryHandler.java                GET  /api/history  -> recent comparisons
    server/StaticFileHandler.java             GET  / and /samples -> sends frontend files and sample documents
    server/RequestParser.java                 splits the uploaded text into documents
    server/JsonBuilder.java                   turns results into JSON for the browser
    server/HttpUtil.java                      shared helpers: read request, send response
    app/Stage1Demo.java                       console demo for Stage 1
    app/Stage2Demo.java                       console demo for Stage 2
    app/Stage3Demo.java                       full pipeline in the console: compare + save reports
    test/PlagiarismTests.java                 36 automated tests (test evidence)
frontend/index.html                           page layout
frontend/style.css                            colours, cards, bars, matrix
frontend/script.js                            adds documents, calls the Java API, draws the results
sample-docs/                                  three short test documents
test-docs/                                    two long documents (partly copied essay)
reports/                                      generated reports and history.csv (not in git)
```

## How the browser and Java talk

```
Browser                                   Java server
-------                                   -----------
POST /api/compare                  --->   CompareHandler
  ===DOCUMENT: a.txt                        RequestParser     -> List<Document>
  text of a ...                             PlagiarismChecker -> results + matrix
  ===DOCUMENT: b.txt                        ReportGenerator / ReportWriter -> saves report
  text of b ...                             HistoryManager    -> adds a line to history.csv
                                            JsonBuilder       -> JSON
                                   <---   200 OK  { "results": [...], "matrix": [...], ... }

GET /api/download?name=report_...csv  --> DownloadHandler -> sends the file
GET /api/history                      --> HistoryHandler  -> recent comparisons as JSON
```

Errors come back as JSON with a status code, e.g. `400 {"error":"At least 2 documents are needed, but got 1"}`.
The page itself does no plagiarism calculations; all of that is done by the Java backend.

## How similarity is calculated

| Score | What it measures | Formula |
|-------|------------------|---------|
| Cosine | How often each word is used | (A . B) / (\|A\| x \|B\|) on the word-count vectors |
| Jaccard | Which words are shared | words in both / words in either |
| Phrase match | Copied word order | words inside common 4-word sequences / all words |
| **Overall** | | average of the three |

Verdict: 60% or more = HIGH plagiarism, 35-60% = MODERATE, 15-35% = LOW, below 15% = ORIGINAL.

## Syllabus topics used

- Packages and access modifiers (`public`, `private`, `final`)
- Classes, objects, constructors, `this`, encapsulation (getters), `toString()` override
- Static methods, static final constants, **static block** (`TextNormalizer`), static factory methods
- Interfaces: every handler `implements HttpHandler` and overrides `handle()`; a functional interface in the tests
- String methods, `replaceAll` with simple regex, `split`, `StringBuilder`
- Arrays: `boolean[]`, 2D array `double[][]` (similarity matrix)
- Wrapper classes and autoboxing (`Integer` <-> `int`, `Integer.parseInt`, `Double.parseDouble`)
- Custom checked exception, `throw` / `throws`, exception wrapping, try-with-resources, multiple `catch` blocks, unchecked exceptions
- File handling: `File`, `FileReader`, `BufferedReader`, `FileWriter` (append mode), `BufferedWriter`, `FileInputStream`, CSV read and write
- Collections: `ArrayList`, `HashSet`, `LinkedHashSet`, `HashMap`, `TreeMap`, `Map.Entry`, `retainAll` / `addAll`, `Collections.reverse`
- Comparators as lambdas, method references, sorting
- Stream API: `stream()`, `mapToDouble`, `average`, `filter`, `count`, `limit`, `map`, `Collectors.joining`
- Multithreading: thread pool of 4 threads, `synchronized` methods to avoid race conditions
- Testing: hand-written test runner with 36 checks
