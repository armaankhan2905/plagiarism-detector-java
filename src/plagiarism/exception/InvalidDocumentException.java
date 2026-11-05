package plagiarism.exception;

/**
 * Custom CHECKED exception for this project.
 *
 * We throw it whenever a document cannot be used for comparison:
 *   - the file does not exist
 *   - the file is not a .txt file
 *   - the file is empty (or has no real words)
 *   - the file could not be read (IOException)
 *
 * Because it extends Exception (not RuntimeException), the compiler
 * forces every caller to either catch it or declare "throws".
 */
public class InvalidDocumentException extends Exception {

    // Constructor with only a message
    public InvalidDocumentException(String message) {
        super(message);
    }

    // Constructor with a message AND the original exception (the "cause").
    // Used when we wrap an IOException, so the real reason is not lost.
    public InvalidDocumentException(String message, Throwable cause) {
        super(message, cause);
    }
}
