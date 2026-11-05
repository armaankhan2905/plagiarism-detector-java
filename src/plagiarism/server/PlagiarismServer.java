package plagiarism.server;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;

/**
 * STAGE 4 - the BACKEND web server. Start this class, then open
 *   http://localhost:8080
 * in a browser.
 *
 * It uses the small web server that is built into the JDK (com.sun.net.httpserver),
 * so no extra library has to be downloaded.
 *
 * URL "routes" -> which handler class answers them:
 *   /               StaticFileHandler  (sends the web page: html, css, js)
 *   /samples        StaticFileHandler  (sends the sample .txt documents)
 *   /api/compare    CompareHandler     (POST documents, get results as JSON)
 *   /api/download   DownloadHandler    (download a saved .txt / .csv report)
 *   /api/history    HistoryHandler     (list of recent comparisons)
 *
 * MULTITHREADING: the server uses a pool of 4 threads, so up to 4 requests
 * can be handled at the SAME time (e.g. 4 students checking documents together).
 */
public class PlagiarismServer {

    public static final int DEFAULT_PORT = 8080;
    public static final int THREAD_COUNT = 4;

    // Shared by all threads -> must be protected (see nextRequestNumber)
    private static int requestCounter = 0;

    /**
     * Gives every request a unique number.
     *
     * "synchronized" = only ONE thread can be inside this method at a time.
     * Without it, two threads could read the same old value together and both
     * get the same number (a RACE CONDITION), because "requestCounter++" is
     * really three steps: read, add 1, write back.
     */
    public static synchronized int nextRequestNumber() {
        requestCounter++;
        return requestCounter;
    }

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]); // wrapper class method: String -> int
            } catch (NumberFormatException e) {
                System.out.println("Invalid port '" + args[0] + "', using " + DEFAULT_PORT);
            }
        }

        try {
            // "localhost" -> only this computer can open the site
            HttpServer server = HttpServer.create(new InetSocketAddress("localhost", port), 0);

            server.createContext("/", new StaticFileHandler("frontend", ""));
            server.createContext("/samples", new StaticFileHandler("sample-docs", "/samples"));
            server.createContext("/api/compare", new CompareHandler());
            server.createContext("/api/download", new DownloadHandler());
            server.createContext("/api/history", new HistoryHandler());

            ExecutorService threadPool = Executors.newFixedThreadPool(THREAD_COUNT);
            server.setExecutor(threadPool);

            server.start();

            System.out.println("==================================================");
            System.out.println(" Plagiarism Detector server is running");
            System.out.println(" Open:  http://localhost:" + port);
            System.out.println(" Press Ctrl + C to stop");
            System.out.println("==================================================");

        } catch (IOException e) {
            // Most common reason: another program is already using this port
            System.out.println("Could not start the server on port " + port + ": " + e.getMessage());
        }
    }
}
