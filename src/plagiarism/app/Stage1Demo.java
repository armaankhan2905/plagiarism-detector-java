package plagiarism.app;

import java.util.List;
import java.util.Map;

import plagiarism.core.DocumentReader;
import plagiarism.core.TextNormalizer;
import plagiarism.core.WordFrequencyCounter;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.model.Document;

/**
 * STAGE 1 console demo.
 *
 * Shows that we can:
 *   1. Read two or more text documents
 *   2. Remove punctuation and normalize the text
 *   3. Count word frequencies
 *
 * Run without arguments to use the sample files, or pass your own file paths:
 *   java -cp out plagiarism.app.Stage1Demo a.txt b.txt c.txt
 */
public class Stage1Demo {

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

            for (Document doc : documents) {
                printDocumentSummary(doc);
            }

        } catch (InvalidDocumentException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }

    private static void printDocumentSummary(Document doc) {
        System.out.println("==================================================");
        System.out.println("Document : " + doc.getName());
        System.out.println("==================================================");

        // Show a short piece of the text before and after cleaning
        String original = doc.getRawText().trim();
        System.out.println("Original (start) : " + shorten(original, 80));
        System.out.println("Cleaned  (start) : " + shorten(TextNormalizer.cleanText(original), 80));

        System.out.println("Total words          : " + doc.getTotalWordCount());
        System.out.println("Words w/o stop words : " + doc.getKeywords().size());
        System.out.println("Unique keywords      : " + doc.getUniqueKeywordCount());

        System.out.println("Top 10 words:");
        List<Map.Entry<String, Integer>> top = WordFrequencyCounter.topWords(doc.getWordFrequency(), 10);
        int rank = 1;
        for (Map.Entry<String, Integer> entry : top) {
            System.out.printf("  %2d. %-15s %d%n", rank, entry.getKey(), entry.getValue());
            rank++;
        }
        System.out.println();
    }

    private static String shorten(String text, int maxLength) {
        String oneLine = text.replace("\n", " ");
        if (oneLine.length() <= maxLength) {
            return oneLine;
        }
        return oneLine.substring(0, maxLength) + "...";
    }
}
