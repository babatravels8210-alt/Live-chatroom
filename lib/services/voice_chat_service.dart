import 'dart:async';
import 'package:achat_global_replica/models/chat_room.dart';
import 'package:achat_global_replica/models/user.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class VoiceChatService {
  static final VoiceChatService _instance = VoiceChatService._internal();
  factory VoiceChatService() => _instance;
  VoiceChatService._internal();

  io.Socket? _socket;
  bool _connected = false;
  
  // Mock data for demonstration
  final List<ChatRoom> _rooms = [
    ChatRoom(
      id: '1',
      name: 'Global Chat',
      imageUrl: 'assets/resource/home_h/friend_match_bg.webp',
      userCount: 1245,
      isLocked: false,
      isLive: true,
      participants: ['user1', 'user2', 'user3'],
      category: 'General',
      creatorId: 'user1',
    ),
    ChatRoom(
      id: '2',
      name: 'Music Lovers',
      imageUrl: 'assets/resource/live_h/bg_top_cover_film.png',
      userCount: 856,
      isLocked: true,
      isLive: true,
      participants: ['user4', 'user5'],
      category: 'Music',
      creatorId: 'user4',
    ),
    ChatRoom(
      id: '3',
      name: 'Talent Show',
      imageUrl: 'assets/resource/live_h/bg_cover_talent.png',
      userCount: 2103,
      isLocked: false,
      isLive: true,
      participants: ['user6', 'user7', 'user8', 'user9'],
      category: 'Entertainment',
      creatorId: 'user6',
    ),
    ChatRoom(
      id: '4',
      name: 'PK Battles',
      imageUrl: 'assets/resource/live_h/bg_cover_matchmaker.png',
      userCount: 3421,
      isLocked: false,
      isLive: true,
      participants: ['user10', 'user11'],
      category: 'Games',
      creatorId: 'user10',
    ),
  ];

  final User _currentUser = User(
    id: 'current_user',
    username: 'You',
    country: 'India',
    interests: ['Technology', 'Languages', 'Music'],
    friendsCount: 15,
    followersCount: 42,
    followingCount: 28,
  );

  // Streams for real-time updates
  final StreamController<List<ChatRoom>> _roomsStreamController = StreamController<List<ChatRoom>>.broadcast();
  final StreamController<bool> _connectionStreamController = StreamController<bool>.broadcast();
  final StreamController<String> _messageStreamController = StreamController<String>.broadcast();

  Stream<List<ChatRoom>> get roomsStream => _roomsStreamController.stream;
  Stream<bool> get connectionStream => _connectionStreamController.stream;
  Stream<String> get messageStream => _messageStreamController.stream;

  User get currentUser => _currentUser;
  bool get connected => _connected;

  // Initialize socket connection
  void initSocket(String serverUrl) {
    _socket = io.io(
      serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();
    _connected = true;

    // Listen for connection events
    _socket!.onConnect((data) {
      print('Socket connected');
      _connectionStreamController.add(true);
    });

    _socket!.onDisconnect((data) {
      print('Socket disconnected');
      _connected = false;
      _connectionStreamController.add(false);
    });

    _socket!.onConnectError((error) {
      print('Socket connection error: $error');
      _connected = false;
      _connectionStreamController.add(false);
    });

    // Listen for messages
    _socket!.on('message', (data) {
      _messageStreamController.add(data.toString());
    });

    // Listen for room updates
    _socket!.on('roomsUpdate', (data) {
      // Update rooms list
      _roomsStreamController.add(_rooms);
    });
  }

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
    
    // Emit join event
    _socket?.emit('joinRoom', {
      'roomId': room.id,
      'userId': _currentUser.id,
      'username': _currentUser.username,
    });
    
    // Simulate successful connection
    _connectionStreamController.add(true);
    return true;
  }

  // Simulate leaving a room
  Future<void> leaveRoom(String roomId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 200));
    
    // Emit leave event
    _socket?.emit('leaveRoom', {
      'roomId': roomId,
      'userId': _currentUser.id,
    });
    
    // Simulate disconnection
    _connectionStreamController.add(false);
  }

  // Send message
  void sendMessage(String roomId, String message) {
    _socket?.emit('sendMessage', {
      'roomId': roomId,
      'userId': _currentUser.id,
      'username': _currentUser.username,
      'message': message,
      'timestamp': DateTime.now().toIso8601String(),
    });
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

  // Create a new room
  Future<ChatRoom> createRoom(String name, String category) async {
    final newRoom = ChatRoom(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      imageUrl: 'assets/resource/home_h/friend_match_bg.webp',
      userCount: 1,
      isLocked: false,
      isLive: true,
      participants: [_currentUser.id],
      category: category,
      creatorId: _currentUser.id,
    );
    
    _rooms.add(newRoom);
    _roomsStreamController.add(_rooms);
    
    // Emit create room event
    _socket?.emit('createRoom', newRoom.toJson());
    
    return newRoom;
  }

  // Dispose streams to prevent memory leaks
  void dispose() {
    _roomsStreamController.close();
    _connectionStreamController.close();
    _messageStreamController.close();
    _socket?.disconnect();
  }
}