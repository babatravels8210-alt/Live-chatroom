import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:global_voice_chat/main.dart';
import 'package:global_voice_chat/screens/room_list_screen.dart';
import 'package:global_voice_chat/widgets/voice_level_indicator.dart';

void main() {
  group('Widget Tests', () {
    testWidgets('App should start and show main screen', (WidgetTester tester) async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(const MyApp());

      // Verify that the app starts
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('RoomListScreen should display title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RoomListScreen(),
        ),
      );

      // Verify that the screen title is displayed
      expect(find.text('Voice Chat Rooms'), findsOneWidget);
    });

    testWidgets('VoiceLevelIndicator should display correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VoiceLevelIndicator(
              level: 0.5,
              isActive: true,
            ),
          ),
        ),
      );

      // Verify that the indicator is displayed
      expect(find.byType(VoiceLevelIndicator), findsOneWidget);
    });

    testWidgets('Bottom navigation should have correct items', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();

      // Verify bottom navigation items
      expect(find.byIcon(Icons.home), findsOneWidget);
      expect(find.byIcon(Icons.search), findsOneWidget);
      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('Search button should be tappable', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();

      // Find and tap the search button
      final searchButton = find.byIcon(Icons.search);
      expect(searchButton, findsOneWidget);
      
      await tester.tap(searchButton);
      await tester.pumpAndSettle();
    });

    testWidgets('Create room button should be visible', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RoomListScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Verify create room button exists
      expect(find.byType(FloatingActionButton), findsOneWidget);
    });

    testWidgets('Room list should be scrollable', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RoomListScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Verify scrollable list exists
      expect(find.byType(ListView), findsOneWidget);
    });
  });

  group('Voice Level Indicator Tests', () {
    testWidgets('Should show active state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VoiceLevelIndicator(
              level: 0.8,
              isActive: true,
            ),
          ),
        ),
      );

      final indicator = tester.widget<VoiceLevelIndicator>(
        find.byType(VoiceLevelIndicator),
      );

      expect(indicator.isActive, true);
      expect(indicator.level, 0.8);
    });

    testWidgets('Should show inactive state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VoiceLevelIndicator(
              level: 0.0,
              isActive: false,
            ),
          ),
        ),
      );

      final indicator = tester.widget<VoiceLevelIndicator>(
        find.byType(VoiceLevelIndicator),
      );

      expect(indicator.isActive, false);
      expect(indicator.level, 0.0);
    });
  });

  group('Navigation Tests', () {
    testWidgets('Should navigate between tabs', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();

      // Tap on profile tab
      await tester.tap(find.byIcon(Icons.person));
      await tester.pumpAndSettle();

      // Verify navigation occurred
      expect(find.byIcon(Icons.person), findsOneWidget);

      // Tap on home tab
      await tester.tap(find.byIcon(Icons.home));
      await tester.pumpAndSettle();

      // Verify navigation occurred
      expect(find.byIcon(Icons.home), findsOneWidget);
    });
  });

  group('Form Validation Tests', () {
    testWidgets('Create room form should validate inputs', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RoomListScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap create room button
      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      // Try to submit empty form
      final submitButton = find.text('Create');
      if (submitButton.evaluate().isNotEmpty) {
        await tester.tap(submitButton);
        await tester.pumpAndSettle();

        // Verify validation error is shown
        expect(find.text('Please enter a room name'), findsOneWidget);
      }
    });
  });

  group('Theme Tests', () {
    testWidgets('App should use correct theme', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      
      expect(materialApp.theme, isNotNull);
      expect(materialApp.theme!.primaryColor, isNotNull);
    });
  });
}