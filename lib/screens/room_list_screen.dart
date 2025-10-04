import 'package:flutter/material.dart';
import 'package:global_voice_chat/models/chat_room.dart';
import 'package:global_voice_chat/screens/create_room_screen.dart';
import 'package:global_voice_chat/services/voice_chat_service.dart';
import 'package:global_voice_chat/widgets/search_delegate.dart';

class RoomListScreen extends StatefulWidget {
  const RoomListScreen({super.key});

  @override
  State<RoomListScreen> createState() => _RoomListScreenState();
}

class _RoomListScreenState extends State<RoomListScreen> {
  final VoiceChatService _voiceChatService = VoiceChatService();
  List<ChatRoom> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRooms();
  }

  Future<void> _loadRooms() async {
    try {
      final rooms = await _voiceChatService.getRooms();
      setState(() {
        _rooms = rooms;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load rooms: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Voice Chat Rooms'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: RoomSearchDelegate(_rooms),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Implement filter functionality
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _rooms.length,
              itemBuilder: (context, index) {
                final room = _rooms[index];
                return _buildRoomCard(room);
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateRoomScreen(),
            ),
          );
        },
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildRoomCard(ChatRoom room) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(
          room.name,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(room.description),
            const SizedBox(height: 5),
            Row(
              children: [
                Icon(
                  Icons.language,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 5),
                Text(
                  room.language,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
                const SizedBox(width: 15),
                Icon(
                  Icons.group,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 5),
                Text(
                  '${room.participantCount} participants',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: room.isPrivate
            ? const Icon(
                Icons.lock,
                color: Colors.grey,
              )
            : const Icon(
                Icons.lock_open,
                color: Colors.green,
              ),
        onTap: () async {
          final success = await _voiceChatService.joinRoom(room);
          if (success && mounted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VoiceChatRoomScreen(room: room),
              ),
            );
          }
        },
      ),
    );
  }
}

class VoiceChatRoomScreen extends StatefulWidget {
  final ChatRoom room;
  const VoiceChatRoomScreen({super.key, required this.room});

  @override
  State<VoiceChatRoomScreen> createState() => _VoiceChatRoomScreenState();
}

class _VoiceChatRoomScreenState extends State<VoiceChatRoomScreen> {
  final VoiceChatService _voiceChatService = VoiceChatService();
  bool _isConnected = false;
  bool _isMuted = false;
  bool _isSpeakerOn = true;

  @override
  void initState() {
    super.initState();
    _voiceChatService.connectionStream.listen((connected) {
      setState(() {
        _isConnected = connected;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.room.name),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isMuted ? Icons.mic_off : Icons.mic),
            onPressed: () {
              setState(() {
                _isMuted = !_isMuted;
              });
            },
          ),
          IconButton(
            icon: Icon(_isSpeakerOn ? Icons.volume_up : Icons.volume_off),
            onPressed: () {
              setState(() {
                _isSpeakerOn = !_isSpeakerOn;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Connection status indicator
          Container(
            padding: const EdgeInsets.all(16),
            color: _isConnected ? Colors.green[100] : Colors.red[100],
            child: Row(
              children: [
                Icon(
                  _isConnected ? Icons.check_circle : Icons.error,
                  color: _isConnected ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 10),
                Text(
                  _isConnected ? 'Connected' : 'Connecting...',
                  style: TextStyle(
                    color: _isConnected ? Colors.green : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          // Participant list
          Expanded(
            child: ListView.builder(
              itemCount: widget.room.participants.length,
              itemBuilder: (context, index) {
                final participant = widget.room.participants[index];
                return ListTile(
                  leading: const CircleAvatar(
                    child: Icon(Icons.person),
                  ),
                  title: Text(participant),
                  trailing: index == 0
                      ? Container(
                          padding: const EdgeInsets.all(5),
                          decoration: const BoxDecoration(
                            color: Colors.blue,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.mic,
                            size: 15,
                            color: Colors.white,
                          ),
                        )
                      : null,
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_isConnected) {
            _voiceChatService.leaveRoom();
            Navigator.pop(context);
          }
        },
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
        child: const Icon(Icons.call_end),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}