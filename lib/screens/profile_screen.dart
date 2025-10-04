import 'package:flutter/material.dart';
import 'package:global_voice_chat/services/voice_chat_service.dart';
import 'package:global_voice_chat/models/user.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final VoiceChatService _voiceChatService = VoiceChatService();
  late User _user;

  @override
  void initState() {
    super.initState();
    _user = _voiceChatService.currentUser;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Profile picture
            CircleAvatar(
              radius: 50,
              backgroundImage: _user.profilePicture != null
                  ? NetworkImage(_user.profilePicture!)
                  : null,
              child: _user.profilePicture == null
                  ? const Icon(
                      Icons.person,
                      size: 50,
                      color: Colors.white,
                    )
                  : null,
            ),
            const SizedBox(height: 20),
            // Username
            Text(
              _user.username,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 5),
            // Email
            Text(
              _user.email,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 30),
            // User info cards
            _buildInfoCard('Country', _user.country ?? 'Not set'),
            _buildInfoCard('Language', _user.language ?? 'Not set'),
            _buildInfoCard('Interests', _user.interests.join(', ')),
            const SizedBox(height: 30),
            // Settings section
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Settings',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            _buildSettingsTile(
              'Notifications',
              Icons.notifications,
              true,
              (value) {
                // Handle notification setting
              },
            ),
            _buildSettingsTile(
              'Auto Join Rooms',
              Icons.auto_mode,
              false,
              (value) {
                // Handle auto join setting
              },
            ),
            _buildSettingsTile(
              'Voice Activity Detection',
              Icons.hearing,
              true,
              (value) {
                // Handle VAD setting
              },
            ),
            _buildSettingsTile(
              'Noise Suppression',
              Icons.noise_aware,
              true,
              (value) {
                // Handle noise suppression setting
              },
            ),
            const SizedBox(height: 30),
            // Action buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ElevatedButton(
                onPressed: () {
                  // Handle edit profile
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Edit Profile'),
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: OutlinedButton(
                onPressed: () {
                  // Handle logout
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Logout'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String title, String value) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Text(
              '$title: ',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            Expanded(
              child: Text(value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsTile(
    String title,
    IconData icon,
    bool value,
    Function(bool) onChanged,
  ) {
    return SwitchListTile(
      title: Text(title),
      secondary: Icon(icon),
      value: value,
      onChanged: onChanged,
    );
  }
}