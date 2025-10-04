import React, { useState } from 'react';
import CarRacing from './CarRacing';
import DrawAndGuess from './DrawAndGuess';
import Undercover from './Undercover';
import './GameHub.css';

interface GameHubProps {
  roomId: string;
  userId: string;
}

const GameHub: React.FC<GameHubProps> = ({ roomId, userId }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  const games = [
    {
      id: 'car-racing',
      name: 'Car Racing',
      icon: '🏎️',
      description: 'Race against other players in real-time',
      minPlayers: 2,
      maxPlayers: 8
    },
    {
      id: 'draw-guess',
      name: 'Draw & Guess',
      icon: '🎨',
      description: 'Draw and guess words with friends',
      minPlayers: 3,
      maxPlayers: 10
    },
    {
      id: 'undercover',
      name: 'Undercover',
      icon: '🕵️',
      description: 'Find the undercover agent among players',
      minPlayers: 4,
      maxPlayers: 12
    },
    {
      id: 'trivia',
      name: 'Trivia Quiz',
      icon: '🧠',
      description: 'Test your knowledge with fun questions',
      minPlayers: 2,
      maxPlayers: 20
    },
    {
      id: 'truth-dare',
      name: 'Truth or Dare',
      icon: '🎭',
      description: 'Classic truth or dare game',
      minPlayers: 3,
      maxPlayers: 15
    },
    {
      id: 'karaoke',
      name: 'Karaoke Battle',
      icon: '🎤',
      description: 'Sing and compete with others',
      minPlayers: 2,
      maxPlayers: 10
    }
  ];

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setIsGameActive(true);
  };

  const exitGame = () => {
    setSelectedGame(null);
    setIsGameActive(false);
  };

  if (isGameActive && selectedGame) {
    switch (selectedGame) {
      case 'car-racing':
        return <CarRacing roomId={roomId} userId={userId} onExit={exitGame} />;
      case 'draw-guess':
        return <DrawAndGuess roomId={roomId} userId={userId} onExit={exitGame} />;
      case 'undercover':
        return <Undercover roomId={roomId} userId={userId} onExit={exitGame} />;
      default:
        return (
          <div className="game-coming-soon">
            <h2>🎮 Coming Soon!</h2>
            <p>This game is under development</p>
            <button onClick={exitGame}>Back to Games</button>
          </div>
        );
    }
  }

  return (
    <div className="game-hub">
      <div className="game-hub-header">
        <h2>🎮 Game Hub</h2>
        <p>Choose a game to play with your friends</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h3>{game.name}</h3>
            <p className="game-description">{game.description}</p>
            <div className="game-info">
              <span>👥 {game.minPlayers}-{game.maxPlayers} players</span>
            </div>
            <button 
              className="play-btn"
              onClick={() => startGame(game.id)}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>

      <div className="game-stats">
        <h3>🏆 Your Gaming Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Games Played</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Wins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">-</span>
            <span className="stat-label">Rank</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;