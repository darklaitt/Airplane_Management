@echo off
echo 🚀 Setting up Airline Management System on Windows...

REM Colors for Windows
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo.
echo %BLUE%=== Checking Prerequisites ===%NC%

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo %GREEN%✅ Node.js is installed: %NODE_VERSION%%NC%
) else (
    echo %RED%❌ Node.js is not installed. Please install Node.js 16+ and try again.%NC%
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo %GREEN%✅ npm is installed: %NPM_VERSION%%NC%
) else (
    echo %RED%❌ npm is not installed. Please install npm and try again.%NC%
    pause
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo %GREEN%✅ Docker is installed: %DOCKER_VERSION%%NC%
) else (
    echo %YELLOW%⚠️ Docker is not installed. You'll need to run PostgreSQL manually.%NC%
)

echo.
echo %BLUE%=== Creating Directories ===%NC%

if not exist "server\logs" mkdir "server\logs" && echo %GREEN%✅ Created server\logs%NC%
if not exist "server\uploads" mkdir "server\uploads" && echo %GREEN%✅ Created server\uploads%NC%
if not exist "server\backups" mkdir "server\backups" && echo %GREEN%✅ Created server\backups%NC%
if not exist "client\build" mkdir "client\build" && echo %GREEN%✅ Created client\build%NC%
if not exist "docs\screenshots" mkdir "docs\screenshots" && echo %GREEN%✅ Created docs\screenshots%NC%

echo.
echo %BLUE%=== Setting up Environment Files ===%NC%

REM Create server .env if it doesn't exist
if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo %GREEN%✅ Created server\.env from example%NC%
    ) else (
        echo NODE_ENV=development > "server\.env"
        echo PORT=5000 >> "server\.env"
        echo DB_HOST=localhost >> "server\.env"
        echo DB_PORT=5432 >> "server\.env"
        echo DB_USER=postgres >> "server\.env"
        echo DB_PASSWORD=1122 >> "server\.env"
        echo DB_NAME=airline_management >> "server\.env"
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-development >> "server\.env"
        echo JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars-development >> "server\.env"
        echo CLIENT_URL=http://localhost:3000 >> "server\.env"
        echo ENABLE_SWAGGER=true >> "server\.env"
        echo LOG_LEVEL=debug >> "server\.env"
        echo %GREEN%✅ Created basic server\.env%NC%
    )
) else (
    echo %GREEN%✅ server\.env already exists%NC%
)

REM Create client .env if it doesn't exist
if not exist "client\.env" (
    if exist "client\.env.example" (
        copy "client\.env.example" "client\.env" >nul
        echo %GREEN%✅ Created client\.env from example%NC%
    ) else (
        echo REACT_APP_API_URL=http://localhost:5000/api > "client\.env"
        echo REACT_APP_NAME=Airline Management System >> "client\.env"
        echo REACT_APP_VERSION=1.0.0 >> "client\.env"
        echo %GREEN%✅ Created basic client\.env%NC%
    )
) else (
    echo %GREEN%✅ client\.env already exists%NC%
)

echo.
echo %BLUE%=== Installing Dependencies ===%NC%

echo Installing server dependencies...
cd server
call npm install
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✅ Server dependencies installed successfully%NC%
) else (
    echo %RED%❌ Failed to install server dependencies%NC%
    pause
    exit /b 1
)
cd ..

echo Installing client dependencies...
cd client
call npm install
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✅ Client dependencies installed successfully%NC%
) else (
    echo %RED%❌ Failed to install client dependencies%NC%
    pause
    exit /b 1
)
cd ..

echo.
echo %BLUE%=== Database Setup ===%NC%

where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting PostgreSQL with Docker...
    docker-compose up -d postgres
    if %ERRORLEVEL% EQU 0 (
        echo %GREEN%✅ PostgreSQL started successfully%NC%
        echo Waiting for PostgreSQL to be ready...
        timeout /t 10 /nobreak >nul
        echo %GREEN%✅ PostgreSQL should be ready now%NC%
    ) else (
        echo %YELLOW%⚠️ Failed to start PostgreSQL with Docker%NC%
    )
) else (
    echo %YELLOW%⚠️ Docker not available. Please ensure PostgreSQL is running manually.%NC%
    echo %YELLOW%Database: airline_management%NC%
    echo %YELLOW%User: postgres%NC%
    echo %YELLOW%Password: postgres%NC%
)

echo.
echo %GREEN%✅ Airline Management System setup completed successfully!%NC%
echo.
echo Next steps:
echo 1. Start the development environment:
echo    start-dev.bat
echo.
echo 2. Or start services manually:
echo    - Backend: cd server ^&^& npm run dev
echo    - Frontend: cd client ^&^& npm start
echo    - Database: docker-compose up -d postgres
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - API Docs: http://localhost:5000/api-docs
echo.
echo 4. Default login credentials:
echo    - Username: admin
echo    - Password: admin123
echo.
echo 5. Test the API:
echo    test-api.bat
echo.
pause