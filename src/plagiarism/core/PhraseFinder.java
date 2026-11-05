package plagiarism.core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Finds PHRASES (sequences of words) that appear in both documents.
 *
 * Word frequency alone cannot tell if sentences were copied, because it ignores
 * word ORDER. Phrases fix that: if 4 or more words appear in the same order in
 * both documents, that part was very likely copied.
 *
 * Key idea - an "n-gram" is a group of n words that come one after another.
 *   Text   : "heat from the sun causes water"
 *   4-grams: "heat from the sun", "from the sun causes", "the sun causes water"
 *
 * Steps:
 *   1. Put every 4-gram of document B into a HashSet (fast lookup).
 *   2. Walk through document A. When A's 4-gram is also in B, keep extending
 *      it one word at a time while it still matches -> the longest common phrase.
 *
 * Note: phrases use ALL words (stop words included), because word order matters here.
 */
public class PhraseFinder {

    // A phrase must have at least this many words in a row to count
    public static final int MIN_PHRASE_LENGTH = 4;

    private PhraseFinder() {
    }

    /** Joins words[from .. to-1] into one string, e.g. "heat from the sun". */
    private static String joinWords(List<String> words, int from, int to) {
        return String.join(" ", words.subList(from, to));
    }

    /** All n-grams (groups of n consecutive words) of a document. */
    public static Set<String> buildNGrams(List<String> words, int n) {
        Set<String> nGrams = new HashSet<>();
        for (int i = 0; i + n <= words.size(); i++) {
            nGrams.add(joinWords(words, i, i + n));
        }
        return nGrams;
    }

    /**
     * Returns the common phrases of A and B (each at least MIN_PHRASE_LENGTH words),
     * longest phrase first.
     */
    public static List<String> findCommonPhrases(List<String> wordsA, List<String> wordsB) {
        int n = MIN_PHRASE_LENGTH;
        Set<String> nGramsOfB = buildNGrams(wordsB, n);

        // LinkedHashSet: no duplicate phrases, and keeps the order we found them in
        Set<String> phrases = new LinkedHashSet<>();

        int i = 0;
        while (i + n <= wordsA.size()) {
            if (nGramsOfB.contains(joinWords(wordsA, i, i + n))) {
                // Found a match starting at i. Extend it as far as possible.
                int end = i + n; // phrase is words[i .. end-1]
                while (end < wordsA.size()
                        && nGramsOfB.contains(joinWords(wordsA, end - n + 1, end + 1))) {
                    end++;
                }

                List<String> phraseWords = wordsA.subList(i, end);
                if (hasMeaningfulWord(phraseWords)) {
                    phrases.add(joinWords(wordsA, i, end));
                }
                i = end; // continue searching after this phrase
            } else {
                i++;
            }
        }

        List<String> result = new ArrayList<>(phrases);
        // Longest phrase (most words) first
        result.sort((p1, p2) -> p2.split(" ").length - p1.split(" ").length);
        return result;
    }

    /**
     * Percentage of words (of BOTH documents together) that are part of a common phrase.
     * Example: A has 100 words, B has 80, and 45 + 45 of them are inside copied phrases
     *          -> 90 / 180 = 50%
     */
    public static double phraseMatchPercentage(List<String> wordsA, List<String> wordsB) {
        int total = wordsA.size() + wordsB.size();
        if (total == 0) {
            return 0.0;
        }

        int covered = countCoveredWords(wordsA, buildNGrams(wordsB, MIN_PHRASE_LENGTH))
                    + countCoveredWords(wordsB, buildNGrams(wordsA, MIN_PHRASE_LENGTH));

        return (covered * 100.0) / total;
    }

    /** Counts how many words of a document are inside an n-gram that the other document also has. */
    private static int countCoveredWords(List<String> words, Set<String> nGramsOfOther) {
        int n = MIN_PHRASE_LENGTH;
        boolean[] covered = new boolean[words.size()]; // all false at the start

        for (int i = 0; i + n <= words.size(); i++) {
            if (nGramsOfOther.contains(joinWords(words, i, i + n))) {
                for (int k = i; k < i + n; k++) {
                    covered[k] = true;
                }
            }
        }

        int count = 0;
        for (boolean isCovered : covered) {
            if (isCovered) {
                count++;
            }
        }
        return count;
    }

    /** A phrase like "and it is the" (only stop words) is not real copying, so we skip it. */
    private static boolean hasMeaningfulWord(List<String> phraseWords) {
        for (String word : phraseWords) {
            if (!TextNormalizer.isStopWord(word)) {
                return true;
            }
        }
        return false;
    }
}
