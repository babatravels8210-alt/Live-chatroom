import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

interface DashboardStats {
  totalUsers: number;
  onlineUsers: number;
  bannedUsers: number;
  activeRooms: number;
  totalMessages: number;
  totalTransactions: number;
  totalRevenue: number;
  totalCoins: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  isBanned: boolean;
  isAdmin: boolean;
  coins: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'rooms' | 'transactions'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, status: filterStatus }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, searchTerm, filterStatus]);

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${userId}/ban`, 
        { isBanned: ban, banReason: ban ? 'Violation of terms' : '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateCoins = async (userId: string, coins: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${userId}/coins`, 
        { coins },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>P Chat Pro - Admin Panel</h1>
        <div className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'rooms' ? 'active' : ''} 
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''} 
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Online Users</h3>
              <p className="stat-number">{stats.onlineUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Banned Users</h3>
              <p className="stat-number">{stats.bannedUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Active Rooms</h3>
              <p className="stat-number">{stats.activeRooms}</p>
            </div>
            <div className="stat-card">
              <h3>Total Messages</h3>
              <p className="stat-number">{stats.totalMessages}</p>
            </div>
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p className="stat-number">{stats.totalTransactions}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">₹{stats.totalRevenue}</p>
            </div>
            <div className="stat-card">
              <h3>Total Coins Sold</h3>
              <p className="stat-number">{stats.totalCoins}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="users-controls">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="online">Online</option>
              <option value="banned">Banned</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Coins</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <img 
                        src={user.avatar || '/default-avatar.png'} 
                        alt={user.username}
                        className="user-avatar"
                      />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.isOnline ? 'online' : 'offline'}`}>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {user.isBanned && <span className="status-badge banned">Banned</span>}
                      {user.isAdmin && <span className="status-badge admin">Admin</span>}
                    </td>
                    <td>
                      <input
                        type="number"
                        value={user.coins}
                        onChange={(e) => handleUpdateCoins(user._id, parseInt(e.target.value))}
                        className="coins-input"
                      />
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleBanUser(user._id, !user.isBanned)}
                        className={user.isBanned ? 'btn-unban' : 'btn-ban'}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="rooms-content">
          <h2>Room Management</h2>
          <p>Room management features coming soon...</p>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="transactions-content">
          <h2>Transaction Management</h2>
          <p>Transaction management features coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;