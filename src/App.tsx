import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/d.jfif';

interface Song {
  title: string;
  lyrics: string[];
}

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<'30sec' | '1min' | '5min' | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [revealedLyrics, setRevealedLyrics] = useState<string[]>([]);
  const [userGuess, setUserGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/cleaned_mountain_goats_songs.json')
      .then(response => response.json())
      .then(data => setSongs(data));
  }, []);

  const startGame = (mode: '30sec' | '1min' | '5min') => {
    setGameMode(mode);
    setScore(0);
    setTimeRemaining(mode === '30sec' ? 30 : mode === '1min' ? 60 : 300);
    selectRandomSong();
    setIsGameOver(false);
    setIncorrectGuesses(0);
  };

  const selectRandomSong = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]);
      setRevealedLyrics([songs[randomIndex].lyrics[0]]);
      setIncorrectGuesses(0);
    }
  };

  const handleGuess = (guessValue: string = userGuess) => {
    if (isGameOver || !currentSong) return;

    const trimmedGuess = guessValue.trim();
    if (trimmedGuess === '') {
      setUserGuess('');
      return;
    }

    if (trimmedGuess.toLowerCase() === currentSong.title.toLowerCase()) {
      setScore(prevScore => prevScore + 1);
      setTimeRemaining(prevTime => Math.min(prevTime + 3, getInitialTime()));
      selectRandomSong();
    } else {
      setTimeRemaining(prevTime => Math.max(prevTime - 1, 0));
      setIncorrectGuesses(prev => prev + 1);
      
      if (incorrectGuesses < 4) {
        if (revealedLyrics.length < currentSong.lyrics.length) {
          setRevealedLyrics(prevLyrics => [...prevLyrics, currentSong.lyrics[prevLyrics.length]]);
        }
      } else {
        selectRandomSong();
      }
    }
    setUserGuess('');
    setSuggestions([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isGameOver) {
      handleGuess();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserGuess(value);

    if (value.length > 0) {
      const matchingSongs = songs
        .filter(song => song.title.toLowerCase().startsWith(value.toLowerCase()))
        .map(song => song.title)
        .slice(0, 5);
      setSuggestions(matchingSongs);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleGuess(suggestion);
  };

  const handleSkip = () => {
    if (isGameOver || !currentSong) return;
    selectRandomSong();
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
      <h1>darnielledle</h1>
      <div className="logo-container">
        <img src={logo} alt="Mountain Goats Game Logo" ></img>
      </div>
      {!gameMode ? (
        <div className="game-modes">
          <h2>select a game mode:</h2>
          <button className="btn" onClick={() => startGame('30sec')}>thirty seconds</button>
          <button className="btn" onClick={() => startGame('1min')}>one minute</button>
          <button className="btn" onClick={() => startGame('5min')}>five minutes</button>
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
                <div className="search-container">
                  <input
                    type="text"
                    value={userGuess}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your guess"
                  />
                  {suggestions.length > 0 && (
                    <ul className="suggestions">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button onClick={() => handleGuess()}>Guess</button>
                <button onClick={handleSkip}>Skip</button>
              </div>
            </>
          ) : (
            <div className="game-over-popup">
              <h2>Game Over!</h2>
              <p>Your final score: {score}</p>
              <button onClick={() => startGame(gameMode)}>Play Again</button>
              <button onClick={() => setGameMode(null)}>Return to Home</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
