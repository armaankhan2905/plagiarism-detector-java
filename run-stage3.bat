@echo off
REM Compiles the project, compares the sample documents and saves the report in the "reports" folder.
cd /d "%~dp0"
call "%~dp0compile.bat" || exit /b 1
java -cp out plagiarism.app.Stage3Demo %*
