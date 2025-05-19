@echo off
echo 🚀 Starting Airline Management System in Development Mode...

REM Colors for Windows
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%❌ Docker is not running. Please start Docker and try again.%NC%
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "server\logs" mkdir "server\logs"
if not exist "client\build" mkdir "client\build"

REM Check if environment files exist
if not exist "server\.env" (
    echo %YELLOW%📝 Creating server\.env from example...%NC%
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
    ) else (
        echo %RED%❌ server\.env.example not found. Please run setup.bat first.%NC%
        pause
        exit /b 1
    )
)

if not exist "client\.env" (
    echo %YELLOW%📝 Creating client\.env from example...%NC%
    if exist "client\.env.example" (
        copy "client\.env.example" "client\.env" >nul
    ) else (
        echo %RED%❌ client\.env.example not found. Please run setup.bat first.%NC%
        pause
        exit /b 1
    )
)

echo.
echo %BLUE%🔧 Starting services...%NC%

REM Start PostgreSQL and Redis
echo Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

REM Wait for PostgreSQL to be ready
echo %YELLOW%⏳ Waiting for PostgreSQL to be ready...%NC%
:wait_for_postgres
timeout /t 2 /nobreak >nul
docker-compose exec postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto wait_for_postgres

echo %GREEN%✅ PostgreSQL is ready!%NC%

REM Start backend server
echo %BLUE%🖥️ Starting backend server...%NC%
start "Backend Server" cmd /k "cd server && npm run dev"

REM Wait for backend to be ready
echo %YELLOW%⏳ Waiting for backend to be ready...%NC%
:wait_for_backend
timeout /t 2 /nobreak >nul
curl -f http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto wait_for_backend

echo %GREEN%✅ Backend is ready!%NC%

REM Start frontend
echo %BLUE%🌐 Starting frontend...%NC%
start "Frontend" cmd /k "cd client && npm start"

echo.
echo %GREEN%🎉 Development environment is ready!%NC%
echo.
echo %BLUE%📱 Frontend: http://localhost:3000%NC%
echo %BLUE%🔧 Backend API: http://localhost:5000%NC%
echo %BLUE%📚 API Docs: http://localhost:5000/api-docs%NC%
echo %BLUE%🗄️ Database: localhost:5432%NC%
echo.
echo %YELLOW%🛑 To stop the development environment:%NC%
echo %YELLOW%   - Close the Backend and Frontend command windows%NC%
echo %YELLOW%   - Run: docker-compose down%NC%
echo.
echo %GREEN%Press any key to open the frontend in your browser...%NC%
pause >nul
start http://localhost:3000
