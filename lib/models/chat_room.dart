class ChatRoom {
  final String id;
  final String name;
  final String description;
  final int participantCount;
  final List<String> participants;
  final String language;
  final String category;
  final bool isPrivate;
  final String? password;

  ChatRoom({
    required this.id,
    required this.name,
    required this.description,
    required this.participantCount,
    required this.participants,
    required this.language,
    required this.category,
    this.isPrivate = false,
    this.password,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    return ChatRoom(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      participantCount: json['participantCount'] as int,
      participants: List<String>.from(json['participants'] as List),
      language: json['language'] as String,
      category: json['category'] as String,
      isPrivate: json['isPrivate'] as bool? ?? false,
      password: json['password'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'participantCount': participantCount,
      'participants': participants,
      'language': language,
      'category': category,
      'isPrivate': isPrivate,
      'password': password,
    };
  }
}