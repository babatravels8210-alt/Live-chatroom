#!/bin/bash

# Flutter APK Build Script
echo "Building Global Voice Chat APK..."

# Navigate to project directory
cd /workspace/global_voice_chat

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

echo "APK build complete!"
echo "APK location: build/app/outputs/flutter-apk/app-release.apk"