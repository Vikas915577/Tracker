@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
python "%SCRIPT_DIR%tracker_repair.py"
if errorlevel 1 goto :error
echo.
echo Dry-run passed. Review the listed five files.
set /p CONFIRM=Apply safe repair and create backups now? Type YES: 
if /I not "%CONFIRM%"=="YES" goto :done
python "%SCRIPT_DIR%tracker_repair.py" --apply
if errorlevel 1 goto :error
python "%SCRIPT_DIR%qa_after_repair.py"
if errorlevel 1 goto :error
:done
echo.
echo Ensure the terminal's current directory is the Tracker repository root. Inspect git diff before committing.
pause
exit /b 0
:error
echo.
echo STOP: validation failed; inspect error above. No commit was made.
pause
exit /b 1
