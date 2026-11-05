package plagiarism.core;

import java.util.ArrayList;
import java.util.List;

import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;

/**
 * The main "engine" of the project. It uses the other classes to compare documents:
 *
 *   SimilarityCalculator -> cosine %, Jaccard %, common words
 *   PhraseFinder         -> phrase match %, common phrases
 *
 * With N documents, every PAIR is compared once:
 *   3 documents -> (A,B) (A,C) (B,C) = 3 comparisons
 *   formula: N * (N - 1) / 2
 */
public class PlagiarismChecker {

    private PlagiarismChecker() {
    }

    /** Compares exactly two documents. */
    public static ComparisonResult compare(Document a, Document b) {
        double cosine = SimilarityCalculator.cosineSimilarity(a.getWordFrequency(), b.getWordFrequency());

        // keySet() of the frequency map = the set of unique keywords
        double jaccard = SimilarityCalculator.jaccardSimilarity(
                a.getWordFrequency().keySet(), b.getWordFrequency().keySet());

        double phraseMatch = PhraseFinder.phraseMatchPercentage(a.getWords(), b.getWords());

        List<String> commonWords = SimilarityCalculator.findCommonWords(a.getWordFrequency(), b.getWordFrequency());
        List<String> commonPhrases = PhraseFinder.findCommonPhrases(a.getWords(), b.getWords());

        return new ComparisonResult(a, b, cosine, jaccard, phraseMatch, commonWords, commonPhrases);
    }

    /** Compares every pair of documents. Most similar pair comes first. */
    public static List<ComparisonResult> compareAll(List<Document> documents) {
        List<ComparisonResult> results = new ArrayList<>();

        for (int i = 0; i < documents.size(); i++) {
            for (int j = i + 1; j < documents.size(); j++) { // j starts after i -> no repeats, no self-compare
                results.add(compare(documents.get(i), documents.get(j)));
            }
        }

        // Sort by overall similarity, highest first
        results.sort((r1, r2) -> Double.compare(r2.getOverallSimilarity(), r1.getOverallSimilarity()));
        return results;
    }

    /**
     * Builds a 2D table (matrix) of overall similarity:
     *   matrix[i][j] = similarity between document i and document j
     * The diagonal (a document compared with itself) is 100.
     * The matrix is symmetric: matrix[i][j] == matrix[j][i].
     */
    public static double[][] buildSimilarityMatrix(List<Document> documents, List<ComparisonResult> results) {
        int n = documents.size();
        double[][] matrix = new double[n][n];

        for (int i = 0; i < n; i++) {
            matrix[i][i] = 100.0;
        }

        for (ComparisonResult result : results) {
            int i = documents.indexOf(result.getDocumentA());
            int j = documents.indexOf(result.getDocumentB());
            matrix[i][j] = result.getOverallSimilarity();
            matrix[j][i] = result.getOverallSimilarity();
        }
        return matrix;
    }
}
