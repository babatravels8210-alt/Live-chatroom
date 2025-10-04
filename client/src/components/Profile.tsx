import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/users/profile', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="grid grid-2">
          {/* Profile Card */}
          <div className="card">
            <div className="text-center" style={{ marginBottom: '30px' }}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff&size=120`}
                alt={user?.username}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '4px solid #667eea',
                  marginBottom: '15px'
                }}
              />
              <h2 style={{ margin: '0 0 5px', fontSize: '24px' }}>
                {user?.username}
                {user?.isVerified && ' ✅'}
              </h2>
              <p style={{ color: '#666', margin: '0' }}>
                {user?.bio || 'No bio available'}
              </p>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '20px' }}>
              <div className="stats-card">
                <div className="stats-number">{user?.coins || 0}</div>
                <div className="stats-label">Coins</div>
              </div>
              <div className="stats-card">
                <div className="stats-number">
                  {user?.isOnline ? (
                    <span style={{ color: '#28a745' }}>🟢 Online</span>
                  ) : (
                    <span style={{ color: '#6c757d' }}>🔴 Offline</span>
                  )}
                </div>
                <div className="stats-label">Status</div>
              </div>
            </div>

            {!editing ? (
              <button
                className="btn"
                style={{ width: '100%' }}
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-control"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="avatar">Avatar URL</label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    className="form-control"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ flex: 1, background: '#f8f9fa', color: '#333' }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Settings */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Account Settings</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Account Information</h4>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Email:</strong> {user?.email}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Account Type:</strong> {user?.isAdmin ? 'Admin' : 'User'}
                </div>
                <div>
                  <strong>Verified:</strong> {user?.isVerified ? '✅ Yes' : '❌ No'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Privacy Settings</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  Show online status
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  Allow private messages
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  Show in user directory
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Notifications</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  New messages
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  Room invitations
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  Gift notifications
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px', color: '#dc3545' }}>
                Danger Zone
              </h4>
              <button
                className="btn"
                style={{ background: '#dc3545', color: 'white', width: '100%' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Handle account deletion
                    console.log('Delete account');
                  }
                }}
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Activity Statistics</h3>
          
          <div className="grid grid-4">
            <div className="stats-card">
              <div className="stats-number">0</div>
              <div className="stats-label">Rooms Created</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">0</div>
              <div className="stats-label">Messages Sent</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">0</div>
              <div className="stats-label">Gifts Received</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">0</div>
              <div className="stats-label">Friends</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
          
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No recent activity to show</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Start chatting in rooms to see your activity here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;