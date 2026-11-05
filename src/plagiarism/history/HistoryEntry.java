package plagiarism.history;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;

/**
 * ONE line of the comparison history: a short summary of one past comparison.
 *
 * Saved in reports/history.csv as:
 *   date,reportName,documentCount,documentNames,mostSimilarPair,highestSimilarity,verdict
 *   05-11-2026 15:32:26,report_..._1,3,original.txt | copied.txt | different.txt,original.txt vs copied.txt,74.65,HIGH plagiarism
 */
public class HistoryEntry {

    private static final String SEPARATOR = ",";
    private static final int FIELD_COUNT = 7;

    private final String date;
    private final String reportName;
    private final int documentCount;
    private final String documentNames;
    private final String mostSimilarPair;
    private final double highestSimilarity;
    private final String verdict;

    public HistoryEntry(String date, String reportName, int documentCount, String documentNames,
                        String mostSimilarPair, double highestSimilarity, String verdict) {
        this.date = date;
        this.reportName = reportName;
        this.documentCount = documentCount;
        this.documentNames = documentNames;
        this.mostSimilarPair = mostSimilarPair;
        this.highestSimilarity = highestSimilarity;
        this.verdict = verdict;
    }

    /**
     * Creates an entry from a finished comparison.
     * (A "static factory method": a static method that builds and returns an object.)
     */
    public static HistoryEntry fromComparison(String reportName, List<Document> documents,
                                              List<ComparisonResult> results) {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));

        StringBuilder names = new StringBuilder();
        for (Document doc : documents) {
            if (names.length() > 0) {
                names.append(" | ");
            }
            names.append(doc.getName());
        }

        ComparisonResult top = results.get(0); // results are sorted, highest first
        String pair = top.getDocumentA().getName() + " vs " + top.getDocumentB().getName();

        return new HistoryEntry(date, reportName, documents.size(), names.toString(),
                pair, top.getOverallSimilarity(), top.getVerdict());
    }

    /** Turns this entry into one CSV line. */
    public String toCsvLine() {
        return clean(date) + SEPARATOR
                + clean(reportName) + SEPARATOR
                + documentCount + SEPARATOR
                + clean(documentNames) + SEPARATOR
                + clean(mostSimilarPair) + SEPARATOR
                + String.format(Locale.US, "%.2f", highestSimilarity) + SEPARATOR
                + clean(verdict);
    }

    /**
     * Reads one CSV line back into an object.
     * Throws IllegalArgumentException (unchecked) if the line is damaged.
     */
    public static HistoryEntry fromCsvLine(String line) {
        String[] parts = line.split(SEPARATOR, -1);
        if (parts.length != FIELD_COUNT) {
            throw new IllegalArgumentException("Expected " + FIELD_COUNT + " fields but found " + parts.length);
        }
        // Integer.parseInt / Double.parseDouble throw NumberFormatException (a subclass of
        // IllegalArgumentException) if the text is not a number
        return new HistoryEntry(parts[0], parts[1], Integer.parseInt(parts[2]), parts[3],
                parts[4], Double.parseDouble(parts[5]), parts[6]);
    }

    /**
     * A comma inside a file name would break the CSV columns,
     * so we replace it with ";". New lines are replaced with a space.
     */
    private static String clean(String value) {
        return value.replace(",", ";").replace("\n", " ").replace("\r", " ");
    }

    public String getDate() {
        return date;
    }

    public String getReportName() {
        return reportName;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public String getDocumentNames() {
        return documentNames;
    }

    public String getMostSimilarPair() {
        return mostSimilarPair;
    }

    public double getHighestSimilarity() {
        return highestSimilarity;
    }

    public String getVerdict() {
        return verdict;
    }
}
