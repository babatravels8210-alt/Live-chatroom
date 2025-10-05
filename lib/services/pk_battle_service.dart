class PKBattleService {
  static final PKBattleService _instance = PKBattleService._internal();
  factory PKBattleService() => _instance;
  PKBattleService._internal();

  // Sample PK battles data
  final List<Map<String, dynamic>> _battles = [
    {
      'id': 'battle1',
      'player1': {
        'id': 'player1',
        'username': 'Champion1',
        'avatar': 'assets/resource/avatar_h/244.webp',
        'score': 750,
      },
      'player2': {
        'id': 'player2',
        'username': 'Challenger1',
        'avatar': 'assets/resource/avatar_h/256.webp',
        'score': 620,
      },
      'status': 'active',
      'startTime': '2023-10-05T10:00:00Z',
      'endTime': '2023-10-05T10:05:00Z',
      'prize': '100 Diamonds',
    },
    {
      'id': 'battle2',
      'player1': {
        'id': 'player3',
        'username': 'Warrior1',
        'avatar': 'assets/resource/avatar_h/261.webp',
        'score': 420,
      },
      'player2': {
        'id': 'player4',
        'username': 'Fighter1',
        'avatar': 'assets/resource/avatar_h/275.webp',
        'score': 380,
      },
      'status': 'completed',
      'startTime': '2023-10-05T09:30:00Z',
      'endTime': '2023-10-05T09:35:00Z',
      'prize': '50 Diamonds',
      'winner': 'player3',
    },
  ];

  List<Map<String, dynamic>> get battles => _battles;

  // Get active battles
  List<Map<String, dynamic>> getActiveBattles() {
    return _battles.where((battle) => battle['status'] == 'active').toList();
  }

  // Get completed battles
  List<Map<String, dynamic>> getCompletedBattles() {
    return _battles.where((battle) => battle['status'] == 'completed').toList();
  }

  // Get battle by ID
  Map<String, dynamic>? getBattleById(String id) {
    try {
      return _battles.firstWhere((battle) => battle['id'] == id);
    } catch (e) {
      return null;
    }
  }

  // Start a new PK battle
  Future<Map<String, dynamic>> startBattle(
    Map<String, dynamic> player1,
    Map<String, dynamic> player2,
  ) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));

    final newBattle = {
      'id': 'battle${DateTime.now().millisecondsSinceEpoch}',
      'player1': player1,
      'player2': player2,
      'status': 'active',
      'startTime': DateTime.now().toIso8601String(),
      'endTime': DateTime.now().add(const Duration(minutes: 5)).toIso8601String(),
      'prize': 'Diamonds',
    };

    _battles.add(newBattle);
    return newBattle;
  }

  // Update battle score
  Future<void> updateBattleScore(String battleId, String playerId, int score) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));

    final battleIndex = _battles.indexWhere((battle) => battle['id'] == battleId);
    if (battleIndex != -1) {
      final battle = _battles[battleIndex];
      
      if (battle['player1']['id'] == playerId) {
        battle['player1']['score'] = score;
      } else if (battle['player2']['id'] == playerId) {
        battle['player2']['score'] = score;
      }
      
      _battles[battleIndex] = battle;
    }
  }

  // End battle
  Future<Map<String, dynamic>> endBattle(String battleId) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));

    final battleIndex = _battles.indexWhere((battle) => battle['id'] == battleId);
    if (battleIndex != -1) {
      final battle = _battles[battleIndex];
      battle['status'] = 'completed';
      battle['endTime'] = DateTime.now().toIso8601String();
      
      // Determine winner
      if (battle['player1']['score'] > battle['player2']['score']) {
        battle['winner'] = battle['player1']['id'];
      } else if (battle['player2']['score'] > battle['player1']['score']) {
        battle['winner'] = battle['player2']['id'];
      } else {
        battle['winner'] = 'draw';
      }
      
      _battles[battleIndex] = battle;
      return battle;
    }
    
    throw Exception('Battle not found');
  }

  // Place a bet on a battle
  Future<void> placeBet(String battleId, String playerId, int amount) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 200));
    
    // In a real implementation, this would handle betting logic
    print('Bet placed on battle $battleId for player $playerId with amount $amount');
  }

  // Get battle leaderboard
  Future<List<Map<String, dynamic>>> getLeaderboard() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Sample leaderboard
    return [
      {
        'username': 'Champion1',
        'avatar': 'assets/resource/avatar_h/244.webp',
        'wins': 45,
        'totalBattles': 60,
        'winRate': 75.0,
      },
      {
        'username': 'Warrior1',
        'avatar': 'assets/resource/avatar_h/261.webp',
        'wins': 38,
        'totalBattles': 52,
        'winRate': 73.1,
      },
      {
        'username': 'Fighter1',
        'avatar': 'assets/resource/avatar_h/275.webp',
        'wins': 32,
        'totalBattles': 48,
        'winRate': 66.7,
      },
    ];
  }
}