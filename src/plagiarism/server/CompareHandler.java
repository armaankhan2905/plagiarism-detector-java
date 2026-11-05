package plagiarism.server;

import java.io.IOException;
import java.util.List;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import plagiarism.core.PlagiarismChecker;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.history.HistoryEntry;
import plagiarism.history.HistoryManager;
import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;
import plagiarism.report.ReportGenerator;
import plagiarism.report.ReportWriter;

/**
 * Handles   POST /api/compare
 *
 * This is where the web page and our Stage 1-3 code meet:
 *   1. read the documents sent by the browser   (RequestParser)
 *   2. compare them                             (PlagiarismChecker)
 *   3. build and save the report                (ReportGenerator, ReportWriter)
 *   4. add a line to the history                (HistoryManager)
 *   5. send everything back as JSON             (JsonBuilder)
 *
 * It IMPLEMENTS the HttpHandler interface, so it must provide the handle() method.
 */
public class CompareHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        int requestNumber = PlagiarismServer.nextRequestNumber();
        String threadName = Thread.currentThread().getName();

        if (!exchange.getRequestMethod().equals("POST")) {
            HttpUtil.sendError(exchange, 405, "Use POST for /api/compare");
            return;
        }

        String body = HttpUtil.readBody(exchange);
        if (body == null) {
            HttpUtil.sendError(exchange, 413, "Documents are too large (max 5 MB in total)");
            return;
        }

        try {
            List<Document> documents = RequestParser.parseDocuments(body);
            List<ComparisonResult> results = PlagiarismChecker.compareAll(documents);
            double[][] matrix = PlagiarismChecker.buildSimilarityMatrix(documents, results);

            String reportText = ReportGenerator.generateTextReport(documents, results, matrix);

            // The request number is added to the name, so two requests in the
            // same second never overwrite each other's report
            String reportName = ReportWriter.createReportName() + "_" + requestNumber;
            ReportWriter.saveTextReport(reportText, reportName);
            ReportWriter.saveCsvReport(results, reportName);

            // Remember this comparison in the history file.
            // If that fails, the user still gets the results, so we only log it.
            try {
                HistoryManager.addEntry(HistoryEntry.fromComparison(reportName, documents, results));
            } catch (IOException e) {
                System.out.println("[request " + requestNumber + "] could not save history: " + e.getMessage());
            }

            String json = JsonBuilder.buildCompareResponse(documents, results, matrix, reportName, reportText);
            HttpUtil.sendJson(exchange, 200, json);

            System.out.println("[request " + requestNumber + " on " + threadName + "] compared "
                    + documents.size() + " documents -> " + reportName);

        } catch (InvalidDocumentException e) {
            // Problem with the user's input -> 400 Bad Request
            HttpUtil.sendError(exchange, 400, e.getMessage());
            System.out.println("[request " + requestNumber + "] rejected: " + e.getMessage());

        } catch (Exception e) {
            // Anything unexpected -> 500 Internal Server Error
            HttpUtil.sendError(exchange, 500, "Server error: " + e.getMessage());
            System.out.println("[request " + requestNumber + "] FAILED: " + e);
        }
    }
}
