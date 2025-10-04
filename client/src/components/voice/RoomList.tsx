import React from 'react';
import './RoomList.css';

interface Room {
  id: string;
  name: string;
  theme: string;
  participantCount: number;
  host: string;
  thumbnail: string;
  isLive: boolean;
}

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom }) => {
  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div key={room.id} className="room-item" onClick={() => onJoinRoom(room.id)}>
          <div className="room-image">
            <img src={room.thumbnail} alt={room.name} />
            {room.isLive && <span className="live-indicator">LIVE</span>}
          </div>
          <div className="room-info">
            <h3>{room.name}</h3>
            <p className="theme">{room.theme}</p>
            <p className="host">Host: {room.host}</p>
            <p className="participants">{room.participantCount} people</p>
          </div>
          <button className="join-btn">Join</button>
        </div>
      ))}
    </div>
  );
};

export default RoomList;