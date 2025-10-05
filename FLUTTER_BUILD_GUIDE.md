# 📱 Flutter App Build Guide - Live Chatroom

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Android Build](#android-build)
3. [iOS Build](#ios-build)
4. [App Store Deployment](#app-store-deployment)
5. [Version Management](#version-management)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Flutter SDK**
   ```bash
   # Download from: https://flutter.dev/docs/get-started/install
   
   # Verify installation
   flutter doctor
   ```

2. **Android Studio** (for Android builds)
   - Download: https://developer.android.com/studio
   - Install Android SDK
   - Install Android SDK Command-line Tools

3. **Xcode** (for iOS builds - macOS only)
   - Download from Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

4. **CocoaPods** (for iOS builds)
   ```bash
   sudo gem install cocoapods
   ```

### Environment Setup

1. **Set Environment Variables**
   
   Add to `~/.bashrc` or `~/.zshrc`:
   ```bash
   # Android
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Flutter
   export PATH=$PATH:$HOME/flutter/bin
   ```

2. **Verify Setup**
   ```bash
   flutter doctor -v
   ```

---

## Android Build

### Step 1: Generate Signing Key

```bash
# Create keystore directory
mkdir -p android/keystore

# Generate keystore
keytool -genkey -v -keystore android/keystore/release-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias live-chatroom

# You'll be prompted for:
# - Keystore password
# - Key password
# - Your name, organization, etc.
```

**Important**: Save your passwords securely! You'll need them for future releases.

### Step 2: Configure Signing

1. **Create `android/key.properties`**:
   ```properties
   storePassword=your-keystore-password
   keyPassword=your-key-password
   keyAlias=live-chatroom
   storeFile=../keystore/release-keystore.jks
   ```

2. **Update `android/app/build.gradle`**:
   
   Add before `android` block:
   ```gradle
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('key.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```
   
   Update `signingConfigs`:
   ```gradle
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
           storePassword keystoreProperties['storePassword']
       }
   }
   ```
   
   Update `buildTypes`:
   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled true
           shrinkResources true
       }
   }
   ```

### Step 3: Build APK

#### Option 1: Using Build Script (Recommended)
```bash
# Make script executable
chmod +x scripts/build-apk.sh

# Run build script
./scripts/build-apk.sh
```

#### Option 2: Manual Build

**Universal APK** (single APK for all architectures):
```bash
flutter build apk --release
```

**Split APKs** (smaller size, separate for each architecture):
```bash
flutter build apk --release --split-per-abi
```

**App Bundle** (for Google Play Store):
```bash
flutter build appbundle --release
```

### Step 4: Locate Build Outputs

- **Universal APK**: `build/app/outputs/flutter-apk/app-release.apk`
- **Split APKs**:
  - ARM v7a: `build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk`
  - ARM64 v8a: `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`
  - x86_64: `build/app/outputs/flutter-apk/app-x86_64-release.apk`
- **App Bundle**: `build/app/outputs/bundle/release/app-release.aab`

### Step 5: Test APK

```bash
# Install on connected device
flutter install

# Or manually install
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## iOS Build

### Step 1: Configure Xcode Project

1. **Open iOS project in Xcode**:
   ```bash
   open ios/Runner.xcworkspace
   ```

2. **Configure Signing**:
   - Select `Runner` in project navigator
   - Go to `Signing & Capabilities`
   - Select your Team
   - Choose a unique Bundle Identifier
   - Enable "Automatically manage signing"

3. **Update Info.plist**:
   
   Add required permissions in `ios/Runner/Info.plist`:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>This app needs microphone access for voice chat</string>
   
   <key>NSCameraUsageDescription</key>
   <string>This app needs camera access for video features</string>
   
   <key>NSPhotoLibraryUsageDescription</key>
   <string>This app needs photo library access to share images</string>
   ```

### Step 2: Build iOS App

#### Option 1: Using Build Script (Recommended)
```bash
# Make script executable
chmod +x scripts/build-ios.sh

# Run build script
./scripts/build-ios.sh
```

#### Option 2: Manual Build

**For testing on device**:
```bash
flutter build ios --release
```

**For distribution (IPA)**:
```bash
flutter build ipa --release
```

### Step 3: Locate Build Outputs

- **iOS App**: `build/ios/iphoneos/Runner.app`
- **IPA**: `build/ios/ipa/global_voice_chat.ipa`

### Step 4: Test on Device

1. **Connect iPhone/iPad**
2. **Run from Xcode**:
   ```bash
   open ios/Runner.xcworkspace
   # Select your device and click Run
   ```

---

## App Store Deployment

### Google Play Store (Android)

#### Step 1: Prepare Store Listing

1. **Create Google Play Console Account**
   - Visit: https://play.google.com/console
   - Pay one-time $25 registration fee

2. **Create New App**
   - Click "Create app"
   - Fill in app details
   - Select app category

3. **Prepare Assets**:
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, up to 8)
   - Privacy policy URL
   - App description

#### Step 2: Upload App Bundle

1. **Go to Production → Releases**
2. **Create new release**
3. **Upload App Bundle** (`app-release.aab`)
4. **Fill in release notes**
5. **Review and rollout**

#### Step 3: Complete Store Listing

1. **Main store listing**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots
   - Feature graphic

2. **Content rating**:
   - Complete questionnaire
   - Get rating certificate

3. **Pricing & distribution**:
   - Set price (free or paid)
   - Select countries
   - Accept terms

4. **Submit for review**

### Apple App Store (iOS)

#### Step 1: Prepare App Store Connect

1. **Create Apple Developer Account**
   - Visit: https://developer.apple.com/
   - Pay $99/year membership fee

2. **Create App in App Store Connect**
   - Visit: https://appstoreconnect.apple.com/
   - Click "My Apps" → "+"
   - Fill in app information

3. **Prepare Assets**:
   - App icon (1024x1024 PNG)
   - Screenshots for all device sizes
   - App preview videos (optional)
   - Privacy policy URL

#### Step 2: Upload IPA

**Using Xcode**:
1. Open `ios/Runner.xcworkspace`
2. Select "Any iOS Device" as target
3. Product → Archive
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow wizard to upload

**Using Transporter App**:
1. Download Transporter from Mac App Store
2. Open Transporter
3. Drag and drop IPA file
4. Click "Deliver"

#### Step 3: Complete App Information

1. **App Information**:
   - Name, subtitle, description
   - Keywords
   - Support URL
   - Marketing URL

2. **Pricing and Availability**:
   - Set price tier
   - Select territories

3. **App Privacy**:
   - Complete privacy questionnaire
   - Add privacy policy

4. **Submit for Review**

---

## Version Management

### Update Version Number

Edit `pubspec.yaml`:
```yaml
version: 1.0.1+2
# Format: major.minor.patch+buildNumber
```

### Version Naming Convention

- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features
- **Patch** (x.x.1): Bug fixes
- **Build Number** (+2): Incremental build number

### Create Release Notes

Create `RELEASE_NOTES.md`:
```markdown
# Version 1.0.1

## New Features
- Added voice chat rooms
- Improved UI/UX

## Bug Fixes
- Fixed connection issues
- Resolved audio quality problems

## Known Issues
- None
```

---

## Troubleshooting

### Common Android Issues

#### 1. Gradle Build Failed
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk
```

#### 2. Signing Configuration Error
- Verify `key.properties` exists
- Check keystore file path
- Verify passwords are correct

#### 3. Out of Memory Error
Add to `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m
```

#### 4. SDK Version Mismatch
Update `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
```

### Common iOS Issues

#### 1. CocoaPods Error
```bash
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter build ios
```

#### 2. Signing Error
- Open Xcode
- Select Runner target
- Go to Signing & Capabilities
- Select correct Team
- Enable "Automatically manage signing"

#### 3. Archive Failed
- Clean build folder: Product → Clean Build Folder
- Update CocoaPods: `pod update`
- Restart Xcode

#### 4. Provisioning Profile Error
- Go to Apple Developer Portal
- Certificates, Identifiers & Profiles
- Create/update provisioning profile
- Download and install

### Flutter Issues

#### 1. Flutter Doctor Issues
```bash
# Update Flutter
flutter upgrade

# Run doctor
flutter doctor -v

# Accept licenses
flutter doctor --android-licenses
```

#### 2. Dependency Conflicts
```bash
# Clear pub cache
flutter pub cache repair

# Get dependencies
flutter pub get
```

#### 3. Build Cache Issues
```bash
# Clean everything
flutter clean
rm -rf build/
rm -rf .dart_tool/
flutter pub get
```

---

## Build Optimization

### Reduce APK Size

1. **Enable ProGuard**:
   
   In `android/app/build.gradle`:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
   }
   ```

2. **Use Split APKs**:
   ```bash
   flutter build apk --release --split-per-abi
   ```

3. **Remove Unused Resources**:
   ```bash
   flutter build apk --release --target-platform android-arm64
   ```

### Improve Build Performance

1. **Enable Gradle Daemon**:
   
   In `android/gradle.properties`:
   ```properties
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

2. **Increase Heap Size**:
   ```properties
   org.gradle.jvmargs=-Xmx4096m
   ```

---

## Continuous Integration

### GitHub Actions for Automated Builds

Create `.github/workflows/build-mobile.yml`:
```yaml
name: Build Mobile Apps

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - run: flutter pub get
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - run: flutter pub get
      - run: flutter build ios --release --no-codesign
```

---

## Security Best Practices

1. **Never commit sensitive files**:
   - `android/key.properties`
   - `android/keystore/*.jks`
   - `ios/Runner.xcconfig` (if contains secrets)

2. **Add to `.gitignore`**:
   ```
   # Android
   android/key.properties
   android/keystore/
   
   # iOS
   ios/Runner.xcconfig
   ios/Pods/
   ```

3. **Use environment variables** for API keys

4. **Enable ProGuard/R8** for code obfuscation

5. **Use HTTPS** for all network requests

---

## Support & Resources

- **Flutter Documentation**: https://flutter.dev/docs
- **Android Developer Guide**: https://developer.android.com/
- **iOS Developer Guide**: https://developer.apple.com/
- **GitHub Issues**: https://github.com/babatravels8210-alt/Live-chatroom/issues

---

**Happy Building! 📱**