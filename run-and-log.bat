@echo off
echo === Starting Hardhat with output to file ===

set "OUTPUT_FILE=hardhat-output.txt"
set "START_TIME=%TIME%"

echo [%DATE% %TIME%] Starting Hardhat... > "%OUTPUT_FILE%"
echo Working directory: %CD% >> "%OUTPUT_FILE%"

echo Running: npx hardhat run scripts/test-simple.js
npx hardhat run scripts/test-simple.js >> "%OUTPUT_FILE%" 2>&1

set "ERRORLEVEL=%ERRORLEVEL%"
echo [%DATE% %TIME%] Process exited with code %ERRORLEVEL% >> "%OUTPUT_FILE%"

echo.
echo === Hardhat execution completed ===
echo Output has been written to: %OUTPUT_FILE%
echo Start time: %START_TIME%
echo End time: %TIME%
echo Exit code: %ERRORLEVEL%

if "%ERRORLEVEL%" NEQ "0" (
    echo !!! Hardhat execution failed with error code %ERRORLEVEL%
    type "%OUTPUT_FILE%"
    exit /b %ERRORLEVEL%
)

exit /b 0
