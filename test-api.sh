#!/bin/bash

echo "🧪 Testing Date Chat Pro API Endpoints..."

# Base URL
BASE_URL="http://localhost:12000"

# Test Health Check
echo "Testing Health Check..."
curl -s $BASE_URL/api/health | jq . || echo "Health endpoint response"

# Test Authentication endpoints
echo "Testing Auth endpoints..."
curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123456"}' | jq . || echo "Signup endpoint"

# Test Dating endpoints
echo "Testing Dating endpoints..."
curl -s $BASE_URL/api/dating/discover | jq . || echo "Discover endpoint"

echo "✅ API Testing Complete!"