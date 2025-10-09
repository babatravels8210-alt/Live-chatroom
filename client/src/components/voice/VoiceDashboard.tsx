import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRoom from './VoiceRoom';
import CreateRoomModal from './CreateRoomModal';
import './VoiceDashboard.css';

interface Room {
  id: string;
  name: string;
  theme: string;
  participantCount: number;
  host: string;
  thumbnail: string;
  isLive: boolean;
}

const VoiceDashboard: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState({
    name: 'User',
    avatar: '/avatars/default.png',
    coins: 1000,
    level: 1
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = useCallback(() => {
    // Mock data - replace with API call
    const mockRooms: Room[] = [
      {
        id: 'room1',
        name: 'Party Central',
        theme: 'Dance & Music',
        participantCount: 45,
        host: 'DJ Mike',
        thumbnail: '/thumbnails/party.jpg',
        isLive: true
      },
      {
        id: 'room2',
        name: 'Gaming Hub',
        theme: 'Gaming & Chill',
        participantCount: 32,
        host: 'GameMaster',
        thumbnail: '/thumbnails/gaming.jpg',
        isLive: true
      },
      {
        id: 'room3',
        name: 'Study Room',
        theme: 'Quiet & Focus',
        participantCount: 15,
        host: 'StudyBuddy',
        thumbnail: '/thumbnails/study.jpg',
        isLive: true
      },
      {
        id: 'room4',
        name: 'Karaoke Night',
        theme: 'Singing & Fun',
        participantCount: 28,
        host: 'SingStar',
        thumbnail: '/thumbnails/karaoke.jpg',
        isLive: true
      }
    ];
    setRooms(mockRooms);
  }, [setRooms]);

  const joinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
    navigate(`/voice-room/${roomId}`);
  };

  const createRoom = (roomData: any) => {
    const newRoom: Room = {
      id: `room${Date.now()}`,
      name: roomData.name,
      theme: roomData.theme,
      participantCount: 1,
      host: user.name,
      thumbnail: `/thumbnails/${roomData.theme.toLowerCase().replace(' ', '-')}.jpg`,
      isLive: true
    };
    
    setRooms(prev => [newRoom, ...prev]);
    setShowCreateModal(false);
    joinRoom(newRoom.id);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    navigate('/voice-dashboard');
  };

  if (currentRoom) {
    return <VoiceRoom roomId={currentRoom} />;
  }

  return (
    <div className="voice-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Voice Chat Rooms</h1>
          <span className="subtitle">Connect with amazing people</span>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <span className="user-name">{user.name}</span>
            <span className="coins">💎 {user.coins}</span>
            <span className="level">⭐ Level {user.level}</span>
          </div>
          <button className="create-room-btn" onClick={() => setShowCreateModal(true)}>
            + Create Room
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="rooms-section">
          <h2>Live Rooms</h2>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card" onClick={() => joinRoom(room.id)}>
                <div className="room-thumbnail">
                  <img src={room.thumbnail} alt={room.name} />
                  <div className="live-badge">LIVE</div>
                  <div className="participant-count">
                    👥 {room.participantCount}
                  </div>
                </div>
                <div className="room-details">
                  <h3>{room.name}</h3>
                  <p className="theme">{room.theme}</p>
                  <p className="host">Host: {room.host}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar">
          <div className="featured-rooms">
            <h3>Featured Rooms</h3>
            {rooms.slice(0, 3).map(room => (
              <div key={room.id} className="featured-room">
                <img src={room.thumbnail} alt={room.name} />
                <div>
                  <h4>{room.name}</h4>
                  <span>{room.participantCount} people</span>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <button className="action-btn" onClick={() => navigate('/games')}>🎮 Play Games</button>
            <button className="action-btn" onClick={() => navigate('/family')}>👨‍👩‍👧‍👦 Family System</button>
            <button className="action-btn">🎤 Join Karaoke</button>
            <button className="action-btn">📚 Join Study Room</button>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createRoom}
        />
      )}
    </div>
  );
};

export default VoiceDashboard;