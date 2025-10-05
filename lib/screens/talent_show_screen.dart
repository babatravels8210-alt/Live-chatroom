import 'package:flutter/material.dart';

class TalentShowScreen extends StatefulWidget {
  const TalentShowScreen({super.key});

  @override
  State<TalentShowScreen> createState() => _TalentShowScreenState();
}

class _TalentShowScreenState extends State<TalentShowScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Talent Show',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF1a1a2e),
        elevation: 0,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: Image.asset(
            'assets/resource/icon_h/back_h.png',
            width: 24,
            height: 24,
          ),
        ),
      ),
      body: Column(
        children: [
          // Talent Show Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1a1a2e),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildPerformerCard('Performer 1', true),
                const Icon(
                  Icons.music_note,
                  color: Color(0xFFFF6B6B),
                  size: 30,
                ),
                _buildPerformerCard('Performer 2', false),
              ],
            ),
          ),
          
          // Show Progress
          Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Text(
                  'Live Performance',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                LinearProgressIndicator(
                  value: 0.7,
                  backgroundColor: Colors.white.withOpacity(0.1),
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF667eea)),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Performance in progress',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          
          // Chat Area
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(15),
              child: Column(
                children: [
                  // Messages
                  Expanded(
                    child: ListView(
                      children: const [
                        _MessageItem(
                          username: 'Fan 1',
                          message: 'Amazing performance!',
                          isOwn: false,
                        ),
                        _MessageItem(
                          username: 'Fan 2',
                          message: 'You\'re so talented!',
                          isOwn: false,
                        ),
                      ],
                    ),
                  ),
                  
                  // Message Input
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const TextField(
                      decoration: InputDecoration(
                        hintText: 'Send a message or gift...',
                        hintStyle: TextStyle(color: Colors.white70),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 15),
                      ),
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Talent Show Controls
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1a1a2e),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton(
                  'assets/resource/live_h/bar_mic.png',
                  'Mute',
                  () {},
                ),
                _buildControlButton(
                  'assets/resource/gift/gift.png',
                  'Gift',
                  () {},
                ),
                _buildControlButton(
                  'assets/resource/live_h/bar_volume.png',
                  'Volume',
                  () {},
                ),
                _buildControlButton(
                  'assets/resource/call_h/icon_reject_h.png',
                  'End',
                  () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformerCard(String name, bool isLeft) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            border: Border.all(
              color: isLeft ? const Color(0xFF667eea) : const Color(0xFFffa502),
              width: 3,
            ),
            borderRadius: BorderRadius.circular(30),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(30),
            child: Image.asset(
              'assets/resource/avatar_h/2.webp',
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          name,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const Text(
          '🎤 Singer',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildControlButton(String iconPath, String label, VoidCallback onPressed) {
    return Column(
      children: [
        IconButton(
          onPressed: onPressed,
          icon: Image.asset(
            iconPath,
            width: 30,
            height: 30,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class _MessageItem extends StatelessWidget {
  final String username;
  final String message;
  final bool isOwn;

  const _MessageItem({
    required this.username,
    required this.message,
    required this.isOwn,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Align(
        alignment: isOwn ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isOwn 
                ? const Color(0xFFFF6B6B) 
                : Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Text(
                username,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
              Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}