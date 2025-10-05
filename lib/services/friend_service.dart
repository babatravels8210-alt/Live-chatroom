import 'package:achat_global_replica/models/user.dart';

class FriendService {
  static final FriendService _instance = FriendService._internal();
  factory FriendService() => _instance;
  FriendService._internal();

  // Sample friends data
  final List<User> _friends = [
    User(
      id: 'friend1',
      username: 'Alex Johnson',
      country: 'US',
      avatar: 'assets/resource/avatar_h/2.webp',
      isOnline: true,
      friendsCount: 120,
      followersCount: 450,
      followingCount: 180,
      interests: ['Music', 'Travel'],
    ),
    User(
      id: 'friend2',
      username: 'Maria Garcia',
      country: 'ES',
      avatar: 'assets/resource/avatar_h/206.webp',
      isOnline: false,
      friendsCount: 85,
      followersCount: 230,
      followingCount: 95,
      interests: ['Art', 'Photography'],
    ),
    User(
      id: 'friend3',
      username: 'Yuki Tanaka',
      country: 'JP',
      avatar: 'assets/resource/avatar_h/207.webp',
      isOnline: true,
      friendsCount: 210,
      followersCount: 680,
      followingCount: 320,
      interests: ['Technology', 'Anime'],
    ),
  ];

  // Sample friend requests
  final List<User> _friendRequests = [
    User(
      id: 'request1',
      username: 'David Wilson',
      country: 'GB',
      avatar: 'assets/resource/avatar_h/209.webp',
      isOnline: true,
      friendsCount: 75,
      followersCount: 190,
      followingCount: 85,
      interests: ['Sports', 'Cooking'],
    ),
  ];

  List<User> get friends => _friends;
  List<User> get friendRequests => _friendRequests;

  // Get online friends
  List<User> getOnlineFriends() {
    return _friends.where((friend) => friend.isOnline).toList();
  }

  // Get friends by country
  List<User> getFriendsByCountry(String country) {
    return _friends.where((friend) => friend.country == country).toList();
  }

  // Add friend
  Future<void> addFriend(User user) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Check if already friends
    if (!_friends.any((friend) => friend.id == user.id)) {
      _friends.add(user);
    }
  }

  // Remove friend
  Future<void> removeFriend(String userId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    _friends.removeWhere((friend) => friend.id == userId);
  }

  // Send friend request
  Future<void> sendFriendRequest(User user) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    // In a real implementation, this would send a request to the server
    print('Friend request sent to ${user.username}');
  }

  // Accept friend request
  Future<void> acceptFriendRequest(User user) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Remove from requests
    _friendRequests.removeWhere((request) => request.id == user.id);
    
    // Add to friends
    if (!_friends.any((friend) => friend.id == user.id)) {
      _friends.add(user);
    }
  }

  // Reject friend request
  Future<void> rejectFriendRequest(String userId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    _friendRequests.removeWhere((request) => request.id == userId);
  }

  // Block user
  Future<void> blockUser(String userId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Remove from friends if exists
    _friends.removeWhere((friend) => friend.id == userId);
    
    // Remove from requests if exists
    _friendRequests.removeWhere((request) => request.id == userId);
    
    // In a real implementation, this would block the user on the server
    print('User $userId blocked');
  }

  // Get friend suggestions
  Future<List<User>> getFriendSuggestions() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Sample suggestions
    return [
      User(
        id: 'suggestion1',
        username: 'Sophie Martin',
        country: 'FR',
        avatar: 'assets/resource/avatar_h/211.webp',
        isOnline: true,
        friendsCount: 95,
        followersCount: 310,
        followingCount: 145,
        interests: ['Fashion', 'Travel'],
      ),
      User(
        id: 'suggestion2',
        username: 'Ahmed Hassan',
        country: 'EG',
        avatar: 'assets/resource/avatar_h/218.webp',
        isOnline: false,
        friendsCount: 165,
        followersCount: 520,
        followingCount: 280,
        interests: ['History', 'Culture'],
      ),
    ];
  }
}