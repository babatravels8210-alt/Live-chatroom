import 'dart:async';
import 'package:global_voice_chat/models/chat_room.dart';
import 'package:global_voice_chat/models/user.dart';

class VoiceChatService {
  static final VoiceChatService _instance = VoiceChatService._internal();
  factory VoiceChatService() => _instance;
  VoiceChatService._internal();

  // Mock data for demonstration
  final List<ChatRoom> _rooms = [
    ChatRoom(
      id: '1',
      name: 'Global Lounge',
      description: 'A place for global conversations',
      participantCount: 120,
      participants: ['user1', 'user2', 'user3'],
      language: 'English',
      category: 'General',
    ),
    ChatRoom(
      id: '2',
      name: 'Language Exchange',
      description: 'Practice languages with native speakers',
      participantCount: 85,
      participants: ['user4', 'user5'],
      language: 'Multi-language',
      category: 'Education',
    ),
    ChatRoom(
      id: '3',
      name: 'Tech Talk',
      description: 'Discuss the latest in technology',
      participantCount: 42,
      participants: ['user6', 'user7', 'user8', 'user9'],
      language: 'English',
      category: 'Technology',
    ),
  ];

  final User _currentUser = User(
    id: 'current_user',
    username: 'You',
    email: 'user@example.com',
    interests: ['Technology', 'Languages', 'Music'],
    country: 'India',
    language: 'English',
  );

  // Streams for real-time updates
  final StreamController<List<ChatRoom>> _roomsStreamController = StreamController<List<ChatRoom>>.broadcast();
  final StreamController<bool> _connectionStreamController = StreamController<bool>.broadcast();

  Stream<List<ChatRoom>> get roomsStream => _roomsStreamController.stream;
  Stream<bool> get connectionStream => _connectionStreamController.stream;

  User get currentUser => _currentUser;

  // Simulate fetching rooms
  Future<List<ChatRoom>> getRooms() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return _rooms;
  }

  // Simulate joining a room
  Future<bool> joinRoom(ChatRoom room) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    // Simulate successful connection
    _connectionStreamController.add(true);
    return true;
  }

  // Simulate leaving a room
  Future<void> leaveRoom() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 200));
    // Simulate disconnection
    _connectionStreamController.add(false);
  }

  // Simulate voice transmission
  void transmitVoice() {
    // In a real implementation, this would handle voice data transmission
    print('Transmitting voice data...');
  }

  // Simulate voice reception
  void receiveVoice() {
    // In a real implementation, this would handle voice data reception
    print('Receiving voice data...');
  }

  // Dispose streams to prevent memory leaks
  void dispose() {
    _roomsStreamController.close();
    _connectionStreamController.close();
  }
}