@echo off
REM Compiles the project and runs the Stage 1 console demo on the sample documents.
cd /d "%~dp0"
call "%~dp0compile.bat" || exit /b 1
java -cp out plagiarism.app.Stage1Demo %*
