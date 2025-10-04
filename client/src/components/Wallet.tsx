import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

interface Transaction {
  _id: string;
  type: 'purchase' | 'gift_sent' | 'gift_received' | 'reward';
  amount: number;
  description: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Gift {
  _id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  category: string;
}

const Wallet: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('balance');
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, giftsResponse] = await Promise.all([
        axios.get('/api/wallet/transactions'),
        axios.get('/api/wallet/gifts')
      ]);
      
      setTransactions(transactionsResponse.data.transactions);
      setGifts(giftsResponse.data.gifts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCoins = async () => {
    try {
      const response = await axios.post('/api/wallet/purchase', {
        amount: purchaseAmount
      });
      
      // In a real app, this would redirect to payment gateway
      // For demo, we'll simulate successful purchase
      updateUser({ coins: (user?.coins || 0) + purchaseAmount });
      setShowPurchase(false);
      fetchWalletData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase coins');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'gift_sent': return '🎁➡️';
      case 'gift_received': return '🎁⬅️';
      case 'reward': return '🏆';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Wallet</h1>
          <p className="page-subtitle">Manage your coins and transactions</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Balance Card */}
        <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
            <h2 style={{ fontSize: '36px', margin: '0', color: '#667eea' }}>
              {user?.coins || 0} Coins
            </h2>
            <p style={{ color: '#666', margin: '10px 0 0' }}>Current Balance</p>
          </div>
          
          <button
            className="btn btn-success"
            onClick={() => setShowPurchase(true)}
            style={{ fontSize: '16px', padding: '12px 30px' }}
          >
            💳 Buy Coins
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          <button
            className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
            onClick={() => setActiveTab('balance')}
          >
            💰 Balance
          </button>
          <button
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            📊 Transactions
          </button>
          <button
            className={`tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            🎁 Gift Store
          </button>
        </div>

        {activeTab === 'balance' && (
          <div className="grid grid-2">
            {/* Quick Stats */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Quick Stats</h3>
              
              <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                <div className="stats-card">
                  <div className="stats-number">
                    {transactions.filter(t => t.type === 'purchase').length}
                  </div>
                  <div className="stats-label">Purchases</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">
                    {transactions.filter(t => t.type === 'gift_sent').length}
                  </div>
                  <div className="stats-label">Gifts Sent</div>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="stats-card">
                  <div className="stats-number">
                    {transactions.filter(t => t.type === 'gift_received').length}
                  </div>
                  <div className="stats-label">Gifts Received</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">
                    {transactions
                      .filter(t => t.type === 'purchase')
                      .reduce((sum, t) => sum + t.amount, 0)}
                  </div>
                  <div className="stats-label">Total Spent</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No transactions yet</p>
                  <p style={{ fontSize: '14px' }}>
                    Buy coins or send gifts to see your transaction history
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {transactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderBottom: '1px solid #e9ecef',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {getTransactionIcon(transaction.type)}
                        </span>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>
                            {transaction.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: '600',
                            color: transaction.type === 'gift_sent' ? '#dc3545' : '#28a745'
                          }}
                        >
                          {transaction.type === 'gift_sent' ? '-' : '+'}
                          {transaction.amount}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: getStatusColor(transaction.status)
                          }}
                        >
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>All Transactions</h3>
            
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No transactions found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '18px', marginRight: '8px' }}>
                            {getTransactionIcon(transaction.type)}
                          </span>
                          {transaction.type.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '12px' }}>{transaction.description}</td>
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: transaction.type === 'gift_sent' ? '#dc3545' : '#28a745'
                          }}
                        >
                          {transaction.type === 'gift_sent' ? '-' : '+'}
                          {transaction.amount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span
                            className="badge"
                            style={{ background: getStatusColor(transaction.status) }}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gifts' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Gift Store</h3>
              <p style={{ color: '#666', margin: '0' }}>
                Send beautiful gifts to other users in chat rooms
              </p>
            </div>

            <div className="grid grid-3">
              {gifts.map(gift => (
                <div key={gift._id} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                    {gift.icon}
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>
                    {gift.name}
                  </h4>
                  <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px' }}>
                    {gift.description}
                  </p>
                  <div style={{ marginBottom: '15px' }}>
                    <span className="badge" style={{ background: '#667eea' }}>
                      {gift.category}
                    </span>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
                      {gift.price} coins
                    </span>
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%' }}
                    disabled={(user?.coins || 0) < gift.price}
                  >
                    {(user?.coins || 0) < gift.price ? 'Insufficient Coins' : 'Select Gift'}
                  </button>
                </div>
              ))}
            </div>

            {gifts.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666' }}>No gifts available at the moment</p>
              </div>
            )}
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchase && (
          <div className="modal-overlay" onClick={() => setShowPurchase(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Buy Coins</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowPurchase(false)}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                  Select the amount of coins you want to purchase:
                </p>
                
                <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                  {[100, 500, 1000, 2500].map(amount => (
                    <button
                      key={amount}
                      className={`btn ${purchaseAmount === amount ? 'btn-success' : ''}`}
                      style={{ padding: '15px' }}
                      onClick={() => setPurchaseAmount(amount)}
                    >
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {amount} Coins
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8 }}>
                        ${(amount * 0.01).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label>Custom Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
                    min="10"
                    max="10000"
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Coins:</span>
                  <span>{purchaseAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Price:</span>
                  <span>${(purchaseAmount * 0.01).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', borderTop: '1px solid #e9ecef', paddingTop: '8px' }}>
                  <span>Total:</span>
                  <span>${(purchaseAmount * 0.01).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn"
                  style={{ flex: 1, background: '#f8f9fa', color: '#333' }}
                  onClick={() => setShowPurchase(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={handlePurchaseCoins}
                  disabled={purchaseAmount < 10}
                >
                  💳 Purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;