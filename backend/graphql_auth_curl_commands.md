# GraphQL Authentication Testing with curl

This document provides comprehensive curl commands to test the authentication system of the GraphQL API.

## 1. User Signup/Registration

Registers a new user in the system.

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { signup(email: \"test@example.com\", password: \"password123\", name: \"Test User\") { token user { id email name registeredAt } } }"}'
```

Expected response:

```json
{
  "data": {
    "signup": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1",
        "email": "test@example.com",
        "name": "Test User",
        "registeredAt": "2023-01-01T00:00:00.000Z"
      }
    }
  }
}
```

## 2. User Login

Authenticates an existing user and returns a JWT token.

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"password123\") { token user { id email name registeredAt } } }"}'
```

Expected response:

```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1",
        "email": "test@example.com",
        "name": "Test User",
        "registeredAt": "2023-01-01T00:00:00.000Z"
      }
    }
  }
}
```

## 3. Testing Authenticated Queries

Queries that require authentication using the JWT token.

First, get a token by logging in:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"password123\") { token } }"}' | \
  grep -o '"token":"[^"]*"' | \
  cut -d'"' -f4)
echo $TOKEN
```

Use the token to access protected queries:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ me { id email name registeredAt } }"}'
```

Expected response:

```json
{
  "data": {
    "me": {
      "id": "1",
      "email": "test@example.com",
      "name": "Test User",
      "registeredAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## 4. Error Cases

### 4a. Invalid Credentials

Attempting to login with incorrect password:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"wrongpassword\") { token user { id email name } } }"}'
```

Expected response:

```json
{
  "errors": [
    {
      "message": "Invalid email or password",
      "locations": [
        {
          "line": 1,
          "column": 12
        }
      ],
      "path": ["login"]
    }
  ],
  "data": {
    "login": null
  }
}
```

### 4b. Missing Fields

Attempting to login without providing required fields:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\") { token user { id email name } } }"}'
```

Expected response:

```json
{
  "errors": [
    {
      "message": "Field 'LoginInput.password' of required type 'String!' was not provided.",
      "locations": [
        {
          "line": 1,
          "column": 27
        }
      ]
    }
  ]
}
```

### 4c. Accessing Protected Route Without Token

Attempting to access a protected query without providing a JWT token:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email name } }"}'
```

Expected response:

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "locations": [
        {
          "line": 1,
          "column": 3
        }
      ],
      "path": ["me"]
    }
  ],
  "data": {
    "me": null
  }
}
```

### 4d. Accessing Protected Route With Invalid Token

Attempting to access a protected query with an invalid JWT token:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.token.here" \
  -d '{"query": "{ me { id email name } }"}'
```

Expected response:

```json
{
  "errors": [
    {
      "message": "Invalid token",
      "locations": [
        {
          "line": 1,
          "column": 3
        }
      ],
      "path": ["me"]
    }
  ],
  "data": {
    "me": null
  }
}
```

### 4e. Duplicate User Registration

Attempting to register a user with an email that already exists:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { signup(email: \"test@example.com\", password: \"password123\", name: \"Another Test User\") { token user { id email name } } }"}'
```

Expected response:

```json
{
  "errors": [
    {
      "message": "User with this email already exists",
      "locations": [
        {
          "line": 1,
          "column": 12
        }
      ],
      "path": ["signup"]
    }
  ],
  "data": {
    "signup": null
  }
}
```

## 5. Complete Test Script

Here's a complete bash script that tests all authentication flows:

```bash
#!/bin/bash

# GraphQL Authentication Test Script

# Server URL
SERVER_URL="http://localhost:4000/graphql"

# Test user credentials
test_email="testuser@example.com"
test_password="testpassword123"
test_name="Test User"

# Colors for output
green='\033[0;32m'
red='\033[0;31m'
blue='\033[0;34m'
cyan='\033[0;36m'
yellow='\033[1;33m'
normal='\033[0m'

# Function to print section headers
echo_header() {
  echo -e "${blue}=== $1 ===${normal}"
}

# Function to print test results
echo_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${green}✓ PASSED${normal}: $2"
  else
    echo -e "${red}✗ FAILED${normal}: $2"
  fi
}

# Start testing
echo_header "GraphQL Authentication Testing"
echo "Server: $SERVER_URL"
echo

# 1. User Signup
echo_header "1. User Signup"
echo "Registering new user: $test_email"

signup_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { signup(email: "'"$test_email"'", password: "'"$test_password"'", name: "'"$test_name"'") { token user { id email name } } }"}')

# Check if signup was successful
if echo "$signup_response" | grep -q '"token"'; then
  echo_result 0 "User signup successful"

  # Extract token for later use
  token=$(echo "$signup_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "${cyan}Token:${normal} $token"

  # Extract user ID
  user_id=$(echo "$signup_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${cyan}User ID:${normal} $user_id"
else
  echo_result 1 "User signup failed"
  echo "Response: $signup_response"
  exit 1
fi
echo

# 2. User Login
echo_header "2. User Login"
echo "Logging in user: $test_email"

login_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: "'"$test_email"'", password: "'"$test_password"'") { token user { id email name } } }"}')

# Check if login was successful
if echo "$login_response" | grep -q '"token"'; then
  echo_result 0 "User login successful"

  # Extract token
  login_token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "${cyan}Token:${normal} $login_token"
else
  echo_result 1 "User login failed"
  echo "Response: $login_response"
  exit 1
fi
echo

# 3. Authenticated Query
echo_header "3. Authenticated Query"
echo "Accessing protected 'me' query"

me_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $login_token" \
  -d '{"query": "{ me { id email name } }"}')

# Check if authenticated query was successful
if echo "$me_response" | grep -q '"me"'; then
  echo_result 0 "Authenticated query successful"
  echo "Response: $me_response"
else
  echo_result 1 "Authenticated query failed"
  echo "Response: $me_response"
fi
echo

# 4. Error Cases
echo_header "4. Error Cases"

# 4a. Invalid credentials
echo "Testing invalid credentials"
invalid_login_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: "'"$test_email"'", password: "wrongpassword") { token user { id email name } } }"}')

if echo "$invalid_login_response" | grep -q '"Invalid email or password"'; then
  echo_result 0 "Invalid credentials error handled correctly"
else
  echo_result 1 "Invalid credentials error not handled correctly"
  echo "Response: $invalid_login_response"
fi

# 4b. Access without token
echo "Testing access without token"
no_token_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email name } }"}')

if echo "$no_token_response" | grep -q '"Not authenticated"'; then
  echo_result 0 "Missing token error handled correctly"
else
  echo_result 1 "Missing token error not handled correctly"
  echo "Response: $no_token_response"
fi

# 4c. Invalid token
echo "Testing invalid token"
invalid_token_response=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.token.value" \
  -d '{"query": "{ me { id email name } }"}')

if echo "$invalid_token_response" | grep -q '"Invalid token"'; then
  echo_result 0 "Invalid token error handled correctly"
else
  echo_result 1 "Invalid token error not handled correctly"
  echo "Response: $invalid_token_response"
fi
echo

echo_header "Authentication Testing Complete"
```

## Notes

1. Replace `http://localhost:4000/graphql` with your actual GraphQL endpoint if different.
2. Replace test credentials with actual test values.
3. The JWT token is valid for 7 days based on the server configuration.
4. All GraphQL queries and mutations must be properly formatted JSON strings in the request body.
5. Make sure the GraphQL server is running before executing these commands.
