package plagiarism.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.HttpExchange;

/**
 * Small helper methods shared by all the handlers.
 *
 * An HttpExchange object represents ONE request from the browser and its response:
 *   - getRequestBody()      : an InputStream with the data the browser sent
 *   - sendResponseHeaders() : sends the status code (200 OK, 404 Not Found ...)
 *   - getResponseBody()     : an OutputStream where we write our answer
 */
public class HttpUtil {

    // Largest request we accept: 5 MB (protects the server from huge uploads)
    public static final int MAX_BODY_BYTES = 5 * 1024 * 1024;

    private HttpUtil() {
    }

    /**
     * Reads the whole request body as a String (UTF-8).
     * Returns null if the body is bigger than MAX_BODY_BYTES.
     */
    public static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream in = exchange.getRequestBody()) {
            byte[] bytes = in.readNBytes(MAX_BODY_BYTES + 1); // read at most one byte more than allowed
            if (bytes.length > MAX_BODY_BYTES) {
                return null;
            }
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    /** Sends any response: status code, content type and the bytes of the body. */
    public static void send(HttpExchange exchange, int status, String contentType, byte[] body) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);

        // A HEAD request asks only for the headers, never for the body
        if (exchange.getRequestMethod().equals("HEAD")) {
            exchange.sendResponseHeaders(status, -1);
            exchange.close();
            return;
        }

        exchange.sendResponseHeaders(status, body.length == 0 ? -1 : body.length); // -1 means "no body"
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(body);
        }
    }

    /** Sends a JSON answer. */
    public static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        send(exchange, status, "application/json; charset=UTF-8", json.getBytes(StandardCharsets.UTF_8));
    }

    /** Sends an error as JSON, e.g. {"error":"At least 2 documents are needed"} */
    public static void sendError(HttpExchange exchange, int status, String message) throws IOException {
        sendJson(exchange, status, "{\"error\":" + JsonBuilder.quote(message) + "}");
    }
}
