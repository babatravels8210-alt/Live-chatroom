#!/bin/bash

# Date Chat Pro Production Deployment Script
# This script sets up the application for production deployment

echo "🚀 Starting Date Chat Pro Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "Prerequisites check passed!"

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install --production

# Install client dependencies and build
print_status "Installing client dependencies and building..."
cd client
npm install --production
npm run build
cd ..

# Create production environment file
print_status "Setting up production environment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_warning ".env.production not found. Creating from template..."
    cp .env.production .env
else
    cp .env.production .env
fi

# Build client for production
print_status "Building client for production..."
cd client
npm run build
cd ..

# Create production build directory
print_status "Creating production build..."
mkdir -p build
cp -r client/build/* build/

# Set up PM2 for process management
print_status "Setting up PM2 configuration..."

cat > ecosystem.config.js