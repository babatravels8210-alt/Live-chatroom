#!/bin/bash

echo "🔧 Fixing Flutter Project Setup..."
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null
then
    echo "❌ Flutter is not installed!"
    echo "Please install Flutter first:"
    echo "https://docs.flutter.dev/get-started/install"
    exit 1
fi

echo "✅ Flutter found!"
echo ""

# Run flutter doctor
echo "📋 Running Flutter Doctor..."
flutter doctor
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean
echo ""

# Get dependencies
echo "📦 Installing dependencies..."
flutter pub get
echo ""

# Check for Android setup
if [ -d "android" ]; then
    echo "✅ Android folder found"
    
    # Make gradlew executable
    if [ -f "android/gradlew" ]; then
        chmod +x android/gradlew
        echo "✅ Made gradlew executable"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Connect your Android device or start emulator"
echo "2. Run: flutter devices"
echo "3. Run: flutter run"
echo "4. To build APK: flutter build apk --release"