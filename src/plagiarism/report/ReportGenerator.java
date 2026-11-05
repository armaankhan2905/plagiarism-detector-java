package plagiarism.report;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;

/**
 * Builds the COMPARISON REPORT as text (it does not save it - ReportWriter does that).
 *
 * Report sections:
 *   1. Header       - date and time
 *   2. Documents    - name and word counts of every document
 *   3. Summary      - average / highest similarity, number of flagged pairs (uses Stream API)
 *   4. Matrix       - 2D table of overall similarity
 *   5. Details      - all scores, common words and common phrases of every pair
 *
 * StringBuilder is used because we add many small strings; it is much faster
 * than "+" on String, which creates a NEW String object every time (Strings are immutable).
 */
public class ReportGenerator {

    private static final String LINE = "=".repeat(70);
    private static final String THIN_LINE = "-".repeat(70);
    private static final int MAX_COMMON_WORDS = 15;
    private static final int MAX_PHRASES = 10;

    private ReportGenerator() {
    }

    /** Builds the complete text report. */
    public static String generateTextReport(List<Document> documents,
                                            List<ComparisonResult> results,
                                            double[][] matrix) {
        StringBuilder report = new StringBuilder();

        appendHeader(report);
        appendDocuments(report, documents);
        appendSummary(report, results);
        appendMatrix(report, documents, matrix);
        appendDetails(report, results);

        report.append(LINE).append("\n");
        report.append("End of report\n");
        return report.toString();
    }

    // ---------------------------------------------------------------- 1. header
    private static void appendHeader(StringBuilder report) {
        DateTimeFormatter format = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

        report.append(LINE).append("\n");
        report.append("          PLAGIARISM DETECTION REPORT (Word Frequency Method)\n");
        report.append(LINE).append("\n");
        report.append("Generated on : ").append(LocalDateTime.now().format(format)).append("\n\n");
    }

    // ---------------------------------------------------------------- 2. documents
    private static void appendDocuments(StringBuilder report, List<Document> documents) {
        report.append("DOCUMENTS COMPARED (").append(documents.size()).append(")\n");
        report.append(THIN_LINE).append("\n");

        int number = 1;
        for (Document doc : documents) {
            report.append(String.format("%d. %-25s %5d words, %4d unique keywords%n",
                    number, doc.getName(), doc.getTotalWordCount(), doc.getUniqueKeywordCount()));
            number++;
        }
        report.append("\n");
    }

    // ---------------------------------------------------------------- 3. summary (Stream API)
    private static void appendSummary(StringBuilder report, List<ComparisonResult> results) {
        report.append("SUMMARY\n");
        report.append(THIN_LINE).append("\n");

        // average(): mapToDouble turns each result into its overall %, then we average them
        double average = results.stream()
                .mapToDouble(ComparisonResult::getOverallSimilarity)
                .average()
                .orElse(0.0);

        // filter(): keep only results above the MODERATE limit, then count them
        long flagged = results.stream()
                .filter(r -> r.getOverallSimilarity() >= ComparisonResult.MODERATE_LIMIT)
                .count();

        report.append(String.format("Pairs compared            : %d%n", results.size()));
        report.append(String.format("Average similarity        : %.2f%%%n", average));
        report.append(String.format("Pairs flagged (>= %.0f%%)    : %d%n", ComparisonResult.MODERATE_LIMIT, flagged));

        if (!results.isEmpty()) {
            // results are already sorted (highest first) by PlagiarismChecker
            ComparisonResult highest = results.get(0);
            report.append(String.format("Most similar pair         : %s vs %s (%.2f%%, %s)%n",
                    highest.getDocumentA().getName(), highest.getDocumentB().getName(),
                    highest.getOverallSimilarity(), highest.getVerdict()));
        }
        report.append("\n");
    }

    // ---------------------------------------------------------------- 4. matrix
    private static void appendMatrix(StringBuilder report, List<Document> documents, double[][] matrix) {
        report.append("SIMILARITY MATRIX (overall %)\n");
        report.append(THIN_LINE).append("\n");

        // Column headings: D1, D2, D3 ... (short, so the table stays readable)
        report.append(String.format("%-6s", ""));
        for (int j = 0; j < documents.size(); j++) {
            report.append(String.format("%10s", "D" + (j + 1)));
        }
        report.append("\n");

        for (int i = 0; i < matrix.length; i++) {
            report.append(String.format("%-6s", "D" + (i + 1)));
            for (int j = 0; j < matrix[i].length; j++) {
                report.append(String.format("%9.2f%%", matrix[i][j]));
            }
            report.append("\n");
        }

        report.append("(D1 = ").append(documents.get(0).getName());
        for (int i = 1; i < documents.size(); i++) {
            report.append(", D").append(i + 1).append(" = ").append(documents.get(i).getName());
        }
        report.append(")\n\n");
    }

    // ---------------------------------------------------------------- 5. details
    private static void appendDetails(StringBuilder report, List<ComparisonResult> results) {
        report.append("DETAILED COMPARISON\n");

        int number = 1;
        for (ComparisonResult r : results) {
            Document a = r.getDocumentA();
            Document b = r.getDocumentB();

            report.append(THIN_LINE).append("\n");
            report.append(String.format("[%d] %s  vs  %s%n", number, a.getName(), b.getName()));
            report.append(THIN_LINE).append("\n");
            report.append(String.format("  Cosine similarity  (word frequency) : %6.2f%%%n", r.getCosineSimilarity()));
            report.append(String.format("  Jaccard similarity (shared words)   : %6.2f%%%n", r.getJaccardSimilarity()));
            report.append(String.format("  Phrase match       (word order)     : %6.2f%%%n", r.getPhraseMatch()));
            report.append(String.format("  OVERALL SIMILARITY                  : %6.2f%%%n", r.getOverallSimilarity()));
            report.append("  Verdict : ").append(r.getVerdict()).append("\n\n");

            // Common words, shown as  word(countInA/countInB)  using Stream API
            List<String> words = r.getCommonWords();
            String wordList = words.stream()
                    .limit(MAX_COMMON_WORDS)
                    .map(w -> w + "(" + a.getWordFrequency().get(w) + "/" + b.getWordFrequency().get(w) + ")")
                    .collect(Collectors.joining(", "));

            report.append("  Common words: ").append(words.size()).append(" in total");
            if (words.size() > MAX_COMMON_WORDS) {
                report.append(", top ").append(MAX_COMMON_WORDS).append(" shown");
            }
            report.append("\n    ").append(words.isEmpty() ? "(none)" : wordList).append("\n\n");

            // Common phrases
            List<String> phrases = r.getCommonPhrases();
            report.append("  Common phrases: ").append(phrases.size()).append(" in total\n");
            if (phrases.isEmpty()) {
                report.append("    (none)\n");
            }
            for (int i = 0; i < phrases.size() && i < MAX_PHRASES; i++) {
                report.append(String.format("    %d. \"%s\"%n", i + 1, phrases.get(i)));
            }
            report.append("\n");
            number++;
        }
    }
}
