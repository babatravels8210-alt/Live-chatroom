import 'package:audioplayers/audioplayers.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioPlayer _effectPlayer = AudioPlayer();

  // Play background music
  Future<void> playBackgroundMusic(String assetPath) async {
    try {
      await _audioPlayer.play(AssetSource(assetPath));
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
    } catch (e) {
      print('Error playing background music: $e');
    }
  }

  // Play sound effect
  Future<void> playSoundEffect(String assetPath) async {
    try {
      await _effectPlayer.play(AssetSource(assetPath));
    } catch (e) {
      print('Error playing sound effect: $e');
    }
  }

  // Stop background music
  Future<void> stopBackgroundMusic() async {
    try {
      await _audioPlayer.stop();
    } catch (e) {
      print('Error stopping background music: $e');
    }
  }

  // Stop sound effect
  Future<void> stopSoundEffect() async {
    try {
      await _effectPlayer.stop();
    } catch (e) {
      print('Error stopping sound effect: $e');
    }
  }

  // Set volume for background music
  Future<void> setMusicVolume(double volume) async {
    try {
      await _audioPlayer.setVolume(volume);
    } catch (e) {
      print('Error setting music volume: $e');
    }
  }

  // Set volume for sound effects
  Future<void> setEffectVolume(double volume) async {
    try {
      await _effectPlayer.setVolume(volume);
    } catch (e) {
      print('Error setting effect volume: $e');
    }
  }

  // Release resources
  Future<void> dispose() async {
    await _audioPlayer.release();
    await _effectPlayer.release();
  }
}