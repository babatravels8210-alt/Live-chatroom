class ChatRoom {
  final String id;
  final String name;
  final String imageUrl;
  final int userCount;
  final bool isLocked;
  final bool isLive;
  final List<String> participants;
  final String category;
  final String creatorId;

  ChatRoom({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.userCount,
    this.isLocked = false,
    this.isLive = false,
    required this.participants,
    required this.category,
    required this.creatorId,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    return ChatRoom(
      id: json['id'] as String,
      name: json['name'] as String,
      imageUrl: json['imageUrl'] as String,
      userCount: json['userCount'] as int,
      isLocked: json['isLocked'] as bool? ?? false,
      isLive: json['isLive'] as bool? ?? false,
      participants: List<String>.from(json['participants'] as List),
      category: json['category'] as String,
      creatorId: json['creatorId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'imageUrl': imageUrl,
      'userCount': userCount,
      'isLocked': isLocked,
      'isLive': isLive,
      'participants': participants,
      'category': category,
      'creatorId': creatorId,
    };
  }
}