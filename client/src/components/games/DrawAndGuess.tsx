import React, { useState, useRef, useEffect } from 'react';
import './DrawAndGuess.css';

interface DrawAndGuessProps {
  roomId: string;
  userId: string;
  onExit: () => void;
}

const DrawAndGuess: React.FC<DrawAndGuessProps> = ({ roomId, userId, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [currentWord, setCurrentWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDrawer, setIsDrawer] = useState(true);

  const words = ['Cat', 'House', 'Tree', 'Car', 'Sun', 'Moon', 'Star', 'Flower', 'Bird', 'Fish'];
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (isDrawer) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
    }
  }, [isDrawer]); // Removed words from dependency array since it's a constant

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up - switch roles
      setIsDrawer(i => !i); // Using functional update to avoid dependency on isDrawer
      setTimeLeft(60);
      clearCanvas();
    }
  }, [timeLeft]); // Removed isDrawer and clearCanvas from dependency array

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const submitGuess = () => {
    if (guess.trim() === '') return;

    setGuesses([...guesses, guess]);

    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      setScore(score + 10);
      alert('Correct! 🎉');
      setIsDrawer(i => !i); // Using functional update to avoid dependency on isDrawer
      setTimeLeft(60);
      clearCanvas();
    }

    setGuess('');
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="draw-and-guess">
      <div className="game-header">
        <h2>🎨 Draw & Guess</h2>
        <div className="game-info">
          <span>⏱️ {timeLeft}s</span>
          <span>🏆 Score: {score}</span>
        </div>
        <button className="exit-btn" onClick={onExit}>Exit</button>
      </div>

      <div className="game-content">
        <div className="drawing-area">
          {isDrawer && (
            <div className="word-display">
              <h3>Draw this: <span className="word">{currentWord}</span></h3>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
          />

          {isDrawer && (
            <div className="drawing-tools">
              <div className="color-picker">
                {colors.map(c => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>

              <div className="brush-size">
                <label>Brush Size: {brushSize}px</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
              </div>

              <button className="clear-btn" onClick={clearCanvas}>
                Clear Canvas
              </button>
            </div>
          )}
        </div>

        <div className="guess-area">
          <h3>{isDrawer ? 'Waiting for guesses...' : 'Guess the drawing!'}</h3>

          {!isDrawer && (
            <div className="guess-input">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                placeholder="Type your guess..."
              />
              <button onClick={submitGuess}>Submit</button>
            </div>
          )}

          <div className="guesses-list">
            <h4>Guesses:</h4>
            {guesses.map((g, i) => (
              <div key={i} className="guess-item">
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawAndGuess;