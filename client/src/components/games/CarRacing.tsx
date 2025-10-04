import React, { useState, useEffect, useRef } from 'react';
import './CarRacing.css';

interface CarRacingProps {
  roomId: string;
  userId: string;
  onExit: () => void;
}

interface Player {
  id: string;
  name: string;
  position: number;
  speed: number;
  color: string;
}

const CarRacing: React.FC<CarRacingProps> = ({ roomId, userId, onExit }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', position: 0, speed: 0, color: '#FF6B6B' },
    { id: '2', name: 'Player 2', position: 0, speed: 0, color: '#4ECDC4' },
    { id: '3', name: 'Player 3', position: 0, speed: 0, color: '#45B7D1' },
    { id: '4', name: 'Player 4', position: 0, speed: 0, color: '#FFA07A' }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameStarted && !winner) {
      gameLoopRef.current = window.setInterval(() => {
        setPlayers(prevPlayers => {
          const updatedPlayers = prevPlayers.map(player => {
            const newSpeed = Math.random() * 5 + 2;
            const newPosition = Math.min(player.position + newSpeed, 100);
            
            if (newPosition >= 100 && !winner) {
              setWinner(player.name);
            }
            
            return {
              ...player,
              position: newPosition,
              speed: newSpeed
            };
          });
          
          return updatedPlayers;
        });
      }, 100);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, winner]);

  const startGame = () => {
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setGameStarted(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, position: 0, speed: 0 })));
    setGameStarted(false);
    setCountdown(3);
    setWinner(null);
  };

  return (
    <div className="car-racing">
      <div className="racing-header">
        <h2>🏎️ Car Racing</h2>
        <button className="exit-btn" onClick={onExit}>Exit Game</button>
      </div>

      {!gameStarted && !winner && (
        <div className="game-lobby">
          <h3>Ready to Race?</h3>
          <p>Click Start to begin the race!</p>
          <button className="start-btn" onClick={startGame}>
            Start Race
          </button>
        </div>
      )}

      {countdown > 0 && countdown < 3 && (
        <div className="countdown">
          <h1>{countdown}</h1>
        </div>
      )}

      <div className="race-track">
        {players.map((player, index) => (
          <div key={player.id} className="race-lane">
            <div className="lane-info">
              <span className="player-name">{player.name}</span>
              <span className="player-position">{Math.round(player.position)}%</span>
            </div>
            <div className="track">
              <div 
                className="car"
                style={{
                  left: `${player.position}%`,
                  backgroundColor: player.color
                }}
              >
                🏎️
              </div>
            </div>
          </div>
        ))}
      </div>

      {winner && (
        <div className="winner-modal">
          <div className="winner-content">
            <h2>🏆 Race Finished!</h2>
            <h3>{winner} Wins!</h3>
            <div className="winner-actions">
              <button onClick={resetGame}>Race Again</button>
              <button onClick={onExit}>Exit</button>
            </div>
          </div>
        </div>
      )}

      <div className="game-controls">
        <button onClick={resetGame}>Reset Race</button>
        <button onClick={onExit}>Exit Game</button>
      </div>
    </div>
  );
};

export default CarRacing;