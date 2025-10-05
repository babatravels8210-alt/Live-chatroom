class TalentShowService {
  static final TalentShowService _instance = TalentShowService._internal();
  factory TalentShowService() => _instance;
  TalentShowService._internal();

  // Sample talent shows data
  final List<Map<String, dynamic>> _talentShows = [
    {
      'id': 'show1',
      'performer': {
        'id': 'performer1',
        'username': 'StarSinger',
        'avatar': 'assets/resource/avatar_h/276.webp',
        'talent': 'Singing',
      },
      'title': 'Live Acoustic Session',
      'description': 'Join me for some soulful acoustic music',
      'status': 'live',
      'viewers': 1245,
      'likes': 856,
      'startTime': '2023-10-05T10:00:00Z',
      'scheduledTime': '2023-10-05T10:00:00Z',
      'category': 'Music',
    },
    {
      'id': 'show2',
      'performer': {
        'id': 'performer2',
        'username': 'MagicMike',
        'avatar': 'assets/resource/avatar_h/285.webp',
        'talent': 'Magic',
      },
      'title': 'Mind Blowing Magic Tricks',
      'description': 'Prepare to be amazed with these incredible illusions',
      'status': 'scheduled',
      'viewers': 0,
      'likes': 0,
      'startTime': null,
      'scheduledTime': '2023-10-05T11:00:00Z',
      'category': 'Entertainment',
    },
    {
      'id': 'show3',
      'performer': {
        'id': 'performer3',
        'username': 'DanceQueen',
        'avatar': 'assets/resource/avatar_h/286.webp',
        'talent': 'Dancing',
      },
      'title': 'Bollywood Dance Performance',
      'description': 'Energetic Bollywood dance moves',
      'status': 'completed',
      'viewers': 2103,
      'likes': 1876,
      'startTime': '2023-10-05T09:00:00Z',
      'endTime': '2023-10-05T09:30:00Z',
      'scheduledTime': '2023-10-05T09:00:00Z',
      'category': 'Dance',
    },
  ];

  List<Map<String, dynamic>> get talentShows => _talentShows;

  // Get live talent shows
  List<Map<String, dynamic>> getLiveShows() {
    return _talentShows.where((show) => show['status'] == 'live').toList();
  }

  // Get scheduled talent shows
  List<Map<String, dynamic>> getScheduledShows() {
    return _talentShows.where((show) => show['status'] == 'scheduled').toList();
  }

  // Get completed talent shows
  List<Map<String, dynamic>> getCompletedShows() {
    return _talentShows.where((show) => show['status'] == 'completed').toList();
  }

  // Get show by ID
  Map<String, dynamic>? getShowById(String id) {
    try {
      return _talentShows.firstWhere((show) => show['id'] == id);
    } catch (e) {
      return null;
    }
  }

  // Get shows by category
  List<Map<String, dynamic>> getShowsByCategory(String category) {
    return _talentShows.where((show) => show['category'] == category).toList();
  }

  // Start a new talent show
  Future<Map<String, dynamic>> startShow(
    Map<String, dynamic> performer,
    String title,
    String description,
    String category,
  ) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));

    final newShow = {
      'id': 'show${DateTime.now().millisecondsSinceEpoch}',
      'performer': performer,
      'title': title,
      'description': description,
      'status': 'live',
      'viewers': 1,
      'likes': 0,
      'startTime': DateTime.now().toIso8601String(),
      'scheduledTime': DateTime.now().toIso8601String(),
      'category': category,
    };

    _talentShows.add(newShow);
    return newShow;
  }

  // End talent show
  Future<Map<String, dynamic>> endShow(String showId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));

    final showIndex = _talentShows.indexWhere((show) => show['id'] == showId);
    if (showIndex != -1) {
      final show = _talentShows[showIndex];
      show['status'] = 'completed';
      show['endTime'] = DateTime.now().toIso8601String();
      
      _talentShows[showIndex] = show;
      return show;
    }
    
    throw Exception('Talent show not found');
  }

  // Like a talent show
  Future<void> likeShow(String showId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));

    final showIndex = _talentShows.indexWhere((show) => show['id'] == showId);
    if (showIndex != -1) {
      final show = _talentShows[showIndex];
      show['likes'] = (show['likes'] as int) + 1;
      _talentShows[showIndex] = show;
    }
  }

  // Join a talent show as viewer
  Future<void> joinShow(String showId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));

    final showIndex = _talentShows.indexWhere((show) => show['id'] == showId);
    if (showIndex != -1) {
      final show = _talentShows[showIndex];
      show['viewers'] = (show['viewers'] as int) + 1;
      _talentShows[showIndex] = show;
    }
  }

  // Leave a talent show
  Future<void> leaveShow(String showId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));

    final showIndex = _talentShows.indexWhere((show) => show['id'] == showId);
    if (showIndex != -1) {
      final show = _talentShows[showIndex];
      if (show['viewers'] > 0) {
        show['viewers'] = (show['viewers'] as int) - 1;
      }
      _talentShows[showIndex] = show;
    }
  }

  // Get talent categories
  Future<List<String>> getCategories() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 200));
    
    return ['Music', 'Dance', 'Magic', 'Comedy', 'Art', 'Cooking', 'Fitness'];
  }

  // Get top performers
  Future<List<Map<String, dynamic>>> getTopPerformers() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Sample top performers
    return [
      {
        'username': 'StarSinger',
        'avatar': 'assets/resource/avatar_h/276.webp',
        'talent': 'Singing',
        'followers': 15420,
        'performances': 126,
      },
      {
        'username': 'DanceQueen',
        'avatar': 'assets/resource/avatar_h/286.webp',
        'talent': 'Dancing',
        'followers': 12850,
        'performances': 98,
      },
      {
        'username': 'MagicMike',
        'avatar': 'assets/resource/avatar_h/285.webp',
        'talent': 'Magic',
        'followers': 9760,
        'performances': 75,
      },
    ];
  }
}