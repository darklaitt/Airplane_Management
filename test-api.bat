@echo off
echo 🔧 Testing Airline Management System API...

REM Colors for Windows
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Base URL
set BASE_URL=http://localhost:5000
set API_URL=%BASE_URL%/api

REM Test counters
set TOTAL_TESTS=0
set PASSED_TESTS=0

REM Check if curl is available
where curl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%❌ curl is not available. Please install curl or use Git Bash.%NC%
    echo You can also test the API using Postman with the provided collection.
    pause
    exit /b 1
)

REM Check if server is running
echo %BLUE%🔍 Checking if server is running...%NC%
curl -fs %BASE_URL%/health >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%❌ Server is not running at %BASE_URL%%NC%
    echo Please start the server and try again.
    pause
    exit /b 1
)
echo %GREEN%✅ Server is running%NC%
echo.

REM Function to run test (simulated with labels and calls)
echo %BLUE%🔐 Testing Authentication...%NC%

REM Test login with valid credentials
set /a TOTAL_TESTS+=1
echo Testing Login with valid credentials...
curl -s -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" %API_URL%/auth/login >temp_response.txt 2>nul
set /p RESPONSE=<temp_response.txt
set STATUS_CODE=%RESPONSE:~-3%
if "%STATUS_CODE%"=="200" (
    echo %GREEN%✓ PASSED%NC% (%STATUS_CODE%)
    set /a PASSED_TESTS+=1
    REM Extract token (simplified, just show success)
    echo   → Login successful, token received
) else (
    echo %RED%✗ FAILED%NC% (Expected: 200, Got: %STATUS_CODE%)
)

REM Test login with invalid credentials
set /a TOTAL_TESTS+=1
echo Testing Login with invalid credentials...
curl -s -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"wrong\"}" %API_URL%/auth/login >temp_response.txt 2>nul
set /p RESPONSE=<temp_response.txt
set STATUS_CODE=%RESPONSE:~-3%
if "%STATUS_CODE%"=="401" (
    echo %GREEN%✓ PASSED%NC% (%STATUS_CODE%)
    set /a PASSED_TESTS+=1
) else (
    echo %RED%✗ FAILED%NC% (Expected: 401, Got: %STATUS_CODE%)
)

echo.
echo %BLUE%✈️ Testing Planes (without authentication)...%NC%

REM Test unauthorized access
set /a TOTAL_TESTS+=1
echo Testing Unauthorized access to planes...
curl -s -w "%%{http_code}" -X GET %API_URL%/planes >temp_response.txt 2>nul
set /p RESPONSE=<temp_response.txt
set STATUS_CODE=%RESPONSE:~-3%
if "%STATUS_CODE%"=="401" (
    echo %GREEN%✓ PASSED%NC% (%STATUS_CODE%)
    set /a PASSED_TESTS+=1
) else (
    echo %RED%✗ FAILED%NC% (Expected: 401, Got: %STATUS_CODE%)
)

echo.
echo %BLUE%🚨 Testing Error Handling...%NC%

REM Test invalid endpoint
set /a TOTAL_TESTS+=1
echo Testing Invalid endpoint...
curl -s -w "%%{http_code}" -X GET %API_URL%/invalid-endpoint >temp_response.txt 2>nul
set /p RESPONSE=<temp_response.txt
set STATUS_CODE=%RESPONSE:~-3%
if "%STATUS_CODE%"=="404" (
    echo %GREEN%✓ PASSED%NC% (%STATUS_CODE%)
    set /a PASSED_TESTS+=1
) else (
    echo %RED%✗ FAILED%NC% (Expected: 404, Got: %STATUS_CODE%)
)

REM Test health endpoint
set /a TOTAL_TESTS+=1
echo Testing Health endpoint...
curl -s -w "%%{http_code}" -X GET %BASE_URL%/health >temp_response.txt 2>nul
set /p RESPONSE=<temp_response.txt
set STATUS_CODE=%RESPONSE:~-3%
if "%STATUS_CODE%"=="200" (
    echo %GREEN%✓ PASSED%NC% (%STATUS_CODE%)
    set /a PASSED_TESTS+=1
) else (
    echo %RED%✗ FAILED%NC% (Expected: 200, Got: %STATUS_CODE%)
)

REM Cleanup
del temp_response.txt >nul 2>&1

echo.
echo %BLUE%📋 Test Summary:%NC%
echo ===============================
echo Total tests: %TOTAL_TESTS%
echo Passed: %GREEN%%PASSED_TESTS%%NC%
set /a FAILED_TESTS=%TOTAL_TESTS%-%PASSED_TESTS%
echo Failed: %RED%%FAILED_TESTS%%NC%
set /a SUCCESS_RATE=%PASSED_TESTS%*100/%TOTAL_TESTS%
echo Success rate: %SUCCESS_RATE%%%

if %PASSED_TESTS% EQU %TOTAL_TESTS% (
    echo.
    echo %GREEN%🎉 All tests passed!%NC%
) else (
    echo.
    echo %YELLOW%⚠️ Some tests failed. This might be normal if you haven't logged in yet.%NC%
    echo %YELLOW%For full testing, use Postman with the provided collection.%NC%
)

echo.
echo %BLUE%💡 For comprehensive API testing:%NC%
echo 1. Import scripts/postman-import.json into Postman
echo 2. Import scripts/postman-environment.json as environment
echo 3. Run the full test suite in Postman
echo.
pause