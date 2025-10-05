import 'package:achat_global_replica/models/chat_room.dart';

class RoomService {
  static final RoomService _instance = RoomService._internal();
  factory RoomService() => _instance;
  RoomService._internal();

  // Sample rooms data
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
      participants: ['user6', 'user7', 'user8'],
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
      participants: ['user9', 'user10'],
      category: 'Games',
      creatorId: 'user9',
    ),
  ];

  List<ChatRoom> get rooms => _rooms;

  ChatRoom? getRoomById(String id) {
    try {
      return _rooms.firstWhere((room) => room.id == id);
    } catch (e) {
      return null;
    }
  }

  List<ChatRoom> getRoomsByCategory(String category) {
    return _rooms.where((room) => room.category == category).toList();
  }

  List<ChatRoom> getLiveRooms() {
    return _rooms.where((room) => room.isLive).toList();
  }

  List<ChatRoom> getLockedRooms() {
    return _rooms.where((room) => room.isLocked).toList();
  }

  Future<List<ChatRoom>> fetchRooms() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return _rooms;
  }

  Future<ChatRoom?> fetchRoomById(String id) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    return getRoomById(id);
  }

  Future<void> createRoom(ChatRoom room) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    _rooms.add(room);
  }

  Future<void> updateRoom(ChatRoom room) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _rooms.indexWhere((r) => r.id == room.id);
    if (index != -1) {
      _rooms[index] = room;
    }
  }

  Future<void> deleteRoom(String id) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    _rooms.removeWhere((room) => room.id == id);
  }
}