package plagiarism.test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import plagiarism.core.DocumentReader;
import plagiarism.core.PhraseFinder;
import plagiarism.core.PlagiarismChecker;
import plagiarism.core.SimilarityCalculator;
import plagiarism.core.TextNormalizer;
import plagiarism.core.WordFrequencyCounter;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.history.HistoryEntry;
import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;
import plagiarism.server.JsonBuilder;
import plagiarism.server.RequestParser;

/**
 * TEST EVIDENCE for the project.
 *
 * A small hand-made test runner (no external library like JUnit needed):
 * every check() compares what our code returns with what we EXPECT,
 * and prints PASS or FAIL. At the end it prints the total.
 *
 * Run:  run-tests.bat
 */
public class PlagiarismTests {

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) {
        System.out.println("Running tests...\n");

        testTextNormalizer();
        testWordFrequency();
        testSimilarity();
        testPhrases();
        testChecker();
        testValidation();
        testServerHelpers();

        System.out.println("\n==================================================");
        System.out.println("Passed: " + passed + "   Failed: " + failed);
        System.out.println("==================================================");

        if (failed > 0) {
            System.exit(1); // non-zero exit code = something went wrong
        }
    }

    // ------------------------------------------------------------ helper

    private static void check(String testName, boolean condition) {
        if (condition) {
            passed++;
            System.out.println("  PASS  " + testName);
        } else {
            failed++;
            System.out.println("  FAIL  " + testName);
        }
    }

    private static boolean almostEqual(double a, double b) {
        return Math.abs(a - b) < 0.01;
    }

    private static Document doc(String name, String text) {
        return new Document(name, text);
    }

    // ------------------------------------------------------------ tests

    private static void testTextNormalizer() {
        System.out.println("TextNormalizer");
        check("lower case and punctuation removed",
                TextNormalizer.cleanText("Hello, WORLD!!").equals("hello world"));
        check("apostrophe removed (don't -> dont)",
                TextNormalizer.cleanText("Don't stop").equals("dont stop"));
        check("hyphen becomes a space",
                TextNormalizer.cleanText("water-cycle").equals("water cycle"));
        check("extra spaces and new lines collapsed",
                TextNormalizer.cleanText("  a \n\n  b  ").equals("a b"));
        check("toWords splits into a list",
                TextNormalizer.toWords("The sun, the rain.").equals(Arrays.asList("the", "sun", "the", "rain")));
        check("empty text gives an empty list",
                TextNormalizer.toWords("!!! ...").isEmpty());
        check("stop words removed",
                TextNormalizer.removeStopWords(Arrays.asList("the", "sun", "is", "hot"))
                        .equals(Arrays.asList("sun", "hot")));
    }

    private static void testWordFrequency() {
        System.out.println("WordFrequencyCounter");
        Map<String, Integer> freq = WordFrequencyCounter.countWords(Arrays.asList("rain", "sun", "rain", "rain"));
        check("counts each word", freq.get("rain") == 3 && freq.get("sun") == 1);
        check("number of unique words", freq.size() == 2);

        List<Map.Entry<String, Integer>> top = WordFrequencyCounter.topWords(freq, 1);
        check("top word is the most frequent", top.size() == 1 && top.get(0).getKey().equals("rain"));
        check("TreeMap sorts alphabetically",
                WordFrequencyCounter.sortAlphabetically(freq).firstKey().equals("rain"));
    }

    private static void testSimilarity() {
        System.out.println("SimilarityCalculator");
        Map<String, Integer> a = WordFrequencyCounter.countWords(Arrays.asList("water", "rain", "cloud"));
        Map<String, Integer> b = WordFrequencyCounter.countWords(Arrays.asList("code", "class", "object"));

        check("identical documents -> cosine 100%", almostEqual(SimilarityCalculator.cosineSimilarity(a, a), 100));
        check("no shared words -> cosine 0%", almostEqual(SimilarityCalculator.cosineSimilarity(a, b), 0));

        Set<String> setA = new HashSet<>(Arrays.asList("a", "b", "c"));
        Set<String> setB = new HashSet<>(Arrays.asList("b", "c", "d"));
        // shared {b, c} = 2, all {a, b, c, d} = 4  ->  2 / 4 = 50%
        check("Jaccard {a,b,c} vs {b,c,d} = 50%", almostEqual(SimilarityCalculator.jaccardSimilarity(setA, setB), 50));

        check("common words found",
                SimilarityCalculator.findCommonWords(a, a).size() == 3
                        && SimilarityCalculator.findCommonWords(a, b).isEmpty());
    }

    private static void testPhrases() {
        System.out.println("PhraseFinder");
        List<String> a = TextNormalizer.toWords("Yesterday heat from the sun causes water to evaporate quickly");
        List<String> b = TextNormalizer.toWords("In summer heat from the sun causes water to rise");

        List<String> phrases = PhraseFinder.findCommonPhrases(a, b);
        check("longest common phrase found",
                phrases.size() == 1 && phrases.get(0).equals("heat from the sun causes water to"));

        List<String> c = TextNormalizer.toWords("the sun is hot");
        List<String> d = TextNormalizer.toWords("the sun was hot");
        check("fewer than 4 matching words is not a phrase", PhraseFinder.findCommonPhrases(c, d).isEmpty());

        check("same text -> phrase match 100%", almostEqual(PhraseFinder.phraseMatchPercentage(a, a), 100));
        check("4-grams of a 5-word text = 2",
                PhraseFinder.buildNGrams(TextNormalizer.toWords("one two three four five"), 4).size() == 2);
    }

    private static void testChecker() {
        System.out.println("PlagiarismChecker / ComparisonResult");
        List<Document> docs = Arrays.asList(
                doc("a.txt", "Rivers carry fresh water from the mountains down to the sea."),
                doc("b.txt", "Rivers carry fresh water from the mountains down to the ocean."),
                doc("c.txt", "Java classes contain fields and methods."),
                doc("d.txt", "Inheritance allows code reuse between classes."));

        List<ComparisonResult> results = PlagiarismChecker.compareAll(docs);
        check("4 documents -> 4*3/2 = 6 pairs", results.size() == 6);
        check("results sorted, most similar first",
                results.get(0).getOverallSimilarity() >= results.get(1).getOverallSimilarity());
        check("most similar pair is a.txt and b.txt",
                results.get(0).getDocumentA().getName().equals("a.txt")
                        && results.get(0).getDocumentB().getName().equals("b.txt"));

        double[][] matrix = PlagiarismChecker.buildSimilarityMatrix(docs, results);
        check("matrix diagonal is 100", almostEqual(matrix[2][2], 100));
        check("matrix is symmetric", almostEqual(matrix[0][1], matrix[1][0]));

        ComparisonResult same = PlagiarismChecker.compare(docs.get(0), docs.get(0));
        check("same document -> 100% and HIGH verdict",
                almostEqual(same.getOverallSimilarity(), 100) && same.getVerdict().startsWith("HIGH"));
        ComparisonResult different = PlagiarismChecker.compare(docs.get(0), docs.get(2));
        check("unrelated documents -> ORIGINAL verdict", different.getVerdict().startsWith("ORIGINAL"));
    }

    private static void testValidation() {
        System.out.println("Validation and exceptions");
        check("empty document is rejected", throwsInvalidDocument(() -> DocumentReader.createDocument("e.txt", "   ")));
        check("punctuation-only document is rejected", throwsInvalidDocument(() -> DocumentReader.createDocument("p.txt", "?! ...")));
        check("missing file is rejected", throwsInvalidDocument(() -> DocumentReader.readDocument("no-such-file.txt")));
        check("non-.txt file is rejected", throwsInvalidDocument(() -> DocumentReader.readDocument("README.md")));
        check("only one file is rejected",
                throwsInvalidDocument(() -> DocumentReader.readAll(new String[] {"sample-docs/original.txt"})));
        check("sample files can be read", !throwsInvalidDocument(() -> DocumentReader.readAll(new String[] {
                "sample-docs/original.txt", "sample-docs/copied.txt"})));
    }

    private static void testServerHelpers() {
        System.out.println("Server helpers");
        try {
            List<Document> docs = RequestParser.parseDocuments(
                    "===DOCUMENT: one.txt\nfirst text\n===DOCUMENT: two.txt\nsecond text\n");
            check("RequestParser reads 2 documents",
                    docs.size() == 2 && docs.get(1).getName().equals("two.txt"));
        } catch (InvalidDocumentException e) {
            check("RequestParser reads 2 documents", false);
        }
        check("RequestParser rejects 1 document",
                throwsInvalidDocument(() -> RequestParser.parseDocuments("===DOCUMENT: one.txt\ntext\n")));

        check("JSON escaping of quotes and new lines",
                JsonBuilder.quote("say \"hi\"\nnow").equals("\"say \\\"hi\\\"\\nnow\""));

        HistoryEntry entry = new HistoryEntry("05-11-2026 10:00:00", "report_1", 2,
                "a, b.txt | c.txt", "a vs c", 42.5, "MODERATE plagiarism");
        HistoryEntry loaded = HistoryEntry.fromCsvLine(entry.toCsvLine());
        check("history entry survives CSV save and load (comma in name handled)",
                loaded.getDocumentCount() == 2 && almostEqual(loaded.getHighestSimilarity(), 42.5)
                        && loaded.getDocumentNames().equals("a; b.txt | c.txt"));
    }

    // ------------------------------------------------------------ exception helper

    /**
     * A functional interface: an action that may throw InvalidDocumentException.
     * It lets us pass code as a lambda, e.g.  () -> DocumentReader.readDocument("x.txt")
     */
    @FunctionalInterface
    private interface RiskyAction {
        void run() throws InvalidDocumentException;
    }

    private static boolean throwsInvalidDocument(RiskyAction action) {
        try {
            action.run();
            return false;
        } catch (InvalidDocumentException e) {
            return true;
        }
    }
}
