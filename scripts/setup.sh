# Setup script for Airline Management System
echo "🚀 Setting up Airline Management System..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Checking Prerequisites"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if Docker is installed
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
else
    print_warning "Docker is not installed. You'll need to run PostgreSQL manually."
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
    else
        COMPOSE_VERSION=$(docker compose version)
    fi
    print_success "Docker Compose is available: $COMPOSE_VERSION"
else
    print_warning "Docker Compose is not available. You'll need to run services manually."
fi

# Create necessary directories
print_step "Creating Directories"

directories=(
    "server/logs"
    "server/uploads"
    "server/backups"
    "client/build"
    "docs/screenshots"
    "scripts"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    else
        print_success "Directory already exists: $dir"
    fi
done

# Create environment files
print_step "Setting up Environment Files"

# Server .env
if [ ! -f "server/.env" ]; then
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        print_success "Created server/.env from example"
    else
        print_warning "server/.env.example not found, creating basic .env"
        cat > server/.env << EOF
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=airline_management
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-development
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars-development
CLIENT_URL=http://localhost:3000
ENABLE_SWAGGER=true
LOG_LEVEL=debug
EOF
    fi
else
    print_success "server/.env already exists"
fi

# Client .env
if [ ! -f "client/.env" ]; then
    if [ -f "client/.env.example" ]; then
        cp client/.env.example client/.env
        print_success "Created client/.env from example"
    else
        print_warning "client/.env.example not found, creating basic .env"
        cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Airline Management System
REACT_APP_VERSION=1.0.0
EOF
    fi
else
    print_success "client/.env already exists"
fi

# Install dependencies
print_step "Installing Dependencies"

# Server dependencies
print_success "Installing server dependencies..."
cd server
if npm install; then
    print_success "Server dependencies installed successfully"
else
    print_error "Failed to install server dependencies"
    exit 1
fi
cd ..

# Client dependencies
print_success "Installing client dependencies..."
cd client
if npm install; then
    print_success "Client dependencies installed successfully"
else
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

# Make scripts executable
print_step "Making Scripts Executable"

scripts=(
    "scripts/start-dev.sh"
    "scripts/test-api.sh"
    "scripts/setup.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        print_success "Made $script executable"
    fi
done

# Database setup
print_step "Database Setup"

if command -v docker &> /dev/null && (command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1); then
    print_success "Starting PostgreSQL with Docker..."
    
    # Start only PostgreSQL
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres
    else
        docker compose up -d postgres
    fi
    
    # Wait for PostgreSQL to be ready
    print_success "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    for i in {1..30}; do
        if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1 || docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start within expected time"
            exit 1
        fi
    done
else
    print_warning "Docker not available. Please ensure PostgreSQL is running manually."
    print_warning "Database: airline_management"
    print_warning "User: postgres"
    print_warning "Password: postgres"
fi

# Test API connection
print_step "Testing Setup"

# Start server in background for testing
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 5

# Test health endpoint
if curl -fs http://localhost:5000/health > /dev/null; then
    print_success "Server is running and responding"
else
    print_warning "Server health check failed, but this might be normal during first setup"
fi

# Kill test server
kill $SERVER_PID 2>/dev/null

# Final instructions
print_step "Setup Complete!"

echo -e "${GREEN}"
echo "✅ Airline Management System setup completed successfully!"
echo
echo "Next steps:"
echo "1. Start the development environment:"
echo "   ./scripts/start-dev.sh"
echo
echo "2. Or start services manually:"
echo "   - Backend: cd server && npm run dev"
echo "   - Frontend: cd client && npm start"
echo "   - Database: docker-compose up -d postgres"
echo
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - API Docs: http://localhost:5000/api-docs"
echo
echo "4. Default login credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo
echo "5. Test the API:"
echo "   ./scripts/test-api.sh"
echo -e "${NC}"

# Check for any warnings
if [ -n "$DOCKER_WARNING" ]; then
    print_warning "Remember to set up PostgreSQL manually since Docker is not available"
fi

print_success "Setup script completed successfully!"