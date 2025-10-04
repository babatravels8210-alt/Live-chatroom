import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  signup: (username: string, email: string, password: string) =>
    api.post('/auth/signup', { username, email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  verifyOTP: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Dating API
export const datingApi = {
  getProfile: () =>
    api.get('/dating/profile/me'),
  
  updateProfile: (data: any) =>
    api.post('/dating/profile', data),
  
  getPublicProfile: (userId: string) =>
    api.get(`/dating/profile/${userId}`),
  
  discover: (page = 1, limit = 20) =>
    api.get(`/dating/discover?page=${page}&limit=${limit}`),
  
  likeUser: (userId: string, type: 'like' | 'superlike' = 'like') =>
    api.post(`/dating/like/${userId}`, { type }),
  
  passUser: (userId: string) =>
    api.post(`/dating/pass/${userId}`),
  
  getMatches: (page = 1, limit = 20) =>
    api.get(`/dating/matches?page=${page}&limit=${limit}`),
  
  unmatch: (matchId: string) =>
    api.delete(`/dating/unmatch/${matchId}`),
  
  getReceivedLikes: (page = 1, limit = 20) =>
    api.get(`/dating/likes/received?page=${page}&limit=${limit}`),
  
  getGivenLikes: (page = 1, limit = 20) =>
    api.get(`/dating/likes/given?page=${page}&limit=${limit}`),
};

// Chat API
export const chatApi = {
  getRooms: () =>
    api.get('/rooms'),
  
  getRoom: (roomId: string) =>
    api.get(`/rooms/${roomId}`),
  
  createRoom: (data: any) =>
    api.post('/rooms', data),
  
  joinRoom: (roomId: string) =>
    api.post(`/rooms/${roomId}/join`),
  
  leaveRoom: (roomId: string) =>
    api.post(`/rooms/${roomId}/leave`),
  
  getMessages: (roomId: string, limit = 50) =>
    api.get(`/rooms/${roomId}/messages?limit=${limit}`),
};

// User API
export const userApi = {
  getUser: (userId: string) =>
    api.get(`/users/${userId}`),
  
  updateProfile: (data: any) =>
    api.put('/users/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  blockUser: (userId: string) =>
    api.post(`/users/block/${userId}`),
  
  unblockUser: (userId: string) =>
    api.post(`/users/unblock/${userId}`),
  
  getBlockedUsers: () =>
    api.get('/users/blocked'),
  
  searchUsers: (query: string) =>
    api.get(`/users/search?q=${query}`),
};

// Wallet API
export const walletApi = {
  getBalance: () =>
    api.get('/wallet/balance'),
  
  getTransactions: () =>
    api.get('/wallet/transactions'),
  
  addCoins: (amount: number, paymentMethod: string) =>
    api.post('/wallet/add-coins', { amount, paymentMethod }),
  
  transferCoins: (recipientId: string, amount: number) =>
    api.post('/wallet/transfer', { recipientId, amount }),
  
  createPayment: (amount: number) =>
    api.post('/wallet/payment', { amount }),
};

export default api;