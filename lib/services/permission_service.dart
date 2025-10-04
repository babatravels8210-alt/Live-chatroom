import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  static final PermissionService _instance = PermissionService._internal();
  factory PermissionService() => _instance;
  PermissionService._internal();

  // Check and request microphone permission
  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  // Check and request camera permission
  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  // Check and request storage permission
  Future<bool> requestStoragePermission() async {
    final status = await Permission.storage.request();
    return status.isGranted;
  }

  // Check and request notification permission
  Future<bool> requestNotificationPermission() async {
    final status = await Permission.notification.request();
    return status.isGranted;
  }

  // Check if all required permissions are granted
  Future<bool> checkRequiredPermissions() async {
    final micStatus = await Permission.microphone.status;
    final storageStatus = await Permission.storage.status;
    
    return micStatus.isGranted && storageStatus.isGranted;
  }

  // Open app settings to allow user to grant permissions manually
  Future<void> openAppSettings() async {
    await openAppSettings();
  }
}