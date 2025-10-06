import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { io } from 'socket.io-client';
import './VoiceRoom.css';

interface VoiceRoomProps {
  roomId: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  role: 'host' | 'speaker' | 'audience';
}

const VoiceRoom: React.FC<VoiceRoomProps> = ({ roomId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
    name: 'Party Room',
    theme: 'Cozy',
    participantCount: 0,
    host: 'Room Host'
  });
  
  const client = useRef<any>(null);
  const socket = useRef<any>(null);
  const localAudioTrack = useRef<any>(null);

  useEffect(() => {
    initializeVoiceRoom();
    return () => {
      cleanup();
    };
  }, [roomId, initializeVoiceRoom]);

  const initializeVoiceRoom = async () => {
    try {
      // Initialize Agora client
      client.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      
      // Set up event listeners
      client.current.on('user-published', handleUserPublished);
      client.current.on('user-unpublished', handleUserUnpublished);
      
      // Join channel
      await joinChannel();
      
      // Connect to Socket.IO
      socket.current = io('http://localhost:12000');
      setupSocketListeners();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing voice room:', error);
    }
  };

  const joinChannel = async () => {
    if (!client.current) return;
    
    const appId = process.env.REACT_APP_AGORA_APP_ID || '';
    const token = process.env.REACT_APP_AGORA_TOKEN || '';
    
    try {
      await client.current.join(appId, roomId, token);
      
      // Create and publish local audio track
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.current.publish([localAudioTrack.current]);
      
      // Add self to users list
      const newUser: User = {
        id: 'local',
        name: 'You',
        avatar: '/avatars/default.png',
        isSpeaking: false,
        isMuted: false,
        role: 'speaker'
      };
      
      setUsers([newUser]);
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const handleUserPublished = async (user: any, mediaType: string) => {
    if (mediaType === 'audio') {
      await client.current?.subscribe(user, mediaType);
      const remoteUser: User = {
        id: user.uid,
        name: `User ${user.uid}`,
        avatar: '/avatars/default.png',
        isSpeaking: false,
        isMuted: false,
        role: 'speaker'
      };
      
      setUsers(prev => [...prev, remoteUser]);
    }
  };

  const handleUserUnpublished = (user: any) => {
    setUsers(prev => prev.filter(u => u.id !== user.uid));
  };

  const setupSocketListeners = () => {
    if (!socket.current) return;
    
    socket.current.on('user-joined', (user: User) => {
      setUsers(prev => [...prev, user]);
    });
    
    socket.current.on('user-left', (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });
    
    socket.current.on('user-speaking', (userId: string, isSpeaking: boolean) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isSpeaking } : u
      ));
    });
  };

  const toggleMute = async () => {
    if (localAudioTrack.current) {
      if (isMuted) {
        await localAudioTrack.current.setEnabled(true);
      } else {
        await localAudioTrack.current.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const leaveRoom = () => {
    cleanup();
    // Navigate away from room
  };

  const cleanup = async () => {
    if (client.current) {
      await client.current.leave();
    }
    if (localAudioTrack.current) {
      localAudioTrack.current.close();
    }
    if (socket.current) {
      socket.current.disconnect();
    }
  };

  return (
    <div className="voice-room">
      <div className="room-header">
        <div className="room-info">
          <h2>{roomInfo.name}</h2>
          <span className="theme">{roomInfo.theme}</span>
          <span className="participants">{users.length} people</span>
        </div>
        <div className="room-actions">
          <button className="theme-btn">Change Theme</button>
          <button className="share-btn">Share Room</button>
        </div>
      </div>

      <div className="room-content">
        <div className="participants-grid">
          {users.map((user) => (
            <div key={user.id} className={`participant-card ${user.isSpeaking ? 'speaking' : ''}`}>
              <div className="avatar">
                <img src={user.avatar} alt={user.name} />
                {user.isSpeaking && <div className="speaking-indicator"></div>}
              </div>
              <div className="user-info">
                <span className="name">{user.name}</span>
                <span className="role">{user.role}</span>
              </div>
              {user.isMuted && <div className="muted-indicator">🔇</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="room-controls">
        <button 
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? '🎤 Muted' : '🎤 Speak'}
        </button>
        <button className="control-btn" onClick={leaveRoom}>
          🚪 Leave Room
        </button>
        <button className="control-btn">🎁 Send Gift</button>
        <button className="control-btn">👥 Invite</button>
      </div>
    </div>
  );
};

export default VoiceRoom;