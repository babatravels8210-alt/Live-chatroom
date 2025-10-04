import React, { useState } from 'react';
import './CreateRoomModal.css';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (roomData: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreate }) => {
  const [roomName, setRoomName] = useState('');
  const [theme, setTheme] = useState('General');
  const [privacy, setPrivacy] = useState('public');

  const themes = [
    'General',
    'Gaming',
    'Music',
    'Study',
    'Karaoke',
    'Dating',
    'Comedy',
    'Storytelling'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreate({
        name: roomName,
        theme,
        privacy
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Voice Room</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {themes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Privacy</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="public"
                  checked={privacy === 'public'}
                  onChange={(e) => setPrivacy(e.target.value)}
                />
                Public - Anyone can join
              </label>
              <label>
                <input
                  type="radio"
                  value="private"
                  checked={privacy === 'private'}
                  onChange={(e) => setPrivacy(e.target.value)}
                />
                Private - Invitation only
              </label>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;