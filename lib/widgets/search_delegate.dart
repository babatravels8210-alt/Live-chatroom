import 'package:flutter/material.dart';
import 'package:global_voice_chat/models/chat_room.dart';

class RoomSearchDelegate extends SearchDelegate {
  final List<ChatRoom> rooms;

  RoomSearchDelegate(this.rooms);

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    final results = rooms.where((room) {
      return room.name.toLowerCase().contains(query.toLowerCase()) ||
          room.description.toLowerCase().contains(query.toLowerCase()) ||
          room.category.toLowerCase().contains(query.toLowerCase()) ||
          room.language.toLowerCase().contains(query.toLowerCase());
    }).toList();

    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) {
        final room = results[index];
        return ListTile(
          title: Text(room.name),
          subtitle: Text(room.description),
          onTap: () {
            close(context, room);
          },
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    final suggestions = rooms.where((room) {
      return room.name.toLowerCase().contains(query.toLowerCase()) ||
          room.description.toLowerCase().contains(query.toLowerCase()) ||
          room.category.toLowerCase().contains(query.toLowerCase()) ||
          room.language.toLowerCase().contains(query.toLowerCase());
    }).toList();

    return ListView.builder(
      itemCount: suggestions.length,
      itemBuilder: (context, index) {
        final room = suggestions[index];
        return ListTile(
          title: Text(room.name),
          subtitle: Text(room.description),
          onTap: () {
            query = room.name;
            showResults(context);
          },
        );
      },
    );
  }
}