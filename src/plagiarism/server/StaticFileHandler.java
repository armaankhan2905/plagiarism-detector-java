package plagiarism.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * Sends files from one folder to the browser. We use it twice:
 *
 *   new StaticFileHandler("frontend", "")
 *       http://localhost:8080/                      -> frontend/index.html
 *       http://localhost:8080/style.css             -> frontend/style.css
 *
 *   new StaticFileHandler("sample-docs", "/samples")
 *       http://localhost:8080/samples/original.txt  -> sample-docs/original.txt
 *
 * SECURITY: we check that the requested file is really INSIDE the folder,
 * so a request like "/../src/..." cannot read other files.
 */
public class StaticFileHandler implements HttpHandler {

    private final File rootFolder;
    private final String urlPrefix; // part of the URL to remove before looking for the file

    public StaticFileHandler(String folderName, String urlPrefix) {
        this.rootFolder = new File(folderName);
        this.urlPrefix = urlPrefix;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        if (!method.equals("GET") && !method.equals("HEAD")) {
            HttpUtil.sendError(exchange, 405, "Only GET is allowed here");
            return;
        }

        String path = exchange.getRequestURI().getPath();
        if (path.startsWith(urlPrefix)) {
            path = path.substring(urlPrefix.length()); // "/samples/a.txt" -> "/a.txt"
        }
        if (path.isEmpty() || path.equals("/")) {
            path = "/index.html";
        }

        File file = new File(rootFolder, path);

        // getCanonicalPath() resolves ".." so we get the REAL location of the file
        String rootPath = rootFolder.getCanonicalPath() + File.separator;
        if (!file.getCanonicalPath().startsWith(rootPath) || !file.isFile()) {
            HttpUtil.send(exchange, 404, "text/plain; charset=UTF-8", "404 - Page not found".getBytes());
            return;
        }

        byte[] content;
        try (FileInputStream in = new FileInputStream(file)) {
            content = in.readAllBytes();
        }
        HttpUtil.send(exchange, 200, getContentType(file.getName()), content);
    }

    /** Tells the browser what kind of file it is receiving. */
    private static String getContentType(String fileName) {
        String name = fileName.toLowerCase();
        if (name.endsWith(".html")) {
            return "text/html; charset=UTF-8";
        } else if (name.endsWith(".css")) {
            return "text/css; charset=UTF-8";
        } else if (name.endsWith(".js")) {
            return "application/javascript; charset=UTF-8";
        } else if (name.endsWith(".txt")) {
            return "text/plain; charset=UTF-8";
        } else if (name.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (name.endsWith(".png")) {
            return "image/png";
        } else if (name.endsWith(".ico")) {
            return "image/x-icon";
        }
        return "application/octet-stream";
    }
}
