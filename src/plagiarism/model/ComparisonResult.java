package plagiarism.model;

import java.util.List;

/**
 * Holds the result of comparing TWO documents.
 *
 * Three separate scores are stored, and the overall similarity is their average:
 *   - cosineSimilarity : based on word frequencies (how often each word is used)
 *   - jaccardSimilarity: based on shared vocabulary (which words are used)
 *   - phraseMatch      : based on word order (sequences of 4+ words copied)
 */
public class ComparisonResult {

    // Verdict limits (in %), kept as constants so they are easy to change and explain
    public static final double HIGH_LIMIT = 60.0;
    public static final double MODERATE_LIMIT = 35.0;
    public static final double LOW_LIMIT = 15.0;

    private final Document documentA;
    private final Document documentB;
    private final double cosineSimilarity;
    private final double jaccardSimilarity;
    private final double phraseMatch;
    private final List<String> commonWords;
    private final List<String> commonPhrases;

    public ComparisonResult(Document documentA, Document documentB,
                            double cosineSimilarity, double jaccardSimilarity, double phraseMatch,
                            List<String> commonWords, List<String> commonPhrases) {
        this.documentA = documentA;
        this.documentB = documentB;
        this.cosineSimilarity = cosineSimilarity;
        this.jaccardSimilarity = jaccardSimilarity;
        this.phraseMatch = phraseMatch;
        this.commonWords = commonWords;
        this.commonPhrases = commonPhrases;
    }

    /** Overall similarity = average of the three scores. */
    public double getOverallSimilarity() {
        return (cosineSimilarity + jaccardSimilarity + phraseMatch) / 3.0;
    }

    /** Turns the overall percentage into a simple, readable verdict. */
    public String getVerdict() {
        double overall = getOverallSimilarity();
        if (overall >= HIGH_LIMIT) {
            return "HIGH plagiarism";
        } else if (overall >= MODERATE_LIMIT) {
            return "MODERATE plagiarism";
        } else if (overall >= LOW_LIMIT) {
            return "LOW similarity";
        } else {
            return "ORIGINAL (no significant similarity)";
        }
    }

    public Document getDocumentA() {
        return documentA;
    }

    public Document getDocumentB() {
        return documentB;
    }

    public double getCosineSimilarity() {
        return cosineSimilarity;
    }

    public double getJaccardSimilarity() {
        return jaccardSimilarity;
    }

    public double getPhraseMatch() {
        return phraseMatch;
    }

    public List<String> getCommonWords() {
        return commonWords;
    }

    public List<String> getCommonPhrases() {
        return commonPhrases;
    }

    @Override
    public String toString() {
        return String.format("%s vs %s : %.2f%% (%s)",
                documentA.getName(), documentB.getName(), getOverallSimilarity(), getVerdict());
    }
}
