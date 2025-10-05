import 'package:flutter/material.dart';

class VoiceControls extends StatelessWidget {
  final VoidCallback onMicToggle;
  final VoidCallback onVolumeToggle;
  final VoidCallback onEndCall;
  final bool isMicMuted;
  final bool isSpeakerOn;

  const VoiceControls({
    super.key,
    required this.onMicToggle,
    required this.onVolumeToggle,
    required this.onEndCall,
    this.isMicMuted = false,
    this.isSpeakerOn = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Color(0xFF1a1a2e),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildControlButton(
            isMicMuted
                ? 'assets/resource/live_h/bar_mic_disable.png'
                : 'assets/resource/live_h/bar_mic.png',
            'Mic',
            onMicToggle,
          ),
          _buildControlButton(
            isSpeakerOn
                ? 'assets/resource/live_h/bar_volume.png'
                : 'assets/resource/live_h/bar_volume_disable.png',
            'Volume',
            onVolumeToggle,
          ),
          _buildControlButton(
            'assets/resource/call_h/icon_reject_h.png',
            'End',
            onEndCall,
            isDanger: true,
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(
    String iconPath,
    String label,
    VoidCallback onPressed, {
    bool isDanger = false,
  }) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: isDanger ? const Color(0xFFFF6B6B) : Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(25),
          ),
          child: IconButton(
            onPressed: onPressed,
            icon: Image.asset(
              iconPath,
              width: 24,
              height: 24,
            ),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}