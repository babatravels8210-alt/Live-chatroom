import 'package:flutter/material.dart';

class VoiceLevelIndicator extends StatefulWidget {
  final bool isActive;
  final double level;
  const VoiceLevelIndicator({
    super.key,
    this.isActive = false,
    this.level = 0.0,
  });

  @override
  State<VoiceLevelIndicator> createState() => _VoiceLevelIndicatorState();
}

class _VoiceLevelIndicatorState extends State<VoiceLevelIndicator>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0.0, end: widget.level).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void didUpdateWidget(covariant VoiceLevelIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.level != widget.level) {
      _animation = Tween<double>(begin: _animation.value, end: widget.level)
          .animate(_animationController);
      _animationController.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 30,
      height: 100,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(5),
      ),
      child: Stack(
        children: [
          // Active indicator
          if (widget.isActive)
            Align(
              alignment: Alignment.bottomCenter,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 100 * widget.level,
                decoration: BoxDecoration(
                  color: widget.level > 0.7 ? Colors.red : Colors.green,
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ),
          // Microphone icon
          const Center(
            child: Icon(
              Icons.mic,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}