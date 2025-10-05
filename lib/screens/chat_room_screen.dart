import 'package:flutter/material.dart';

class ChatRoomScreen extends StatefulWidget {
  final String roomName;
  
  const ChatRoomScreen({
    super.key,
    required this.roomName,
  });

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final List<Map<String, dynamic>> _messages = [
    {
      'username': 'User1',
      'message': 'Hello everyone!',
      'isOwn': false,
      'timestamp': '10:30',
    },
    {
      'username': 'User2',
      'message': 'Welcome to the room!',
      'isOwn': false,
      'timestamp': '10:31',
    },
    {
      'username': 'You',
      'message': 'Thanks for having me!',
      'isOwn': true,
      'timestamp': '10:32',
    },
  ];

  final TextEditingController _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.roomName,
          style: const TextStyle(
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
        actions: [
          IconButton(
            onPressed: () {
              // Room options
            },
            icon: Image.asset(
              'assets/resource/live_h/bar_more.png',
              width: 24,
              height: 24,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Chat Messages
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/resource/home_h/img_home_bg.webp'),
                  fit: BoxFit.cover,
                ),
              ),
              child: ListView.builder(
                padding: const EdgeInsets.all(15),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  return _buildMessageItem(_messages[index]);
                },
              ),
            ),
          ),
          
          // Message Input
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: Color(0xFF1a1a2e),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    // Emoji picker
                  },
                  icon: Image.asset(
                    'assets/resource/icon_h/emoji_h.png',
                    width: 24,
                    height: 24,
                  ),
                ),
                IconButton(
                  onPressed: () {
                    // Add media
                  },
                  icon: Image.asset(
                    'assets/resource/icon_h/add_h.png',
                    width: 24,
                    height: 24,
                  ),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: TextStyle(color: Colors.white70),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 15),
                      ),
                      style: const TextStyle(color: Colors.white),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: _sendMessage,
                  icon: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Color(0xFFFF6B6B),
                          Color(0xFFFFA502),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Send',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Voice Chat Controls
          Container(
            padding: const EdgeInsets.all(15),
            decoration: const BoxDecoration(
              color: Color(0xFF1a1a2e),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildVoiceControl(
                  'assets/resource/live_h/bar_mic.png',
                  'Mic',
                  () {},
                ),
                _buildVoiceControl(
                  'assets/resource/live_h/bar_volume.png',
                  'Volume',
                  () {},
                ),
                _buildVoiceControl(
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

  Widget _buildMessageItem(Map<String, dynamic> message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      child: Align(
        alignment: message['isOwn'] ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: message['isOwn'] 
                ? const LinearGradient(
                    colors: [
                      Color(0xFFFF6B6B),
                      Color(0xFFFFA502),
                    ],
                  ).createShader(const Rect.fromLTWH(0, 0, 100, 40))
                : Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: message['isOwn'] ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Text(
                '${message['username']} • ${message['timestamp']}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                ),
              ),
              Text(
                message['message'],
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

  Widget _buildVoiceControl(String iconPath, String label, VoidCallback onPressed) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(25),
          ),
          child: IconButton(
            onPressed: onPressed,
            icon: Image.asset(
              iconPath,
              width: 24,
              height: 24,
            ),
          ),
        ),
        const SizedBox(height: 5),
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

  void _sendMessage([String? value]) {
    final message = _messageController.text.trim();
    if (message.isNotEmpty) {
      setState(() {
        _messages.add({
          'username': 'You',
          'message': message,
          'isOwn': true,
          'timestamp': DateTime.now().toString().substring(11, 16),
        });
      });
      _messageController.clear();
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
}