# Plagiarism Detection Using Word Frequency

A Java project that reads two or more text documents, normalizes them, compares their
word frequencies, finds common phrases, calculates similarity percentages and
generates a comparison report. It has a web page frontend and a Java backend.

## Stages

| Stage | What it adds | Status |
|-------|--------------|--------|
| 1 | Reading documents, removing punctuation, normalizing, counting word frequency | **Done, waiting for review** |
| 2 | Comparing documents: similarity % (cosine + Jaccard), common words, common phrases | Pending |
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
    app/Stage1Demo.java                       console demo for Stage 1
sample-docs/                                  three test documents
```

## How to run (Stage 1)

Double-click `run-stage1.bat`, or in a terminal:

```
compile.bat
java -cp out plagiarism.app.Stage1Demo
java -cp out plagiarism.app.Stage1Demo path\to\a.txt path\to\b.txt
```

## Syllabus topics used so far

- Packages and access modifiers (`public`, `private`, `final`)
- Classes, objects, constructors, `this`, encapsulation (getters), `toString()` override
- Static methods, static final constants, **static block** (`TextNormalizer`)
- String methods, `replaceAll` with simple regex, `split`, `StringBuilder`
- Custom checked exception, `throw` / `throws`, exception wrapping, try-with-resources
- File handling: `File`, `FileReader`, `BufferedReader`
- Collections: `ArrayList`, `HashSet`, `HashMap`, `TreeMap`, `Map.Entry`
- Comparator written as a lambda, sorting a list
