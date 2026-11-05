package plagiarism.report;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import plagiarism.model.ComparisonResult;

/**
 * Saves reports to files inside the "reports" folder.
 *
 *   report_05-11-2026_14-30-12.txt  -> the full readable report (from ReportGenerator)
 *   report_05-11-2026_14-30-12.csv  -> one row per pair of documents, opens in Excel
 *
 * Uses FileWriter wrapped in BufferedWriter, inside try-with-resources,
 * so the file is always closed properly.
 * IOException is a CHECKED exception, so the methods declare "throws IOException".
 */
public class ReportWriter {

    public static final String REPORT_FOLDER = "reports";

    private ReportWriter() {
    }

    /** A file name based on the current date and time, so old reports are never overwritten. */
    public static String createReportName() {
        DateTimeFormatter format = DateTimeFormatter.ofPattern("dd-MM-yyyy_HH-mm-ss");
        return "report_" + LocalDateTime.now().format(format);
    }

    /** Saves the text report. Returns the file that was written. */
    public static File saveTextReport(String reportText, String reportName) throws IOException {
        File file = new File(getReportFolder(), reportName + ".txt");
        writeToFile(file, reportText);
        return file;
    }

    /** Saves the CSV report. Returns the file that was written. */
    public static File saveCsvReport(List<ComparisonResult> results, String reportName) throws IOException {
        File file = new File(getReportFolder(), reportName + ".csv");
        writeToFile(file, generateCsv(results));
        return file;
    }

    /**
     * Builds the CSV text. CSV = "Comma Separated Values":
     * the first line is the header, then one line per pair.
     */
    public static String generateCsv(List<ComparisonResult> results) {
        StringBuilder csv = new StringBuilder();
        csv.append("Document A,Document B,Cosine %,Jaccard %,Phrase Match %,Overall %,Verdict,")
           .append("Common Words,Common Phrases\n");

        for (ComparisonResult r : results) {
            csv.append(csvField(r.getDocumentA().getName())).append(",")
               .append(csvField(r.getDocumentB().getName())).append(",")
               .append(String.format("%.2f", r.getCosineSimilarity())).append(",")
               .append(String.format("%.2f", r.getJaccardSimilarity())).append(",")
               .append(String.format("%.2f", r.getPhraseMatch())).append(",")
               .append(String.format("%.2f", r.getOverallSimilarity())).append(",")
               .append(csvField(r.getVerdict())).append(",")
               .append(r.getCommonWords().size()).append(",")
               .append(r.getCommonPhrases().size()).append("\n");
        }
        return csv.toString();
    }

    /**
     * Puts a value inside double quotes, so a comma inside a file name
     * (e.g. "essay, final.txt") does not break the CSV columns.
     * A quote inside the value is written twice ("") - that is the CSV rule.
     */
    private static String csvField(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    /** Creates the reports folder if it does not exist yet. */
    private static File getReportFolder() throws IOException {
        File folder = new File(REPORT_FOLDER);
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IOException("Could not create folder: " + folder.getAbsolutePath());
        }
        return folder;
    }

    private static void writeToFile(File file, String content) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write(content);
        }
    }
}
