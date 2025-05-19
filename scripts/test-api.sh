echo "🔧 Testing Airline Management System API..."

# Base URL
BASE_URL="http://localhost:5000"
API_URL="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for tests
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run test
run_test() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local auth_header="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $name... "
    
    if [ -n "$auth_header" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                -d "$data" \
                "$API_URL$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -X "$method" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                "$API_URL$endpoint")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_URL$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -X "$method" \
                "$API_URL$endpoint")
        fi
    fi
    
    # Extract status code (last 3 characters)
    status_code="${response: -3}"
    # Extract response body (everything except last 3 characters)
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} ($status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Save token for subsequent requests
        if [[ "$endpoint" == "/auth/login" && "$status_code" == "200" ]]; then
            ACCESS_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
            echo "  → Token saved for subsequent requests"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "  → Response: $body"
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -fs "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the server and try again."
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test authentication
echo "🔐 Testing Authentication..."
run_test "Login with valid credentials" "POST" "/auth/login" '{"username":"admin","password":"admin123"}' "200"
run_test "Login with invalid credentials" "POST" "/auth/login" '{"username":"admin","password":"wrong"}' "401"
run_test "Verify token" "GET" "/auth/verify" "" "200" "auth"
run_test "Get current user" "GET" "/auth/me" "" "200" "auth"
echo ""

# Test planes
echo "✈️ Testing Planes..."
run_test "Get all planes" "GET" "/planes" "" "200" "auth"
run_test "Create plane" "POST" "/planes" '{"name":"Test Plane","category":"Средний","seats_count":180}' "201" "auth"
run_test "Get plane by ID" "GET" "/planes/1" "" "200" "auth"
run_test "Update plane" "PUT" "/planes/1" '{"name":"Updated Plane","category":"Дальний","seats_count":200}' "200" "auth"
run_test "Get non-existent plane" "GET" "/planes/999" "" "404" "auth"
echo ""

# Test flights
echo "🛫 Testing Flights..."
run_test "Get all flights" "GET" "/flights" "" "200" "auth"
run_test "Create flight" "POST" "/flights" '{"flight_number":"TEST123","plane_id":1,"stops":["Москва","Сочи"],"departure_time":"12:00:00","free_seats":150,"price":10000}' "201" "auth"
run_test "Get flight by ID" "GET" "/flights/1" "" "200" "auth"
run_test "Find nearest flight" "GET" "/flights/search/nearest?destination=Санкт-Петербург" "" "200" "auth"
run_test "Get flights without stops" "GET" "/flights/search/non-stop" "" "200" "auth"
run_test "Get most expensive flight" "GET" "/flights/search/most-expensive" "" "200" "auth"
run_test "Check free seats" "GET" "/flights/check-seats/SU1234" "" "200" "auth"
echo ""

# Test tickets
echo "🎫 Testing Tickets..."
run_test "Get all tickets" "GET" "/tickets" "" "200" "auth"
run_test "Create ticket" "POST" "/tickets" '{"counter_number":1,"flight_number":"SU1234","flight_date":"2025-06-01","sale_time":"2025-05-20T10:00:00Z"}' "201" "auth"
run_test "Get ticket by ID" "GET" "/tickets/1" "" "200" "auth"
run_test "Get tickets by flight" "GET" "/tickets/flight/SU1234" "" "200" "auth"
echo ""

# Test reports
echo "📊 Testing Reports..."
run_test "General report" "GET" "/reports/general" "" "200" "auth"
run_test "Flight load report" "GET" "/reports/flight-load?startDate=2025-05-01&endDate=2025-05-31" "" "200" "auth"
run_test "Sales report" "GET" "/reports/sales?startDate=2025-05-01&endDate=2025-05-31" "" "200" "auth"
echo ""

# Test error handling
echo "🚨 Testing Error Handling..."
run_test "Invalid endpoint" "GET" "/invalid-endpoint" "" "404"
run_test "Unauthorized access" "GET" "/planes" "" "401"
run_test "Invalid JSON" "POST" "/auth/login" '{"invalid json"}' "400"
echo ""

# Summary
echo "📋 Test Summary:"
echo "==============================="
echo -e "Total tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"
echo -e "Success rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi