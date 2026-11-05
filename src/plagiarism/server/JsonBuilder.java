package plagiarism.server;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import plagiarism.core.WordFrequencyCounter;
import plagiarism.history.HistoryEntry;
import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;

/**
 * Converts our Java objects into JSON text, which JavaScript in the browser can read.
 *
 * JSON in one minute:
 *   { "name": "essay.txt", "words": 125 }   -> an object  (like a Map)
 *   [ 1, 2, 3 ]                              -> an array   (like a List)
 *   strings are in "double quotes", numbers are written as they are.
 *
 * We build the JSON by hand with a StringBuilder (no external library needed).
 *
 * Shape of the answer for /api/compare:
 * {
 *   "reportName": "report_...",
 *   "summary":   { "pairs": 3, "average": 25.57, "flagged": 1 },
 *   "documents": [ { "name": ..., "totalWords": ..., "uniqueKeywords": ..., "topWords": [...] } ],
 *   "results":   [ { "documentA": ..., "documentB": ..., "cosine": ..., "overall": ..., ... } ],
 *   "matrix":    [ [100.0, 74.65], [74.65, 100.0] ],
 *   "reportText": "full text report ..."
 * }
 */
public class JsonBuilder {

    private static final int TOP_WORDS = 10;
    private static final int MAX_COMMON_WORDS = 30;

    private JsonBuilder() {
    }

    /** Builds the full JSON answer for a comparison. */
    public static String buildCompareResponse(List<Document> documents,
                                              List<ComparisonResult> results,
                                              double[][] matrix,
                                              String reportName,
                                              String reportText) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"reportName\":").append(quote(reportName)).append(",");
        json.append("\"summary\":").append(summaryToJson(results)).append(",");

        // documents array
        json.append("\"documents\":[");
        for (int i = 0; i < documents.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append(documentToJson(documents.get(i)));
        }
        json.append("],");

        // results array
        json.append("\"results\":[");
        for (int i = 0; i < results.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append(resultToJson(results.get(i)));
        }
        json.append("],");

        json.append("\"matrix\":").append(matrixToJson(matrix)).append(",");
        json.append("\"reportText\":").append(quote(reportText));
        json.append("}");
        return json.toString();
    }

    /**
     * JSON for /api/history:
     * { "history": [ { "date": ..., "reportName": ..., "documentCount": 3, ... }, ... ] }
     */
    public static String buildHistoryResponse(List<HistoryEntry> entries) {
        StringBuilder json = new StringBuilder("{\"history\":[");
        for (int i = 0; i < entries.size(); i++) {
            HistoryEntry e = entries.get(i);
            if (i > 0) {
                json.append(",");
            }
            json.append("{")
                .append("\"date\":").append(quote(e.getDate())).append(",")
                .append("\"reportName\":").append(quote(e.getReportName())).append(",")
                .append("\"documentCount\":").append(e.getDocumentCount()).append(",")
                .append("\"documentNames\":").append(quote(e.getDocumentNames())).append(",")
                .append("\"mostSimilarPair\":").append(quote(e.getMostSimilarPair())).append(",")
                .append("\"highestSimilarity\":").append(number(e.getHighestSimilarity())).append(",")
                .append("\"verdict\":").append(quote(e.getVerdict()))
                .append("}");
        }
        return json.append("]}").toString();
    }

    // ------------------------------------------------------------------ parts

    private static String summaryToJson(List<ComparisonResult> results) {
        double average = results.stream()
                .mapToDouble(ComparisonResult::getOverallSimilarity)
                .average()
                .orElse(0.0);
        long flagged = results.stream()
                .filter(r -> r.getOverallSimilarity() >= ComparisonResult.MODERATE_LIMIT)
                .count();

        return "{\"pairs\":" + results.size()
                + ",\"average\":" + number(average)
                + ",\"flagged\":" + flagged + "}";
    }

    private static String documentToJson(Document doc) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"name\":").append(quote(doc.getName())).append(",");
        json.append("\"totalWords\":").append(doc.getTotalWordCount()).append(",");
        json.append("\"uniqueKeywords\":").append(doc.getUniqueKeywordCount()).append(",");

        json.append("\"topWords\":[");
        List<Map.Entry<String, Integer>> top = WordFrequencyCounter.topWords(doc.getWordFrequency(), TOP_WORDS);
        for (int i = 0; i < top.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append("{\"word\":").append(quote(top.get(i).getKey()))
                .append(",\"count\":").append(top.get(i).getValue()).append("}");
        }
        json.append("]}");
        return json.toString();
    }

    private static String resultToJson(ComparisonResult r) {
        Document a = r.getDocumentA();
        Document b = r.getDocumentB();

        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"documentA\":").append(quote(a.getName())).append(",");
        json.append("\"documentB\":").append(quote(b.getName())).append(",");
        json.append("\"cosine\":").append(number(r.getCosineSimilarity())).append(",");
        json.append("\"jaccard\":").append(number(r.getJaccardSimilarity())).append(",");
        json.append("\"phraseMatch\":").append(number(r.getPhraseMatch())).append(",");
        json.append("\"overall\":").append(number(r.getOverallSimilarity())).append(",");
        json.append("\"verdict\":").append(quote(r.getVerdict())).append(",");

        // common words with the count in each document: {"word":"water","countA":7,"countB":5}
        List<String> words = r.getCommonWords();
        json.append("\"commonWordCount\":").append(words.size()).append(",");
        json.append("\"commonWords\":[");
        for (int i = 0; i < words.size() && i < MAX_COMMON_WORDS; i++) {
            if (i > 0) {
                json.append(",");
            }
            String w = words.get(i);
            json.append("{\"word\":").append(quote(w))
                .append(",\"countA\":").append(a.getWordFrequency().get(w))
                .append(",\"countB\":").append(b.getWordFrequency().get(w)).append("}");
        }
        json.append("],");

        json.append("\"commonPhrases\":[");
        List<String> phrases = r.getCommonPhrases();
        for (int i = 0; i < phrases.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append(quote(phrases.get(i)));
        }
        json.append("]}");
        return json.toString();
    }

    private static String matrixToJson(double[][] matrix) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < matrix.length; i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append("[");
            for (int j = 0; j < matrix[i].length; j++) {
                if (j > 0) {
                    json.append(",");
                }
                json.append(number(matrix[i][j]));
            }
            json.append("]");
        }
        return json.append("]").toString();
    }

    // ------------------------------------------------------------------ helpers

    /** A number with 2 decimals. Locale.US makes sure the decimal point is "." and not ",". */
    private static String number(double value) {
        return String.format(Locale.US, "%.2f", value);
    }

    /**
     * Puts a string inside JSON double quotes and ESCAPES special characters,
     * e.g.  He said "hi"  ->  "He said \"hi\""
     */
    public static String quote(String text) {
        StringBuilder result = new StringBuilder("\"");
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            switch (c) {
                case '"':  result.append("\\\""); break;
                case '\\': result.append("\\\\"); break;
                case '\n': result.append("\\n");  break;
                case '\r': result.append("\\r");  break;
                case '\t': result.append("\\t");  break;
                default:
                    if (c < 32) {
                        // other invisible control characters -> \\u00XX
                        result.append(String.format("\\u%04x", (int) c));
                    } else {
                        result.append(c);
                    }
            }
        }
        return result.append("\"").toString();
    }
}
