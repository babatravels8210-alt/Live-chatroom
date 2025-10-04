# Global Voice Chat

A Flutter-based global voice chat application similar to the Achat - Global Voice Chat APK.

## Features Implemented

1. **Voice Chat Functionality**
   - Real-time voice communication
   - Room-based chat system
   - Microphone and speaker controls

2. **Global Communication**
   - Multi-language support
   - International room categories
   - User profiles with country information

3. **User Management**
   - Profile creation and editing
   - Interest-based matching
   - Authentication system

4. **Social Features**
   - Room creation (public/private)
   - Search and filter capabilities
   - Participant lists

5. **App Permissions**
   - Microphone access for voice transmission
   - Storage permissions for media handling
   - Camera permissions for video features
   - Bluetooth permissions for audio devices
   - Notification permissions

6. **UI Components**
   - Bottom navigation bar
   - Voice level indicators
   - Room list with details
   - User profile screen
   - Settings panel

## Project Structure

```
lib/
├── main.dart                 # Main application entry point
├── models/
│   ├── chat_room.dart        # Chat room data model
│   └── user.dart            # User data model
├── screens/
│   ├── room_list_screen.dart # Room listing screen
│   ├── create_room_screen.dart # Room creation screen
│   └── profile_screen.dart  # User profile screen
├── services/
│   ├── voice_chat_service.dart # Voice chat functionality
│   └── permission_service.dart # App permissions handler
├── utils/
│   └── constants.dart       # Application constants
└── widgets/
    ├── voice_level_indicator.dart # Voice activity indicator
    └── search_delegate.dart # Room search functionality
```

## Dependencies

- `permission_handler`: For handling app permissions
- `audioplayers`: For audio playback
- `socket_io_client`: For real-time communication
- `http`: For API requests
- `shared_preferences`: For local data storage
- `provider`: For state management
- `flutter_sound`: For audio recording

## Android Permissions

The application requires the following Android permissions:
- INTERNET
- RECORD_AUDIO
- MODIFY_AUDIO_SETTINGS
- WAKE_LOCK
- VIBRATE
- POST_NOTIFICATIONS
- FOREGROUND_SERVICE
- RECEIVE_BOOT_COMPLETED
- WRITE_EXTERNAL_STORAGE
- READ_EXTERNAL_STORAGE
- READ_MEDIA_IMAGES
- READ_MEDIA_AUDIO
- READ_MEDIA_VIDEO
- CAMERA
- BLUETOOTH
- BLUETOOTH_ADMIN
- BLUETOOTH_SCAN
- BLUETOOTH_ADVERTISE
- BLUETOOTH_CONNECT
- READ_CALENDAR
- WRITE_CALENDAR
- SYSTEM_ALERT_WINDOW
- SYSTEM_OVERLAY_WINDOW
- com.google.android.gms.permission.AD_ID
- com.google.android.c2dm.permission.RECEIVE
- com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE
- com.android.vending.BILLING
- Various launcher badge permissions

## Getting Started

1. Clone this repository
2. Run `flutter pub get` to install dependencies
3. Run `flutter run` to start the application

## Version Information

- Version: 1.0.0
- Based on Achat - Global Voice Chat v3.16.01

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request