import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import VoiceDashboard from './components/voice/VoiceDashboard';
import VoiceRoom from './components/voice/VoiceRoom';
import GameHub from './components/games/GameHub';
import FamilySystem from './components/family/FamilySystem';
import DatingProfile from './components/dating/DatingProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<VoiceDashboard />} />
            <Route path="/voice-dashboard" element={<VoiceDashboard />} />
            <Route path="/voice-room/:roomId" element={<VoiceRoom roomId="" />} />
            <Route path="/games" element={<GameHub roomId="" userId="" />} />
            <Route path="/family" element={<FamilySystem />} />
            <Route path="/dating/profile" element={<DatingProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;