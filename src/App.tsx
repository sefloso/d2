import React, { useState, useEffect } from 'react';
import './App.css';

// Dummy song data
const dummySongs = [
  {
    title: "This Year",
    lyrics: [
      "I broke free on a Saturday morning",
      "I put the pedal to the floor",
      "Headed north on Mills Avenue",
      "And listened to the engine roar"
    ]
  },
  {
    title: "No Children",
    lyrics: [
      "I hope that our few remaining friends",
      "Give up on trying to save us",
      "I hope we come up with a fail-safe plot",
      "To piss off the dumb few that forgave us"
    ]
  }
];

interface GameOverPopupProps {
  score: number;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

const GameOverPopup: React.FC<GameOverPopupProps> = ({ score, onPlayAgain, onReturnHome }) => (
  <div className="game-over-popup">
    <h2>Game Over!</h2>
    <p>Your final score: {score}</p>
    <button onClick={onPlayAgain}>Play Again</button>
    <button onClick={onReturnHome}>Return to Home</button>
  </div>
);

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<'30sec' | '1min' | '5min' | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSong, setCurrentSong] = useState(dummySongs[0]);
  const [revealedLyrics, setRevealedLyrics] = useState<string[]>([]);
  const [userGuess, setUserGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = (mode: '30sec' | '1min' | '5min') => {
    setGameMode(mode);
    setScore(0);
    setTimeRemaining(mode === '30sec' ? 30 : mode === '1min' ? 60 : 300);
    selectRandomSong();
    setIsGameOver(false);
  };

  const selectRandomSong = () => {
    const randomIndex = Math.floor(Math.random() * dummySongs.length);
    setCurrentSong(dummySongs[randomIndex]);
    setRevealedLyrics([dummySongs[randomIndex].lyrics[0]]);
  };

  const handleGuess = () => {
    if (isGameOver) return;

    const trimmedGuess = userGuess.trim();
    if (trimmedGuess === '') {
      setUserGuess('');
      return;
    }

    if (trimmedGuess.toLowerCase() === currentSong.title.toLowerCase()) {
      setScore(prevScore => prevScore + 1);
      setTimeRemaining(prevTime => Math.min(prevTime + 3, getInitialTime())); // Add 3 seconds, but don't exceed initial time
      selectRandomSong();
    } else {
      setTimeRemaining(prevTime => Math.max(prevTime - 3, 0)); // Subtract 1 second, but don't go below 0
      if (revealedLyrics.length < currentSong.lyrics.length) {
        setRevealedLyrics([...revealedLyrics, currentSong.lyrics[revealedLyrics.length]]);
      }
    }
    setUserGuess('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isGameOver) {
      handleGuess();
    }
  };

  const handlePlayAgain = () => {
    startGame(gameMode!);
  };

  const handleReturnHome = () => {
    setGameMode(null);
    setIsGameOver(false);
  };

  const getInitialTime = () => {
    return gameMode === '30sec' ? 30 : gameMode === '1min' ? 60 : 300;
  };

  useEffect(() => {
    let timer: number;
    if (gameMode && timeRemaining > 0 && !isGameOver) {
      timer = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime === 1) {
            setIsGameOver(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameMode, timeRemaining, isGameOver]);

  return (
    <div className="app">
      <h1>Mountain Goats Guessing Game</h1>
      {!gameMode ? (
        <div className="game-modes">
          <h2>Select a Game Mode:</h2>
          <button onClick={() => startGame('30sec')}>30 Seconds</button>
          <button onClick={() => startGame('1min')}>1 Minute</button>
          <button onClick={() => startGame('5min')}>5 Minutes</button>
        </div>
      ) : (
        <div className="game-area">
          <div className="game-info">
            <p>Score: {score}</p>
            <p>Time Remaining: {timeRemaining}s</p>
          </div>
          {!isGameOver ? (
            <>
              <div className="lyrics-area">
                {revealedLyrics.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div className="guess-area">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your guess"
                />
                <button onClick={handleGuess}>Guess</button>
              </div>
            </>
          ) : (
            <GameOverPopup
              score={score}
              onPlayAgain={handlePlayAgain}
              onReturnHome={handleReturnHome}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;