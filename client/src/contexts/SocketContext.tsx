import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (roomId: string, password?: string) => void;
  leaveRoom: (roomId: string) => void;
  sendRoomMessage: (roomId: string, content: string, type?: string) => void;
  sendPrivateMessage: (recipientId: string, content: string, type?: string) => void;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
          auth: {
            token
          }
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          setConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setConnected(false);
        });

        newSocket.on('connected', (data) => {
          console.log('Socket authenticated:', data);
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        newSocket.on('user_online', (data) => {
          setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        });

        newSocket.on('user_offline', (data) => {
          setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        // Room events
        newSocket.on('room_joined', (data) => {
          console.log('Joined room:', data);
        });

        newSocket.on('room_left', (data) => {
          console.log('Left room:', data);
        });

        newSocket.on('user_joined_room', (data) => {
          console.log('User joined room:', data);
        });

        newSocket.on('user_left_room', (data) => {
          console.log('User left room:', data);
        });

        newSocket.on('new_room_message', (data) => {
          console.log('New room message:', data);
          // Handle new room message
          window.dispatchEvent(new CustomEvent('newRoomMessage', { detail: data }));
        });

        newSocket.on('new_private_message', (data) => {
          console.log('New private message:', data);
          // Handle new private message
          window.dispatchEvent(new CustomEvent('newPrivateMessage', { detail: data }));
        });

        newSocket.on('message_sent', (data) => {
          console.log('Message sent:', data);
          // Handle message sent confirmation
          window.dispatchEvent(new CustomEvent('messageSent', { detail: data }));
        });

        // Typing indicators
        newSocket.on('user_typing', (data) => {
          window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
        });

        newSocket.on('user_stopped_typing', (data) => {
          window.dispatchEvent(new CustomEvent('userStoppedTyping', { detail: data }));
        });

        // WebRTC signaling
        newSocket.on('webrtc_offer', (data) => {
          window.dispatchEvent(new CustomEvent('webrtcOffer', { detail: data }));
        });

        newSocket.on('webrtc_answer', (data) => {
          window.dispatchEvent(new CustomEvent('webrtcAnswer', { detail: data }));
        });

        newSocket.on('webrtc_ice_candidate', (data) => {
          window.dispatchEvent(new CustomEvent('webrtcIceCandidate', { detail: data }));
        });

        // Gift animations
        newSocket.on('gift_animation', (data) => {
          window.dispatchEvent(new CustomEvent('giftAnimation', { detail: data }));
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    }
  }, [user]);

  const joinRoom = (roomId: string, password?: string) => {
    if (socket) {
      socket.emit('join_room', { roomId, password });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave_room', { roomId });
    }
  };

  const sendRoomMessage = (roomId: string, content: string, type: string = 'text') => {
    if (socket) {
      socket.emit('room_message', { roomId, content, type });
    }
  };

  const sendPrivateMessage = (recipientId: string, content: string, type: string = 'text') => {
    if (socket) {
      socket.emit('private_message', { recipientId, content, type });
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    sendPrivateMessage,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};