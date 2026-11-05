package plagiarism.core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Calculates how similar two documents are, using their WORD FREQUENCIES.
 * Every method returns a percentage between 0 and 100.
 *
 * 1) COSINE SIMILARITY  (uses how MANY times each word appears)
 *    Think of each document as a list of numbers: one count per word.
 *        Doc A: water=7, rain=1, cloud=2
 *        Doc B: water=5, rain=1, cloud=0
 *    cosine = (A . B) / (|A| * |B|)
 *        A . B = sum of (countInA * countInB) for every word     (the "dot product")
 *        |A|   = square root of (sum of countInA squared)         (the "length")
 *    If both documents use the same words in the same proportions, the result is 100%.
 *
 * 2) JACCARD SIMILARITY  (only cares WHETHER a word appears, not how often)
 *    jaccard = (words in BOTH documents) / (words in EITHER document)
 *            = |A intersection B| / |A union B|
 */
public class SimilarityCalculator {

    private SimilarityCalculator() {
    }

    /** Cosine similarity of two word-frequency maps, as a percentage. */
    public static double cosineSimilarity(Map<String, Integer> freqA, Map<String, Integer> freqB) {
        if (freqA.isEmpty() || freqB.isEmpty()) {
            return 0.0;
        }

        // Dot product: only words present in BOTH maps add something
        double dotProduct = 0.0;
        for (Map.Entry<String, Integer> entry : freqA.entrySet()) {
            Integer countInB = freqB.get(entry.getKey()); // null if the word is not in B
            if (countInB != null) {
                dotProduct += entry.getValue() * countInB; // Integer is auto-unboxed to int
            }
        }

        double lengthA = vectorLength(freqA);
        double lengthB = vectorLength(freqB);

        return (dotProduct / (lengthA * lengthB)) * 100.0;
    }

    /** sqrt(c1^2 + c2^2 + ...) */
    private static double vectorLength(Map<String, Integer> freq) {
        double sumOfSquares = 0.0;
        for (int count : freq.values()) {
            sumOfSquares += count * count;
        }
        return Math.sqrt(sumOfSquares);
    }

    /** Jaccard similarity of two sets of unique words, as a percentage. */
    public static double jaccardSimilarity(Set<String> wordsA, Set<String> wordsB) {
        // Intersection: start with A, keep only what is also in B
        Set<String> intersection = new HashSet<>(wordsA);
        intersection.retainAll(wordsB);

        // Union: start with A, add everything from B (a Set ignores duplicates)
        Set<String> union = new HashSet<>(wordsA);
        union.addAll(wordsB);

        if (union.isEmpty()) {
            return 0.0;
        }
        return (intersection.size() * 100.0) / union.size();
    }

    /**
     * Returns the keywords that appear in BOTH documents,
     * most frequent first (count in A + count in B), then A -> Z.
     */
    public static List<String> findCommonWords(Map<String, Integer> freqA, Map<String, Integer> freqB) {
        List<String> common = new ArrayList<>();
        for (String word : freqA.keySet()) {
            if (freqB.containsKey(word)) {
                common.add(word);
            }
        }

        common.sort((w1, w2) -> {
            int total1 = freqA.get(w1) + freqB.get(w1);
            int total2 = freqA.get(w2) + freqB.get(w2);
            if (total1 != total2) {
                return total2 - total1; // bigger total first
            }
            return w1.compareTo(w2);
        });
        return common;
    }
}
