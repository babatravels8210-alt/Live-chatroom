import React, { useState, useEffect } from 'react';
import './Undercover.css';

interface UndercoverProps {
  roomId: string;
  userId: string;
  onExit: () => void;
}

interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'undercover' | 'mrwhite';
  word: string;
  isAlive: boolean;
  votes: number;
}

const Undercover: React.FC<UndercoverProps> = ({ roomId, userId, onExit }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<'description' | 'voting' | 'result'>('description');
  const [myWord, setMyWord] = useState('');

  const wordPairs = [
    { civilian: 'Apple', undercover: 'Orange' },
    { civilian: 'Cat', undercover: 'Dog' },
    { civilian: 'Coffee', undercover: 'Tea' },
    { civilian: 'Car', undercover: 'Bike' },
    { civilian: 'Summer', undercover: 'Winter' }
  ];

  const initializeGame = () => {
    const wordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    const totalPlayers = 6;
    const undercoverCount = 1;
    const mrWhiteCount = 1;

    const newPlayers: Player[] = [];
    
    // Create players
    for (let i = 0; i < totalPlayers; i++) {
      let role: 'civilian' | 'undercover' | 'mrwhite' = 'civilian';
      let word = wordPair.civilian;

      if (i === 0) {
        role = 'undercover';
        word = wordPair.undercover;
      } else if (i === 1) {
        role = 'mrwhite';
        word = '???';
      }

      newPlayers.push({
        id: `player-${i}`,
        name: i === 0 ? 'You' : `Player ${i + 1}`,
        role,
        word,
        isAlive: true,
        votes: 0
      });
    }

    // Shuffle players
    for (let i = newPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPlayers[i], newPlayers[j]] = [newPlayers[j], newPlayers[i]];
    }

    setPlayers(newPlayers);
    setMyWord(newPlayers[0].word);
  };

  useEffect(() => {
    if (gameStarted && players.length === 0) {
      initializeGame();
    }
  }, [gameStarted, players.length, initializeGame]);

  const votePlayer = (playerId: string) => {
    setSelectedPlayer(playerId);
  };

  const submitVote = () => {
    if (!selectedPlayer) return;

    setPlayers(players.map(p => 
      p.id === selectedPlayer 
        ? { ...p, votes: p.votes + 1 }
        : p
    ));

    setGamePhase('result');
    
    setTimeout(() => {
      eliminatePlayer();
    }, 2000);
  };

  const eliminatePlayer = () => {
    const maxVotes = Math.max(...players.map(p => p.votes));
    const eliminatedPlayer = players.find(p => p.votes === maxVotes);

    if (eliminatedPlayer) {
      setPlayers(players.map(p => 
        p.id === eliminatedPlayer.id 
          ? { ...p, isAlive: false }
          : { ...p, votes: 0 }
      ));

      checkGameEnd();
    }

    setCurrentRound(currentRound + 1);
    setGamePhase('description');
    setSelectedPlayer(null);
  };

  const checkGameEnd = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover').length;
    const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian').length;

    if (aliveUndercover === 0) {
      alert('Civilians Win! 🎉');
    } else if (aliveUndercover >= aliveCivilians) {
      alert('Undercover Wins! 🕵️‍♀️');
    }
  };

  return (
    <div className="undercover-game">
      <div className="game-header">
        <h2>🕵️‍♀️ Undercover</h2>
        <div className="game-info">
          <span>Round: {currentRound}</span>
          <span>Phase: {gamePhase}</span>
        </div>
        <button className="exit-btn" onClick={onExit}>Exit</button>
      </div>

      {!gameStarted ? (
        <div className="game-lobby">
          <h3>How to Play Undercover</h3>
          <div className="rules">
            <p>🎯 <strong>Objective:</strong></p>
            <ul>
              <li>Civilians: Find and eliminate the Undercover and Mr. White</li>
              <li>Undercover: Blend in and survive</li>
              <li>Mr. White: Figure out the word and survive</li>
            </ul>
            <p>📝 <strong>Rules:</strong></p>
            <ul>
              <li>Each player gets a word (Undercover gets a different word)</li>
              <li>Describe your word without saying it</li>
              <li>Vote to eliminate suspicious players</li>
              <li>Last team standing wins!</li>
            </ul>
          </div>
          <button className="start-btn" onClick={() => setGameStarted(true)}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="my-word-card">
            <h3>Your Word:</h3>
            <div className="word-display">{myWord}</div>
            <p className="hint">Describe this word without saying it!</p>
          </div>

          <div className="players-grid">
            {players.map((player) => (
              <div 
                key={player.id}
                className={`player-card ${!player.isAlive ? 'eliminated' : ''} ${selectedPlayer === player.id ? 'selected' : ''}`}
                onClick={() => gamePhase === 'voting' && player.isAlive && votePlayer(player.id)}
              >
                <div className="player-avatar">
                  {player.isAlive ? '👤' : '💀'}
                </div>
                <div className="player-name">{player.name}</div>
                {gamePhase === 'result' && (
                  <div className="player-votes">Votes: {player.votes}</div>
                )}
                {!player.isAlive && (
                  <div className="player-role">
                    Role: {player.role}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="game-actions">
            {gamePhase === 'description' && (
              <button onClick={() => setGamePhase('voting')}>
                Start Voting
              </button>
            )}
            {gamePhase === 'voting' && (
              <button 
                onClick={submitVote}
                disabled={!selectedPlayer}
              >
                Submit Vote
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Undercover;