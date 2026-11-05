package plagiarism.app;

import java.io.File;
import java.io.IOException;
import java.util.List;

import plagiarism.core.DocumentReader;
import plagiarism.core.PlagiarismChecker;
import plagiarism.exception.InvalidDocumentException;
import plagiarism.model.ComparisonResult;
import plagiarism.model.Document;
import plagiarism.report.ReportGenerator;
import plagiarism.report.ReportWriter;

/**
 * STAGE 3 console demo - the complete pipeline:
 *
 *   read files -> normalize -> compare -> build report -> save .txt and .csv
 *
 * Run without arguments to use the sample files, or pass your own file paths:
 *   java -cp out plagiarism.app.Stage3Demo a.txt b.txt c.txt
 */
public class Stage3Demo {

    public static void main(String[] args) {
        String[] files = args;
        if (files.length == 0) {
            files = new String[] {
                "sample-docs/original.txt",
                "sample-docs/copied.txt",
                "sample-docs/different.txt"
            };
        }

        try {
            // 1-2. Read and normalize
            List<Document> documents = DocumentReader.readAll(files);

            // 3-5. Compare frequencies, find phrases, calculate percentages
            List<ComparisonResult> results = PlagiarismChecker.compareAll(documents);
            double[][] matrix = PlagiarismChecker.buildSimilarityMatrix(documents, results);

            // 6. Generate the report
            String reportText = ReportGenerator.generateTextReport(documents, results, matrix);
            System.out.println(reportText);

            String reportName = ReportWriter.createReportName();
            File textFile = ReportWriter.saveTextReport(reportText, reportName);
            File csvFile = ReportWriter.saveCsvReport(results, reportName);

            System.out.println("Text report saved to : " + textFile.getAbsolutePath());
            System.out.println("CSV report saved to  : " + csvFile.getAbsolutePath());

        } catch (InvalidDocumentException e) {
            System.out.println("ERROR in documents: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("ERROR while saving the report: " + e.getMessage());
        }
    }
}
