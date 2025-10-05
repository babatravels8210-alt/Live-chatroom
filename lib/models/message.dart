class Message {
  final String id;
  final String userId;
  final String username;
  final String content;
  final DateTime timestamp;
  final bool isOwn;

  Message({
    required this.id,
    required this.userId,
    required this.username,
    required this.content,
    required this.timestamp,
    required this.isOwn,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      userId: json['userId'] as String,
      username: json['username'] as String,
      content: json['content'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isOwn: json['isOwn'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'username': username,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      'isOwn': isOwn,
    };
  }
}