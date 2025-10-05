#!/bin/bash

# Flutter iOS Build Script for Live Chatroom
# This script builds iOS IPA with proper signing

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
echo -e "${BLUE}Flutter iOS Build Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running on macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}This script must be run on macOS!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Running on macOS${NC}"
}

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

# Check Xcode
check_xcode() {
    echo -e "${YELLOW}Checking Xcode installation...${NC}"
    
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}Xcode is not installed!${NC}"
        echo -e "${YELLOW}Please install Xcode from App Store${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Xcode is installed${NC}"
    xcodebuild -version
}

# Check CocoaPods
check_cocoapods() {
    echo -e "${YELLOW}Checking CocoaPods installation...${NC}"
    
    if ! command -v pod &> /dev/null; then
        echo -e "${YELLOW}CocoaPods not found. Installing...${NC}"
        sudo gem install cocoapods
    fi
    
    echo -e "${GREEN}✓ CocoaPods is installed${NC}"
    pod --version
}

# Clean previous builds
clean_build() {
    echo -e "${YELLOW}Cleaning previous builds...${NC}"
    
    flutter clean
    rm -rf build/
    rm -rf ios/Pods/
    rm -rf ios/.symlinks/
    
    echo -e "${GREEN}✓ Clean completed${NC}"
}

# Get dependencies
get_dependencies() {
    echo -e "${YELLOW}Getting Flutter dependencies...${NC}"
    
    flutter pub get
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Install iOS pods
install_pods() {
    echo -e "${YELLOW}Installing iOS pods...${NC}"
    
    cd ios
    pod install
    cd ..
    
    echo -e "${GREEN}✓ Pods installed${NC}"
}

# Get app version
get_version() {
    VERSION=$(grep "version:" pubspec.yaml | awk '{print $2}')
    echo -e "${BLUE}App Version: $VERSION${NC}"
}

# Build iOS
build_ios() {
    echo -e "${YELLOW}Building iOS app...${NC}"
    
    flutter build ios --release
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ iOS build successful!${NC}"
    else
        echo -e "${RED}✗ iOS build failed!${NC}"
        exit 1
    fi
}

# Build IPA
build_ipa() {
    echo -e "${YELLOW}Building IPA...${NC}"
    
    flutter build ipa --release
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ IPA build successful!${NC}"
    else
        echo -e "${RED}✗ IPA build failed!${NC}"
        exit 1
    fi
}

# Copy IPA to release folder
copy_ipa() {
    echo -e "${YELLOW}Copying IPA to release folder...${NC}"
    
    RELEASE_DIR="release/ios"
    mkdir -p $RELEASE_DIR
    
    if [ -f "build/ios/ipa/global_voice_chat.ipa" ]; then
        cp build/ios/ipa/global_voice_chat.ipa "$RELEASE_DIR/live-chatroom-$VERSION.ipa"
        echo -e "${GREEN}✓ IPA copied to $RELEASE_DIR${NC}"
    else
        echo -e "${RED}IPA file not found!${NC}"
        exit 1
    fi
}

# Generate checksums
generate_checksums() {
    echo -e "${YELLOW}Generating checksums...${NC}"
    
    RELEASE_DIR="release/ios"
    cd $RELEASE_DIR
    
    for file in *.ipa; do
        if [ -f "$file" ]; then
            shasum -a 256 "$file" > "$file.sha256"
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
    
    RELEASE_DIR="release/ios"
    if [ -d "$RELEASE_DIR" ]; then
        ls -lh $RELEASE_DIR/*.ipa 2>/dev/null | awk '{print $9, $5}'
    fi
    
    echo -e "${BLUE}========================================${NC}"
}

# Main build process
main() {
    echo -e "${GREEN}Starting iOS build process...${NC}"
    
    check_macos
    check_flutter
    check_xcode
    check_cocoapods
    get_version
    clean_build
    get_dependencies
    install_pods
    
    # Ask user what to build
    echo -e "${YELLOW}What would you like to build?${NC}"
    echo "1) iOS App (for testing on device)"
    echo "2) IPA (for distribution)"
    read -p "Enter choice [1-2]: " choice
    
    case $choice in
        1)
            build_ios
            ;;
        2)
            build_ipa
            copy_ipa
            generate_checksums
            ;;
        *)
            echo -e "${RED}Invalid choice!${NC}"
            exit 1
            ;;
    esac
    
    show_build_info
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main