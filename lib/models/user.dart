class User {
  final String id;
  final String username;
  final String email;
  final String? profilePicture;
  final String? bio;
  final List<String> interests;
  final String? country;
  final String? language;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.profilePicture,
    this.bio,
    required this.interests,
    this.country,
    this.language,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      profilePicture: json['profilePicture'] as String?,
      bio: json['bio'] as String?,
      interests: List<String>.from(json['interests'] as List),
      country: json['country'] as String?,
      language: json['language'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'profilePicture': profilePicture,
      'bio': bio,
      'interests': interests,
      'country': country,
      'language': language,
    };
  }
}