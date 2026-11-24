# Container for the Java backend (used by Render).
# Only the JDK is needed - the project has no external libraries.
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY src ./src
RUN javac -d out -sourcepath src src/plagiarism/server/*.java

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/out ./out
COPY frontend ./frontend
COPY sample-docs ./sample-docs
# Render sets PORT; the server reads it and listens on 0.0.0.0
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-cp", "out", "plagiarism.server.PlagiarismServer"]
