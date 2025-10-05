import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:achat_global_replica/services/friend_service.dart';
import 'package:achat_global_replica/models/user.dart';

class FriendsScreen extends StatefulWidget {
  const FriendsScreen({super.key});

  @override
  State<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends State<FriendsScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final friendService = FriendService();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Friends',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF1a1a2e),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              // Search friends
            },
            icon: Image.asset(
              'assets/resource/icon_h/search_h.png',
              width: 24,
              height: 24,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Tabs
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF1a1a2e),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _currentIndex = 0;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _currentIndex == 0
                                ? const Color(0xFFFF6B6B)
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Friends (${friendService.friends.length})',
                          style: TextStyle(
                            color: _currentIndex == 0
                                ? const Color(0xFFFF6B6B)
                                : Colors.grey,
                            fontWeight: _currentIndex == 0
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _currentIndex = 1;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _currentIndex == 1
                                ? const Color(0xFFFF6B6B)
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Requests (${friendService.friendRequests.length})',
                          style: TextStyle(
                            color: _currentIndex == 1
                                ? const Color(0xFFFF6B6B)
                                : Colors.grey,
                            fontWeight: _currentIndex == 1
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Content
          Expanded(
            child: _currentIndex == 0
                ? _buildFriendsList(friendService.friends)
                : _buildRequestsList(friendService.friendRequests),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add friend functionality
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

  Widget _buildFriendsList(List<User> friends) {
    if (friends.isEmpty) {
      return const Center(
        child: Text(
          'No friends yet',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 16,
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(15),
      itemCount: friends.length,
      itemBuilder: (context, index) {
        return _buildFriendItem(friends[index]);
      },
    );
  }

  Widget _buildRequestsList(List<User> requests) {
    if (requests.isEmpty) {
      return const Center(
        child: Text(
          'No friend requests',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 16,
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(15),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        return _buildRequestItem(requests[index]);
      },
    );
  }

  Widget _buildFriendItem(User user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(10),
        leading: Stack(
          children: [
            CircleAvatar(
              backgroundImage: AssetImage(user.avatar),
              radius: 25,
            ),
            if (user.isOnline)
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 15,
                  height: 15,
                  decoration: const BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                    border: Border(
                      top: BorderSide(color: Color(0xFF1a1a2e), width: 2),
                      bottom: BorderSide(color: Color(0xFF1a1a2e), width: 2),
                      left: BorderSide(color: Color(0xFF1a1a2e), width: 2),
                      right: BorderSide(color: Color(0xFF1a1a2e), width: 2),
                    ),
                  ),
                ),
              ),
          ],
        ),
        title: Text(
          user.username,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(
          user.country,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        trailing: PopupMenuButton<String>(
          icon: Image.asset(
            'assets/resource/live_h/bar_more.png',
            width: 24,
            height: 24,
          ),
          onSelected: (String result) {
            switch (result) {
              case 'message':
                // Send message
                break;
              case 'profile':
                // View profile
                break;
              case 'block':
                // Block user
                break;
            }
          },
          itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
            const PopupMenuItem<String>(
              value: 'message',
              child: Text('Send Message'),
            ),
            const PopupMenuItem<String>(
              value: 'profile',
              child: Text('View Profile'),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem<String>(
              value: 'block',
              child: Text('Block User'),
            ),
          ],
        ),
        onTap: () {
          // View friend profile
        },
      ),
    );
  }

  Widget _buildRequestItem(User user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(10),
        leading: CircleAvatar(
          backgroundImage: AssetImage(user.avatar),
          radius: 25,
        ),
        title: Text(
          user.username,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(
          user.country,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              onPressed: () {
                // Accept request
              },
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                ),
                child: Image.asset(
                  'assets/resource/icon_h/checked_h.png',
                  width: 16,
                  height: 16,
                ),
              ),
            ),
            IconButton(
              onPressed: () {
                // Reject request
              },
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: Image.asset(
                  'assets/resource/icon_h/close_h.png',
                  width: 16,
                  height: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}