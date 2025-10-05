class User {
  final String id;
  final String username;
  final String country;
  final String avatar;
  final bool isOnline;
  final int friendsCount;
  final int followersCount;
  final int followingCount;
  final String? bio;
  final List<String> interests;

  User({
    required this.id,
    required this.username,
    required this.country,
    this.avatar = 'assets/resource/avatar_h/1.webp',
    this.isOnline = true,
    this.friendsCount = 0,
    this.followersCount = 0,
    this.followingCount = 0,
    this.bio,
    required this.interests,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      country: json['country'] as String,
      avatar: json['avatar'] as String? ?? 'assets/resource/avatar_h/1.webp',
      isOnline: json['isOnline'] as bool? ?? true,
      friendsCount: json['friendsCount'] as int? ?? 0,
      followersCount: json['followersCount'] as int? ?? 0,
      followingCount: json['followingCount'] as int? ?? 0,
      bio: json['bio'] as String?,
      interests: List<String>.from(json['interests'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'country': country,
      'avatar': avatar,
      'isOnline': isOnline,
      'friendsCount': friendsCount,
      'followersCount': followersCount,
      'followingCount': followingCount,
      'bio': bio,
      'interests': interests,
    };
  }
}