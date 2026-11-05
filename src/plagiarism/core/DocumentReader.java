package plagiarism.core;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import plagiarism.exception.InvalidDocumentException;
import plagiarism.model.Document;

/**
 * Reads .txt files from the disk and turns them into Document objects.
 *
 * Uses:
 *   - FileReader wrapped in BufferedReader (reads the file line by line)
 *   - try-with-resources (the file is closed automatically, even on error)
 *   - our custom checked exception InvalidDocumentException
 */
public class DocumentReader {

    // The project needs at least two documents to compare
    public static final int MIN_DOCUMENTS = 2;

    private DocumentReader() {
    }

    /** Reads ONE file and returns it as a Document. */
    public static Document readDocument(String filePath) throws InvalidDocumentException {
        File file = new File(filePath);

        // ----- validation -----
        if (!file.exists()) {
            throw new InvalidDocumentException("File not found: " + filePath);
        }
        if (!file.getName().toLowerCase().endsWith(".txt")) {
            throw new InvalidDocumentException("Only .txt files are allowed: " + file.getName());
        }

        // ----- reading -----
        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
        } catch (IOException e) {
            // Wrap the low-level IOException inside our own exception
            throw new InvalidDocumentException("Could not read file: " + file.getName(), e);
        }

        return createDocument(file.getName(), content.toString());
    }

    /**
     * Creates a Document from text that is already in memory.
     * (Stage 4: the web page will send text directly, not file paths.)
     */
    public static Document createDocument(String name, String text) throws InvalidDocumentException {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidDocumentException("Document is empty: " + name);
        }

        Document document = new Document(name, text);

        if (document.getTotalWordCount() == 0) {
            throw new InvalidDocumentException("Document has no words after cleaning: " + name);
        }
        return document;
    }

    /** Reads MANY files. Needs at least MIN_DOCUMENTS of them. */
    public static List<Document> readAll(String[] filePaths) throws InvalidDocumentException {
        if (filePaths.length < MIN_DOCUMENTS) {
            throw new InvalidDocumentException(
                    "At least " + MIN_DOCUMENTS + " documents are needed, but got " + filePaths.length);
        }

        List<Document> documents = new ArrayList<>();
        for (String path : filePaths) {
            documents.add(readDocument(path));
        }
        return documents;
    }
}
