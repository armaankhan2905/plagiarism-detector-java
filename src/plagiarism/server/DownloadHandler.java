package plagiarism.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import plagiarism.report.ReportWriter;

/**
 * Handles   GET /api/download?name=report_05-11-2026_15-23-53_1.txt
 *
 * Sends a saved report file to the browser as a download.
 *
 * SECURITY: we only accept names that look exactly like our report names
 * (checked with a regular expression). Otherwise someone could ask for
 * "../../secret.txt" and read any file on the computer.
 */
public class DownloadHandler implements HttpHandler {

    // report_ + digits, '-' and '_' + .txt or .csv   (no slashes, no "..")
    private static final String SAFE_NAME_PATTERN = "report_[0-9_-]+\\.(txt|csv)";

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!exchange.getRequestMethod().equals("GET")) {
            HttpUtil.sendError(exchange, 405, "Use GET for /api/download");
            return;
        }

        // The query is the part after "?", e.g. "name=report_..._1.txt"
        String query = exchange.getRequestURI().getQuery();
        if (query == null || !query.startsWith("name=")) {
            HttpUtil.sendError(exchange, 400, "Missing ?name=... in the URL");
            return;
        }

        String fileName = query.substring("name=".length());
        if (!fileName.matches(SAFE_NAME_PATTERN)) {
            HttpUtil.sendError(exchange, 400, "Invalid report name");
            return;
        }

        File file = new File(ReportWriter.REPORT_FOLDER, fileName);
        if (!file.isFile()) {
            HttpUtil.sendError(exchange, 404, "Report not found: " + fileName);
            return;
        }

        byte[] content;
        try (FileInputStream in = new FileInputStream(file)) {   // byte stream
            content = in.readAllBytes();
        }

        String contentType = fileName.endsWith(".csv") ? "text/csv; charset=UTF-8" : "text/plain; charset=UTF-8";

        // "attachment" tells the browser to download the file instead of showing it
        exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        HttpUtil.send(exchange, 200, contentType, content);
    }
}
