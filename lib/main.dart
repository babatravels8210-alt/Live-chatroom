import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:achat_global_replica/screens/login_screen.dart';
import 'package:achat_global_replica/screens/home_screen.dart';
import 'package:achat_global_replica/screens/profile_screen.dart';
import 'package:achat_global_replica/services/auth_service.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AuthService(),
      child: const AchatGlobalApp(),
    ),
  );
}

class AchatGlobalApp extends StatelessWidget {
  const AchatGlobalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Achat Global',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF667eea),
          primary: const Color(0xFF667eea),
        ),
      ),
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    
    return authService.isAuthenticated 
      ? const HomeScreen() 
      : const LoginScreen();
  }
}