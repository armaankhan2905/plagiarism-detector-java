# Plagiarism Detection Using Word Frequency

A Java project that reads two or more text documents, normalizes them, compares their
word frequencies, finds common phrases, calculates similarity percentages and
generates a comparison report. It has a web page frontend and a Java backend.

## Stages

| Stage | What it adds | Status |
|-------|--------------|--------|
| 1 | Reading documents, removing punctuation, normalizing, counting word frequency | Done |
| 2 | Comparing documents: similarity % (cosine + Jaccard + phrase match), common words, common phrases | **Done, waiting for review** |
| 3 | Comparison report saved as a text and CSV file | Pending |
| 4 | Java web server (backend) that the web page talks to | Pending |
| 5 | Frontend: upload documents, see results, download the report | Pending |
| 6 | Final polish: validation, comparison history, viva notes | Pending |

## Folder structure

```
src/plagiarism/
    exception/InvalidDocumentException.java   custom checked exception
    model/Document.java                       one document + its words and frequencies
    core/TextNormalizer.java                  lower case, remove punctuation, stop words
    core/WordFrequencyCounter.java            word -> count (HashMap / TreeMap / sorting)
    core/DocumentReader.java                  reads .txt files (FileReader, BufferedReader)
    core/SimilarityCalculator.java            cosine and Jaccard similarity, common words
    core/PhraseFinder.java                    common phrases (4+ words in the same order)
    core/PlagiarismChecker.java               compares every pair, builds the similarity matrix
    model/ComparisonResult.java               scores for one pair + overall % + verdict
    app/Stage1Demo.java                       console demo for Stage 1
    app/Stage2Demo.java                       console demo for Stage 2
sample-docs/                                  three test documents
```

## How to run

Double-click `run-stage1.bat` or `run-stage2.bat`, or in a terminal:

```
compile.bat
java -cp out plagiarism.app.Stage2Demo
java -cp out plagiarism.app.Stage2Demo path\to\a.txt path\to\b.txt
```

## How similarity is calculated

| Score | What it measures | Formula |
|-------|------------------|---------|
| Cosine | How often each word is used | (A . B) / (\|A\| x \|B\|) on the word-count vectors |
| Jaccard | Which words are shared | words in both / words in either |
| Phrase match | Copied word order | words inside common 4-word sequences / all words |
| **Overall** | | average of the three |

Verdict: 60% or more = HIGH plagiarism, 35-60% = MODERATE, 15-35% = LOW, below 15% = ORIGINAL.

## Syllabus topics used so far

- Packages and access modifiers (`public`, `private`, `final`)
- Classes, objects, constructors, `this`, encapsulation (getters), `toString()` override
- Static methods, static final constants, **static block** (`TextNormalizer`)
- String methods, `replaceAll` with simple regex, `split`, `StringBuilder`
- Custom checked exception, `throw` / `throws`, exception wrapping, try-with-resources
- File handling: `File`, `FileReader`, `BufferedReader`
- Collections: `ArrayList`, `HashSet`, `HashMap`, `TreeMap`, `Map.Entry`
- Comparator written as a lambda, sorting a list
- `LinkedHashSet`, set operations `retainAll` (intersection) and `addAll` (union)
- Nested loops, `boolean[]` array, 2D array `double[][]` (similarity matrix)
- Autoboxing / unboxing (`Integer` <-> `int`), `Math.sqrt`, `String.format` / `printf`
