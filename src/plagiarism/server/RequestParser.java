package plagiarism.server;

import java.util.ArrayList;
import java.util.List;

import plagiarism.core.DocumentReader;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.model.Document;

/**
 * Turns the text sent by the web page into Document objects.
 *
 * The web page sends all documents in ONE simple text message.
 * Each document starts with a marker line that holds its name:
 *
 *   ===DOCUMENT: essay1.txt
 *   The water cycle describes how water moves ...
 *   ...
 *   ===DOCUMENT: essay2.txt
 *   The water cycle explains how water moves ...
 *
 * We read it line by line: a marker line starts a new document,
 * every other line is added to the text of the current document.
 */
public class RequestParser {

    public static final String DOCUMENT_MARKER = "===DOCUMENT:";
    public static final int MAX_DOCUMENTS = 10;

    private RequestParser() {
    }

    public static List<Document> parseDocuments(String body) throws InvalidDocumentException {
        List<Document> documents = new ArrayList<>();

        String currentName = null;                  // null = no document started yet
        StringBuilder currentText = new StringBuilder();

        String[] lines = body.split("\\R");         // \R = any kind of line break (\n or \r\n)

        for (String line : lines) {
            if (line.startsWith(DOCUMENT_MARKER)) {
                // Finish the previous document (if there was one)
                if (currentName != null) {
                    documents.add(DocumentReader.createDocument(currentName, currentText.toString()));
                }
                // Start a new document
                currentName = line.substring(DOCUMENT_MARKER.length()).trim();
                if (currentName.isEmpty()) {
                    currentName = "Document " + (documents.size() + 1);
                }
                currentText = new StringBuilder();

            } else if (currentName != null) {
                currentText.append(line).append("\n");
            }
        }

        // Do not forget the last document
        if (currentName != null) {
            documents.add(DocumentReader.createDocument(currentName, currentText.toString()));
        }

        // ----- validation -----
        if (documents.size() < DocumentReader.MIN_DOCUMENTS) {
            throw new InvalidDocumentException("At least " + DocumentReader.MIN_DOCUMENTS
                    + " documents are needed, but got " + documents.size());
        }
        if (documents.size() > MAX_DOCUMENTS) {
            throw new InvalidDocumentException("At most " + MAX_DOCUMENTS
                    + " documents can be compared at once, but got " + documents.size());
        }
        return documents;
    }
}
