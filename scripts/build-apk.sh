#!/bin/bash

# Flutter APK Build Script for Live Chatroom
# This script builds release APK with proper signing

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="Live Chatroom"
VERSION_FILE="pubspec.yaml"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Flutter APK Build Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Flutter is installed
check_flutter() {
    echo -e "${YELLOW}Checking Flutter installation...${NC}"
    
    if ! command -v flutter &> /dev/null; then
        echo -e "${RED}Flutter is not installed!${NC}"
        echo -e "${YELLOW}Please install Flutter from: https://flutter.dev/docs/get-started/install${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Flutter is installed${NC}"
    flutter --version
}

# Check Android SDK
check_android_sdk() {
    echo -e "${YELLOW}Checking Android SDK...${NC}"
    
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}ANDROID_HOME is not set!${NC}"
        echo -e "${YELLOW}Please set ANDROID_HOME environment variable${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Android SDK found at: $ANDROID_HOME${NC}"
}

# Clean previous builds
clean_build() {
    echo -e "${YELLOW}Cleaning previous builds...${NC}"
    
    flutter clean
    rm -rf build/
    
    echo -e "${GREEN}✓ Clean completed${NC}"
}

# Get dependencies
get_dependencies() {
    echo -e "${YELLOW}Getting Flutter dependencies...${NC}"
    
    flutter pub get
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Check signing configuration
check_signing() {
    echo -e "${YELLOW}Checking signing configuration...${NC}"
    
    if [ ! -f "android/key.properties" ]; then
        echo -e "${RED}key.properties not found!${NC}"
        echo -e "${YELLOW}Creating from example...${NC}"
        
        if [ -f "android/key.properties.example" ]; then
            cp android/key.properties.example android/key.properties
            echo -e "${YELLOW}Please edit android/key.properties with your signing details${NC}"
            exit 1
        else
            echo -e "${RED}key.properties.example not found!${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✓ Signing configuration found${NC}"
}

# Build APK
build_apk() {
    echo -e "${YELLOW}Building APK...${NC}"
    
    # Build release APK
    flutter build apk --release
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ APK build successful!${NC}"
    else
        echo -e "${RED}✗ APK build failed!${NC}"
        exit 1
    fi
}

# Build App Bundle (for Play Store)
build_appbundle() {
    echo -e "${YELLOW}Building App Bundle...${NC}"
    
    flutter build appbundle --release
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ App Bundle build successful!${NC}"
    else
        echo -e "${RED}✗ App Bundle build failed!${NC}"
        exit 1
    fi
}

# Build split APKs
build_split_apks() {
    echo -e "${YELLOW}Building split APKs...${NC}"
    
    flutter build apk --release --split-per-abi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Split APKs build successful!${NC}"
    else
        echo -e "${RED}✗ Split APKs build failed!${NC}"
        exit 1
    fi
}

# Get app version
get_version() {
    VERSION=$(grep "version:" pubspec.yaml | awk '{print $2}')
    echo -e "${BLUE}App Version: $VERSION${NC}"
}

# Copy APKs to release folder
copy_apks() {
    echo -e "${YELLOW}Copying APKs to release folder...${NC}"
    
    RELEASE_DIR="release/apk"
    mkdir -p $RELEASE_DIR
    
    # Copy universal APK
    if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
        cp build/app/outputs/flutter-apk/app-release.apk "$RELEASE_DIR/live-chatroom-$VERSION.apk"
        echo -e "${GREEN}✓ Universal APK copied${NC}"
    fi
    
    # Copy split APKs
    if [ -f "build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk" ]; then
        cp build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk "$RELEASE_DIR/live-chatroom-$VERSION-armeabi-v7a.apk"
        echo -e "${GREEN}✓ ARM v7a APK copied${NC}"
    fi
    
    if [ -f "build/app/outputs/flutter-apk/app-arm64-v8a-release.apk" ]; then
        cp build/app/outputs/flutter-apk/app-arm64-v8a-release.apk "$RELEASE_DIR/live-chatroom-$VERSION-arm64-v8a.apk"
        echo -e "${GREEN}✓ ARM64 v8a APK copied${NC}"
    fi
    
    if [ -f "build/app/outputs/flutter-apk/app-x86_64-release.apk" ]; then
        cp build/app/outputs/flutter-apk/app-x86_64-release.apk "$RELEASE_DIR/live-chatroom-$VERSION-x86_64.apk"
        echo -e "${GREEN}✓ x86_64 APK copied${NC}"
    fi
    
    # Copy App Bundle
    if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
        cp build/app/outputs/bundle/release/app-release.aab "$RELEASE_DIR/live-chatroom-$VERSION.aab"
        echo -e "${GREEN}✓ App Bundle copied${NC}"
    fi
    
    echo -e "${GREEN}Release files location: $RELEASE_DIR${NC}"
}

# Generate checksums
generate_checksums() {
    echo -e "${YELLOW}Generating checksums...${NC}"
    
    RELEASE_DIR="release/apk"
    cd $RELEASE_DIR
    
    for file in *.apk *.aab; do
        if [ -f "$file" ]; then
            sha256sum "$file" > "$file.sha256"
            echo -e "${GREEN}✓ Checksum for $file${NC}"
        fi
    done
    
    cd ../..
}

# Show build info
show_build_info() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Build Information${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}App Name: $APP_NAME${NC}"
    echo -e "${GREEN}Version: $VERSION${NC}"
    echo -e "${GREEN}Build Date: $(date)${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Build Outputs:${NC}"
    
    RELEASE_DIR="release/apk"
    if [ -d "$RELEASE_DIR" ]; then
        ls -lh $RELEASE_DIR/*.apk $RELEASE_DIR/*.aab 2>/dev/null | awk '{print $9, $5}'
    fi
    
    echo -e "${BLUE}========================================${NC}"
}

# Main build process
main() {
    echo -e "${GREEN}Starting build process...${NC}"
    
    check_flutter
    check_android_sdk
    get_version
    clean_build
    get_dependencies
    check_signing
    
    # Ask user what to build
    echo -e "${YELLOW}What would you like to build?${NC}"
    echo "1) Universal APK (single APK for all architectures)"
    echo "2) Split APKs (separate APKs for each architecture)"
    echo "3) App Bundle (for Google Play Store)"
    echo "4) All of the above"
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            build_apk
            ;;
        2)
            build_split_apks
            ;;
        3)
            build_appbundle
            ;;
        4)
            build_apk
            build_split_apks
            build_appbundle
            ;;
        *)
            echo -e "${RED}Invalid choice!${NC}"
            exit 1
            ;;
    esac
    
    copy_apks
    generate_checksums
    show_build_info
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main