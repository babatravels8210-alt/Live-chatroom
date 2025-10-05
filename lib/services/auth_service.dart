import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _username;
  String? _country;

  bool get isAuthenticated => _isAuthenticated;
  String? get username => _username;
  String? get country => _country;

  AuthService() {
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    _username = prefs.getString('username');
    _country = prefs.getString('country');
    _isAuthenticated = _username != null && _country != null;
    notifyListeners();
  }

  Future<void> login(String username, String country) async {
    _username = username;
    _country = country;
    _isAuthenticated = true;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', username);
    await prefs.setString('country', country);
    
    notifyListeners();
  }

  Future<void> logout() async {
    _username = null;
    _country = null;
    _isAuthenticated = false;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('username');
    await prefs.remove('country');
    
    notifyListeners();
  }
}