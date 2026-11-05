package plagiarism.history;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import plagiarism.report.ReportWriter;

/**
 * Saves and loads the comparison history (reports/history.csv).
 *
 * Every comparison made through the web page adds ONE line to the file,
 * so the history survives when the server is restarted (persistence).
 *
 * THREAD SAFETY:
 * The server handles up to 4 requests at the same time. If two threads wrote to
 * the file at the same moment, their lines could get mixed up. Both methods are
 * "static synchronized", so they share ONE lock (the HistoryManager class itself):
 * while one thread is writing or reading, the others wait.
 */
public class HistoryManager {

    public static final String HISTORY_FILE_NAME = "history.csv";
    private static final String HEADER =
            "date,reportName,documentCount,documentNames,mostSimilarPair,highestSimilarity,verdict";

    private HistoryManager() {
    }

    private static File getHistoryFile() {
        return new File(ReportWriter.REPORT_FOLDER, HISTORY_FILE_NAME);
    }

    /** Adds one entry to the END of the history file. */
    public static synchronized void addEntry(HistoryEntry entry) throws IOException {
        File file = getHistoryFile();
        File folder = file.getParentFile();
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IOException("Could not create folder: " + folder.getAbsolutePath());
        }

        boolean isNewFile = !file.exists();

        // FileWriter(file, true) -> "append" mode: add to the end instead of overwriting
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
            if (isNewFile) {
                writer.write(HEADER);
                writer.newLine();
            }
            writer.write(entry.toCsvLine());
            writer.newLine();
        }
    }

    /** Reads all entries from the file, oldest first. Damaged lines are skipped. */
    public static synchronized List<HistoryEntry> loadAll() throws IOException {
        List<HistoryEntry> entries = new ArrayList<>();
        File file = getHistoryFile();
        if (!file.exists()) {
            return entries; // no comparisons made yet
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line = reader.readLine(); // skip the header line
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                try {
                    entries.add(HistoryEntry.fromCsvLine(line));
                } catch (IllegalArgumentException e) {
                    System.out.println("Skipping damaged history line: " + line);
                }
            }
        }
        return entries;
    }

    /** The newest 'limit' entries, newest first. */
    public static List<HistoryEntry> loadRecent(int limit) throws IOException {
        List<HistoryEntry> entries = loadAll();
        Collections.reverse(entries); // newest first
        if (entries.size() > limit) {
            return new ArrayList<>(entries.subList(0, limit));
        }
        return entries;
    }
}
