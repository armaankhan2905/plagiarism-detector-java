package plagiarism.core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Cleans ("normalizes") raw text so that two documents can be compared fairly.
 *
 * Example:
 *   "The Water-Cycle is IMPORTANT!"  -->  [the, water, cycle, is, important]
 *
 * Steps:
 *   1. Convert everything to lower case  ("Water" and "water" become the same word)
 *   2. Remove apostrophes                ("don't" -> "dont")
 *   3. Replace punctuation with spaces   ("water-cycle" -> "water cycle")
 *   4. Collapse many spaces into one and trim the ends
 *   5. Split the text into a list of words
 *
 * It also knows about STOP WORDS: very common words like "the", "is", "and".
 * They appear in almost every document, so we ignore them when comparing
 * word frequencies (otherwise every two documents would look similar).
 *
 * All methods are static: this class is a "utility class", we never need an object of it.
 */
public class TextNormalizer {

    // A HashSet gives very fast "contains" checks, and stores each word only once.
    private static final Set<String> STOP_WORDS = new HashSet<>();

    // STATIC BLOCK: runs only ONCE, when the class is first loaded into memory.
    // We use it to fill the stop-word set.
    static {
        String[] words = {
            "a", "an", "the", "and", "or", "but", "if", "then", "so", "of",
            "to", "in", "on", "at", "by", "for", "with", "from", "as", "into",
            "is", "am", "are", "was", "were", "be", "been", "being",
            "has", "have", "had", "do", "does", "did",
            "it", "its", "this", "that", "these", "those",
            "i", "me", "my", "we", "our", "you", "your",
            "he", "him", "his", "she", "her", "they", "them", "their",
            "which", "who", "whom", "what", "when", "where", "why", "how",
            "not", "no", "can", "will", "would", "should", "could", "may", "might",
            "also", "very", "than", "there", "here", "all", "any", "such",
            "some", "each", "other", "more", "most", "only", "while", "just"
        };
        for (String word : words) {
            STOP_WORDS.add(word);
        }
    }

    // Private constructor: nobody can create an object of this utility class.
    private TextNormalizer() {
    }

    /**
     * Steps 1-4: lower case, remove punctuation, fix spaces.
     * Returns one clean string, e.g. "the water cycle is important".
     */
    public static String cleanText(String text) {
        if (text == null) {
            return "";
        }
        String result = text.toLowerCase();
        result = result.replace("'", "");                 // don't -> dont
        result = result.replaceAll("[^a-z0-9\\s]", " ");  // anything that is NOT a letter, digit or space -> space
        result = result.replaceAll("\\s+", " ");          // many spaces / new lines -> one space
        return result.trim();
    }

    /**
     * Step 5: split the cleaned text into words (in the same order as the document).
     * We keep the order because Stage 2 needs it to find common PHRASES.
     */
    public static List<String> toWords(String text) {
        List<String> words = new ArrayList<>();
        String cleaned = cleanText(text);

        if (cleaned.isEmpty()) {
            return words; // empty list
        }

        String[] parts = cleaned.split(" ");
        for (String part : parts) {
            words.add(part);
        }
        return words;
    }

    /**
     * Returns a NEW list that contains only the meaningful words (stop words removed).
     * The original list is not changed.
     */
    public static List<String> removeStopWords(List<String> words) {
        List<String> keywords = new ArrayList<>();
        for (String word : words) {
            if (!isStopWord(word)) {
                keywords.add(word);
            }
        }
        return keywords;
    }

    public static boolean isStopWord(String word) {
        return STOP_WORDS.contains(word);
    }
}
