echo "🚀 Starting Airline Management System in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create logs directory
mkdir -p server/logs
mkdir -p client/build

# Copy environment files if they don't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from example..."
    cp server/.env.example server/.env
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client/.env from example..."
    cp client/.env.example client/.env
fi

# Start development services
echo "🔧 Starting services..."
docker-compose -f docker-compose.yml up --build -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Start backend in development mode
echo "🖥️  Starting backend server..."
cd server
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
until curl -fs http://localhost:5000/health > /dev/null 2>&1; do
    sleep 2
done

echo "✅ Backend is ready!"

# Start frontend in development mode
echo "🌐 Starting frontend..."
cd client
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api-docs"
echo "🗄️  Database: localhost:5432"
echo ""
echo "🛑 To stop the development environment:"
echo "   - Press Ctrl+C to stop frontend and backend"
echo "   - Run: docker-compose down"
echo ""

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose down
    echo "✅ Cleanup complete!"
}

trap cleanup EXIT

# Wait for user to stop
wait