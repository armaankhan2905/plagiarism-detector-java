@echo off
REM Compiles all Java code into the "out" folder.
REM -sourcepath src lets javac find and compile every class that these files use.
cd /d "%~dp0"
if exist out rmdir /s /q out
javac -d out -sourcepath src src\plagiarism\app\*.java src\plagiarism\server\*.java src\plagiarism\test\*.java
if errorlevel 1 (
    echo Compilation FAILED.
    exit /b 1
)
echo Compilation successful.
