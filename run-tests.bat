@echo off
REM Compiles the project and runs the automated tests.
cd /d "%~dp0"
call "%~dp0compile.bat" || exit /b 1
java -cp out plagiarism.test.PlagiarismTests
