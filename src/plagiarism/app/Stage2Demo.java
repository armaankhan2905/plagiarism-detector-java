package plagiarism.app;

import java.util.List;

import plagiarism.core.DocumentReader;
import plagiarism.core.PlagiarismChecker;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;

/**
 * STAGE 2 console demo.
 *
 * Shows that we can:
 *   4. Compare word frequencies       (cosine + Jaccard similarity)
 *   5. Identify common phrases        (4+ words in the same order)
 *   6. Calculate similarity percentages and a verdict
 *
 * Run without arguments to use the sample files, or pass your own file paths:
 *   java -cp out plagiarism.app.Stage2Demo a.txt b.txt c.txt
 */
public class Stage2Demo {

    private static final int MAX_WORDS_SHOWN = 10;
    private static final int MAX_PHRASES_SHOWN = 5;

    public static void main(String[] args) {
        String[] files = args;
        if (files.length == 0) {
            files = new String[] {
                "sample-docs/original.txt",
                "sample-docs/copied.txt",
                "sample-docs/different.txt"
            };
        }

        try {
            List<Document> documents = DocumentReader.readAll(files);
            List<ComparisonResult> results = PlagiarismChecker.compareAll(documents);

            for (ComparisonResult result : results) {
                printResult(result);
            }

            double[][] matrix = PlagiarismChecker.buildSimilarityMatrix(documents, results);
            printMatrix(documents, matrix);

        } catch (InvalidDocumentException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }

    private static void printResult(ComparisonResult r) {
        System.out.println("==================================================");
        System.out.println(r.getDocumentA().getName() + "  vs  " + r.getDocumentB().getName());
        System.out.println("==================================================");
        System.out.printf("Cosine similarity  (word frequency) : %6.2f%%%n", r.getCosineSimilarity());
        System.out.printf("Jaccard similarity (shared words)   : %6.2f%%%n", r.getJaccardSimilarity());
        System.out.printf("Phrase match       (word order)     : %6.2f%%%n", r.getPhraseMatch());
        System.out.printf("OVERALL SIMILARITY                  : %6.2f%%%n", r.getOverallSimilarity());
        System.out.println("Verdict : " + r.getVerdict());

        List<String> words = r.getCommonWords();
        System.out.println("Common words (" + words.size() + "): "
                + String.join(", ", words.subList(0, Math.min(MAX_WORDS_SHOWN, words.size()))));

        List<String> phrases = r.getCommonPhrases();
        System.out.println("Common phrases (" + phrases.size() + "):");
        if (phrases.isEmpty()) {
            System.out.println("  (none)");
        }
        for (int i = 0; i < phrases.size() && i < MAX_PHRASES_SHOWN; i++) {
            System.out.println("  - \"" + phrases.get(i) + "\"");
        }
        System.out.println();
    }

    private static void printMatrix(List<Document> documents, double[][] matrix) {
        System.out.println("Similarity matrix (overall %):");

        System.out.printf("%-16s", "");
        for (Document doc : documents) {
            System.out.printf("%16s", doc.getName());
        }
        System.out.println();

        for (int i = 0; i < matrix.length; i++) {
            System.out.printf("%-16s", documents.get(i).getName());
            for (int j = 0; j < matrix[i].length; j++) {
                System.out.printf("%15.2f%%", matrix[i][j]);
            }
            System.out.println();
        }
    }
}
