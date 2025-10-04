import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Navbar from './Navbar';

interface Room {
  _id: string;
  name: string;
  description: string;
  type: 'voice' | 'video' | 'text';
  host: {
    username: string;
    avatar?: string;
  };
  currentParticipants: any[];
  maxParticipants: number;
  category: string;
  isPrivate: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { user } = useAuth();
  const { connected, onlineUsers } = useSocket();

  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    type: 'voice' as 'voice' | 'video' | 'text',
    category: 'casual',
    isPrivate: false,
    password: '',
    maxParticipants: 50
  });

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, searchQuery]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rooms/list', {
        params: {
          category: selectedCategory,
          search: searchQuery,
          limit: 20
        }
      });
      setRooms(response.data.rooms);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/rooms/create', newRoom);
      setRooms([response.data.room, ...rooms]);
      setShowCreateRoom(false);
      setNewRoom({
        name: '',
        description: '',
        type: 'voice',
        category: 'casual',
        isPrivate: false,
        password: '',
        maxParticipants: 50
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const categories = [
    { value: 'all', label: 'All Rooms' },
    { value: 'casual', label: 'Casual' },
    { value: 'music', label: 'Music' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return '🎤';
      case 'video': return '📹';
      case 'text': return '💬';
      default: return '💬';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return '🎵';
      case 'gaming': return '🎮';
      case 'education': return '📚';
      case 'business': return '💼';
      case 'entertainment': return '🎭';
      default: return '💬';
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome back to Date Chat Pro, {user?.username}!</h1>
          <p className="page-subtitle">
            {connected ? (
              <span style={{ color: '#28a745' }}>🟢 Connected • {onlineUsers.length} users online • Ready to meet new people!</span>
            ) : (
              <span style={{ color: '#dc3545' }}>🔴 Connecting to Date Chat Pro...</span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-4" style={{ marginBottom: '30px' }}>
          <div className="stats-card">
            <div className="stats-number">{user?.coins || 0}</div>
            <div className="stats-label">Coins</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{rooms.length}</div>
            <div className="stats-label">Active Rooms</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{onlineUsers.length}</div>
            <div className="stats-label">Online Users</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              {rooms.reduce((total, room) => total + room.currentParticipants.length, 0)}
            </div>
            <div className="stats-label">Total Participants</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          <button
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            🏠 Live Rooms
          </button>
          <button
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            👥 Friends
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 Messages
          </button>
        </div>

        {activeTab === 'live' && (
          <>
            {/* Controls */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-success"
                  onClick={() => setShowCreateRoom(true)}
                >
                  ➕ Create Room
                </button>

                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="form-control"
                  style={{ flex: 1, minWidth: '200px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rooms List */}
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : (
              <div className="grid grid-2">
                {rooms.map(room => (
                  <div key={room._id} className="room-card">
                    <div className="room-header">
                      <div>
                        <h3 className="room-name">
                          {getTypeIcon(room.type)} {room.name}
                          {room.isPrivate && ' 🔒'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {getCategoryIcon(room.category)} {room.category}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            by @{room.host.username}
                          </span>
                        </div>
                      </div>
                      <div className="room-participants">
                        {room.currentParticipants.length}/{room.maxParticipants}
                      </div>
                    </div>

                    {room.description && (
                      <p className="room-description">{room.description}</p>
                    )}

                    <div className="room-actions">
                      <Link
                        to={`/room/${room._id}`}
                        className="btn btn-success"
                        style={{ textDecoration: 'none' }}
                      >
                        Join Room
                      </Link>
                      <button className="btn" style={{ background: '#f8f9fa', color: '#333' }}>
                        👁️ Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rooms.length === 0 && !loading && (
              <div className="text-center" style={{ padding: '40px' }}>
                <h3 style={{ color: '#666', marginBottom: '10px' }}>No rooms found</h3>
                <p style={{ color: '#999' }}>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create a room!'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'friends' && (
          <div className="card">
            <h3>Friends</h3>
            <p>Friends feature coming soon...</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="card">
            <h3>Messages</h3>
            <p>Private messages feature coming soon...</p>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="modal-overlay" onClick={() => setShowCreateRoom(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Room</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateRoom(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                  <label>Room Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    required
                    placeholder="Enter room name"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="Room description (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Room Type</label>
                  <select
                    className="form-control"
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value as any })}
                  >
                    <option value="voice">🎤 Voice Chat</option>
                    <option value="video">📹 Video Chat</option>
                    <option value="text">💬 Text Chat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={newRoom.category}
                    onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: parseInt(e.target.value) })}
                    min="2"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={newRoom.isPrivate}
                      onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                    />
                    Private Room
                  </label>
                </div>

                {newRoom.isPrivate && (
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newRoom.password}
                      onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                      placeholder="Room password"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: '#f8f9fa', color: '#333' }}
                    onClick={() => setShowCreateRoom(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;