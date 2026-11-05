package plagiarism.model;

import java.util.List;
import java.util.Map;

import plagiarism.core.TextNormalizer;
import plagiarism.core.WordFrequencyCounter;

/**
 * Represents ONE text document that takes part in the comparison.
 *
 * When a Document object is created, it immediately prepares everything
 * the later stages need:
 *   - words         : all normalized words, in their original order (used for phrases)
 *   - keywords      : words without stop words                    (used for frequency)
 *   - wordFrequency : keyword -> how many times it appears
 *
 * Fields are private (encapsulation) and can only be read through getters.
 */
public class Document {

    private final String name;      // file name, e.g. "essay1.txt"
    private final String rawText;   // text exactly as it was in the file
    private final List<String> words;
    private final List<String> keywords;
    private final Map<String, Integer> wordFrequency;

    public Document(String name, String rawText) {
        this.name = name;
        this.rawText = rawText;
        this.words = TextNormalizer.toWords(rawText);
        this.keywords = TextNormalizer.removeStopWords(this.words);
        this.wordFrequency = WordFrequencyCounter.countWords(this.keywords);
    }

    public String getName() {
        return name;
    }

    public String getRawText() {
        return rawText;
    }

    public List<String> getWords() {
        return words;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public Map<String, Integer> getWordFrequency() {
        return wordFrequency;
    }

    public int getTotalWordCount() {
        return words.size();
    }

    public int getUniqueKeywordCount() {
        return wordFrequency.size();
    }

    @Override
    public String toString() {
        return name + " (" + getTotalWordCount() + " words, "
                + getUniqueKeywordCount() + " unique keywords)";
    }
}
