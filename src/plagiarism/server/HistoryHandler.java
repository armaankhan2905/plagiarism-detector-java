package plagiarism.server;

import java.io.IOException;
import java.util.List;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import plagiarism.history.HistoryEntry;
import plagiarism.history.HistoryManager;

/**
 * Handles   GET /api/history
 *
 * Sends the most recent comparisons (newest first) as JSON, so the web page
 * can show a "Recent comparisons" table.
 */
public class HistoryHandler implements HttpHandler {

    private static final int MAX_ENTRIES = 15;

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!exchange.getRequestMethod().equals("GET")) {
            HttpUtil.sendError(exchange, 405, "Use GET for /api/history");
            return;
        }

        try {
            List<HistoryEntry> entries = HistoryManager.loadRecent(MAX_ENTRIES);
            HttpUtil.sendJson(exchange, 200, JsonBuilder.buildHistoryResponse(entries));
        } catch (IOException e) {
            HttpUtil.sendError(exchange, 500, "Could not read history: " + e.getMessage());
        }
    }
}
