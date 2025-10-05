import 'package:socket_io_client/socket_io_client.dart' as io;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  io.Socket? _socket;
  bool _connected = false;

  io.Socket get socket => _socket!;
  bool get connected => _connected;

  void init(String serverUrl) {
    _socket = io.io(
      serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();
    _connected = true;

    // Listen for connection events
    _socket!.onConnect((data) {
      print('Socket connected');
    });

    _socket!.onDisconnect((data) {
      print('Socket disconnected');
      _connected = false;
    });

    _socket!.onConnectError((error) {
      print('Socket connection error: $error');
      _connected = false;
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _connected = false;
  }

  void emit(String event, dynamic data) {
    if (_connected) {
      _socket?.emit(event, data);
    }
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event) {
    _socket?.off(event);
  }
}