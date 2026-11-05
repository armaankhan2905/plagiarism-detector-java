@echo off
REM Compiles the project and starts the web server. Then open http://localhost:8080
cd /d "%~dp0"
call "%~dp0compile.bat" || exit /b 1
java -cp out plagiarism.server.PlagiarismServer %*
