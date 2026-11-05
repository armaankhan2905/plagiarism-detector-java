package plagiarism.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Counts how many times each word appears in a document.
 *
 * Example:
 *   [water, cycle, water, rain]  -->  {water=2, cycle=1, rain=1}
 *
 * Collections used:
 *   - HashMap  : fast counting (key = word, value = count), no fixed order
 *   - TreeMap  : same data, but keys kept in ALPHABETICAL order
 *   - ArrayList + Comparator : to sort words by how often they appear
 */
public class WordFrequencyCounter {

    private WordFrequencyCounter() {
    }

    /** Builds the word -> count map. */
    public static Map<String, Integer> countWords(List<String> words) {
        Map<String, Integer> frequency = new HashMap<>();

        for (String word : words) {
            // getOrDefault: if the word is not in the map yet, start from 0
            int oldCount = frequency.getOrDefault(word, 0);
            frequency.put(word, oldCount + 1);
        }
        return frequency;
    }

    /** Returns the same counts, but sorted A -> Z by word. */
    public static TreeMap<String, Integer> sortAlphabetically(Map<String, Integer> frequency) {
        return new TreeMap<>(frequency);
    }

    /**
     * Returns the N most frequent words, highest count first.
     * If two words have the same count, they are sorted alphabetically.
     */
    public static List<Map.Entry<String, Integer>> topWords(Map<String, Integer> frequency, int n) {
        // Copy all (word, count) pairs into a list so that we can sort them
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(frequency.entrySet());

        // Comparator written as a lambda
        entries.sort((e1, e2) -> {
            int byCount = e2.getValue().compareTo(e1.getValue()); // bigger count first
            if (byCount != 0) {
                return byCount;
            }
            return e1.getKey().compareTo(e2.getKey());            // then A -> Z
        });

        // Keep only the first n entries
        if (entries.size() > n) {
            return new ArrayList<>(entries.subList(0, n));
        }
        return entries;
    }
}
