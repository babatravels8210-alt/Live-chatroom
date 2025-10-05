import 'package:flutter/material.dart';
import 'package:achat_global_replica/models/chat_room.dart';

class RoomListScreen extends StatefulWidget {
  const RoomListScreen({super.key});

  @override
  State<RoomListScreen> createState() => _RoomListScreenState();
}

class _RoomListScreenState extends State<RoomListScreen> {
  // Sample rooms data to match Achat Global
  final List<Map<String, dynamic>> _rooms = [
    {
      'id': '1',
      'name': 'Global Chat',
      'users': 1245,
      'image': 'assets/resource/home_h/friend_match_bg.webp',
      'isLocked': false,
      'isLive': true,
    },
    {
      'id': '2',
      'name': 'Music Lovers',
      'users': 856,
      'image': 'assets/resource/live_h/bg_top_cover_film.png',
      'isLocked': true,
      'isLive': true,
    },
    {
      'id': '3',
      'name': 'Talent Show',
      'users': 2103,
      'image': 'assets/resource/live_h/bg_cover_talent.png',
      'isLocked': false,
      'isLive': true,
    },
    {
      'id': '4',
      'name': 'PK Battles',
      'users': 3421,
      'image': 'assets/resource/live_h/bg_cover_matchmaker.png',
      'isLocked': false,
      'isLive': true,
    },
    {
      'id': '5',
      'name': 'Language Exchange',
      'users': 756,
      'image': 'assets/resource/home_h/img_home_bg.webp',
      'isLocked': false,
      'isLive': false,
    },
    {
      'id': '6',
      'name': 'Gaming Zone',
      'users': 1876,
      'image': 'assets/resource/live_h/bg_top_jelly_boom.png',
      'isLocked': true,
      'isLive': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Voice Rooms',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF1a1a2e),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(15.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Search rooms...',
                  hintStyle: TextStyle(color: Colors.white70),
                  prefixIcon: Icon(Icons.search, color: Colors.white70),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 15),
                ),
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
          
          // Room List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              itemCount: _rooms.length,
              itemBuilder: (context, index) {
                return _buildRoomItem(_rooms[index]);
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Create room functionality
        },
        backgroundColor: const Color(0xFFFF6B6B),
        child: Image.asset(
          'assets/resource/home_h/icon_add.png',
          width: 24,
          height: 24,
        ),
      ),
    );
  }

  Widget _buildRoomItem(Map<String, dynamic> room) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(10),
        leading: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                room['image'],
                width: 60,
                height: 60,
                fit: BoxFit.cover,
              ),
            ),
            if (room['isLive'])
              Positioned(
                top: 0,
                left: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      bottomRight: Radius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'LIVE',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            if (room['isLocked'])
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                    ),
                  ),
                  child: Image.asset(
                    'assets/resource/chat_h/lock_h.png',
                    width: 15,
                    height: 15,
                  ),
                ),
              ),
          ],
        ),
        title: Text(
          room['name'],
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Row(
          children: [
            const Icon(
              Icons.person,
              size: 16,
              color: Colors.white70,
            ),
            const SizedBox(width: 5),
            Text(
              '${room['users']} users',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: IconButton(
          onPressed: () {
            // Room options
          },
          icon: Image.asset(
            'assets/resource/live_h/bar_more.png',
            width: 24,
            height: 24,
          ),
        ),
        onTap: () {
          // Join room functionality
        },
      ),
    );
  }
}