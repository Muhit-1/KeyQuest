import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Keyboard as KeyboardIcon, LogOut, RotateCcw, Trophy } from 'lucide-react';
import Keyboard from './components/Keyboard';
import WordDisplay from './components/WordDisplay';
import RiddleModal from './components/RiddleModal';
import ScoreBoardModal from './components/ScoreBoardModal';
import GameOverModal from './components/GameOverModal';
import SaveScoreModal from './components/SaveScoreModal';
import {
  getBestScore,
  getPlayerName,
  saveScore,
  setBestScore
} from './utils/leaderboard';
import { validatePlayerName } from './utils/security';
import riddlesData from './data/riddles.json';
import { TEXTS, GAME_CONFIG } from './constants/texts';

// Game states
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  RIDDLE: 'riddle',
  GAME_OVER: 'game_over'
};

const ERROR_FLASH_MS = 350;

// Sound effects (using Web Audio API)
const playSound = (frequency, duration, type = 'sine') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Audio is a nice-to-have; never let it break the game
  }
};

/** Picks `count` random words from a riddle's word list. */
const pickRoundWords = (words = [], count = GAME_CONFIG.WORDS_PER_ROUND) => {
  const pool = [...words];
  const picked = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }

  return picked;
};

/** Keeps a chosen duration inside the allowed range. */
const clampDuration = (seconds) => {
  const value = Number.parseInt(seconds, 10);
  if (!Number.isFinite(value)) return GAME_CONFIG.INITIAL_TIME;
  return Math.min(Math.max(value, GAME_CONFIG.MIN_CUSTOM_TIME), GAME_CONFIG.MAX_CUSTOM_TIME);
};

const App = () => {
  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.INITIAL_TIME);
  const [selectedTime, setSelectedTime] = useState(GAME_CONFIG.INITIAL_TIME);
  const [customTime, setCustomTime] = useState('');
  const [playerHighScore, setPlayerHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [isNewBest, setIsNewBest] = useState(false);

  // Typing game state
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [usedRiddleIndices, setUsedRiddleIndices] = useState([]);
  const [roundWords, setRoundWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [hasError, setHasError] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Modal states
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);

  // Refs
  const scoreRef = useRef(0);
  const errorTimeoutRef = useRef(null);

  const currentRiddle = riddlesData.riddles[currentRiddleIndex];
  const currentWord = roundWords[currentWordIndex];
  const nextWord = roundWords[currentWordIndex + 1];
  const showRiddleModal = gameState === GAME_STATES.RIDDLE;

  // Keep a ref of the score so callbacks stay stable (a changing `endGame`
  // identity would otherwise restart the countdown on every keystroke)
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load the stored personal best and player name once
  useEffect(() => {
    setPlayerHighScore(getBestScore());
    setPlayerName(getPlayerName());
  }, []);

  // Clear a pending error flash on unmount
  useEffect(() => () => clearTimeout(errorTimeoutRef.current), []);

  const startRound = useCallback((riddleIndex) => {
    const riddle = riddlesData.riddles[riddleIndex];
    setCurrentRiddleIndex(riddleIndex);
    setRoundWords(pickRoundWords(riddle?.words));
    setCurrentWordIndex(0);
    setTypedText('');
    setHasError(false);
  }, []);

  const initializeGame = useCallback(() => {
    const duration = clampDuration(selectedTime);
    const firstRiddleIndex = Math.floor(Math.random() * riddlesData.riddles.length);

    setSelectedTime(duration);
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(duration);
    setUsedRiddleIndices([firstRiddleIndex]);
    setCurrentRound(1);
    setIsNewBest(false);
    setShowGameOver(false);
    setShowScoreBoard(false);
    setShowSaveScore(false);
    startRound(firstRiddleIndex);
    setGameState(GAME_STATES.PLAYING);
  }, [selectedTime, startRound]);

  const goToMenu = useCallback(() => {
    setShowGameOver(false);
    setShowSaveScore(false);
    setTimeLeft(clampDuration(selectedTime));
    setGameState(GAME_STATES.MENU);
  }, [selectedTime]);

  // End game - stable identity, reads the live score from a ref
  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    const storedBest = getBestScore();

    if (finalScore > storedBest) {
      setIsNewBest(true);
      setBestScore(finalScore);
      setPlayerHighScore(finalScore);
    } else {
      setIsNewBest(false);
    }

    setGameState(GAME_STATES.GAME_OVER);
    setShowGameOver(true);
  }, []);

  // Countdown - one interval per playing session
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return undefined;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState]);

  // Time is up
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft, endGame]);

  // Move to next word, or to the riddle once the round is typed out
  const moveToNextWord = useCallback(() => {
    setScore((prev) => prev + GAME_CONFIG.POINTS_PER_WORD);

    if (currentWordIndex + 1 < roundWords.length) {
      setCurrentWordIndex((prev) => prev + 1);
      setTypedText('');
      setHasError(false);
    } else {
      setTypedText('');
      setHasError(false);
      setGameState(GAME_STATES.RIDDLE);
    }
  }, [currentWordIndex, roundWords.length]);

  // Handle key press
  const handleKeyPress = useCallback((key) => {
    if (gameState !== GAME_STATES.PLAYING || !currentWord || typeof key !== 'string') return;

    if (key === 'BACKSPACE') {
      setTypedText((prev) => prev.slice(0, -1));
      setHasError(false);
      return;
    }

    const targetChar = currentWord[typedText.length];
    if (!targetChar) return;

    // Case-insensitive: the on-screen keyboard has no Shift key
    if (key.toLowerCase() === targetChar.toLowerCase()) {
      playSound(800, 0.1);
      clearTimeout(errorTimeoutRef.current);
      setHasError(false);

      const newTypedText = typedText + targetChar;
      setTypedText(newTypedText);

      // A word only counts when every letter matches
      if (newTypedText === currentWord) {
        moveToNextWord();
      }
      return;
    }

    // Wrong key: flash the letter red, take the penalty, do NOT advance
    playSound(400, 0.15);
    setScore((prev) => Math.max(0, prev - GAME_CONFIG.POINTS_PENALTY_WRONG_KEY));
    setHasError(true);
    clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setHasError(false), ERROR_FLASH_MS);
  }, [gameState, currentWord, typedText, moveToNextWord]);

  // Handle riddle answer
  const handleRiddleAnswer = useCallback((isCorrect) => {
    if (!isCorrect) {
      playSound(150, 0.8, 'sawtooth');
      endGame();
      return;
    }

    playSound(1000, 0.5);
    setScore((prev) => prev + GAME_CONFIG.POINTS_PER_RIDDLE);

    const availableIndices = riddlesData.riddles
      .map((_, index) => index)
      .filter((index) => !usedRiddleIndices.includes(index));

    if (availableIndices.length === 0) {
      endGame();
      return;
    }

    const nextRiddleIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedRiddleIndices((prev) => [...prev, nextRiddleIndex]);
    setCurrentRound((prev) => prev + 1);
    setTimeLeft((prev) =>
      Math.min(prev + GAME_CONFIG.BONUS_TIME, Math.max(selectedTime, GAME_CONFIG.MAX_TIME))
    );
    startRound(nextRiddleIndex);
    setGameState(GAME_STATES.PLAYING);
  }, [usedRiddleIndices, selectedTime, startRound, endGame]);

  // Save score to the local leaderboard
  const handleSaveScore = (name) => {
    const validation = validatePlayerName(name);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const result = saveScore(validation.sanitized, score);
    if (!result.success) {
      return result;
    }

    setPlayerName(validation.sanitized);
    setShowSaveScore(false);
    setShowGameOver(false);
    setGameState(GAME_STATES.MENU);
    return result;
  };

  const handlePresetTime = (time) => {
    setSelectedTime(time);
    setCustomTime('');
    setTimeLeft(time);
  };

  const handleCustomTime = (event) => {
    const raw = event.target.value;
    setCustomTime(raw);

    const value = Number.parseInt(raw, 10);
    if (Number.isFinite(value) && value >= GAME_CONFIG.MIN_CUSTOM_TIME && value <= GAME_CONFIG.MAX_CUSTOM_TIME) {
      setSelectedTime(value);
      setTimeLeft(value);
    }
  };

  const isMenu = gameState === GAME_STATES.MENU;
  const isInGame = gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.RIDDLE;
  const displayedTime = isMenu ? clampDuration(selectedTime) : timeLeft;
  const roundProgress = roundWords.length
    ? (currentWordIndex / roundWords.length) * 100
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-background to-accent/40">
      {/* Header */}
      <header className="flex shrink-0 flex-col items-center justify-between gap-4 p-4 sm:flex-row sm:gap-0 sm:p-6">
        {/* Score */}
        <div className="w-full rounded-xl bg-white/70 px-4 py-2 text-center shadow-lg backdrop-blur-sm sm:w-auto sm:min-w-[200px]">
          <div className="text-xs text-gray-600 sm:text-sm">{TEXTS.SCORE_LABEL}</div>
          <div className="text-xl font-bold text-primary sm:text-2xl">{score}</div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-xl font-bold leading-tight text-transparent transition-transform duration-300 hover:scale-105 sm:text-2xl md:text-3xl lg:text-4xl">
            {TEXTS.APP_TITLE}
          </h1>
        </div>

        {/* Timer & Actions */}
        <div className="w-full text-center sm:w-auto sm:min-w-[200px]">
          <div className="mb-2 rounded-xl bg-white/70 px-4 py-2 text-center shadow-lg backdrop-blur-sm">
            <div className="text-xs text-gray-600 sm:text-sm">{TEXTS.TIME_LABEL}</div>
            <div className={`text-xl font-bold sm:text-2xl ${timeLeft <= 10 && !isMenu ? 'text-red-500' : 'text-primary'}`}>
              {displayedTime}
              {TEXTS.SECONDS_UNIT}
            </div>
          </div>

          {isMenu && (
            <button
              type="button"
              onClick={() => setShowScoreBoard(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary sm:w-auto sm:text-sm"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              {TEXTS.TOP_SCOREBOARD_BUTTON}
            </button>
          )}

          {isInGame && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={initializeGame}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {TEXTS.RESTART_BUTTON}
              </button>
              <button
                type="button"
                onClick={goToMenu}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/70 px-4 py-2 text-xs font-medium text-gray-700 shadow transition-colors hover:bg-white sm:text-sm"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {TEXTS.QUIT_BUTTON}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        {/* Menu State */}
        {isMenu && (
          <motion.div
            className="w-full max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-8 flex justify-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <KeyboardIcon className="h-20 w-20 text-primary sm:h-24 sm:w-24" aria-hidden="true" />
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold text-primary sm:text-4xl">
              {TEXTS.WELCOME_HEADING}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              {TEXTS.WELCOME_SUBTITLE}
            </p>

            {/* Time Selection */}
            <div className="mb-8">
              <p className="mb-4 font-semibold text-gray-700">{TEXTS.DURATION_HEADING}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {GAME_CONFIG.TIME_PRESETS.map((time) => (
                  <motion.button
                    key={time}
                    type="button"
                    onClick={() => handlePresetTime(time)}
                    className={`rounded-xl px-6 py-3 font-bold transition-all duration-300 ${
                      selectedTime === time && !customTime
                        ? 'scale-105 bg-primary text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time}
                    {TEXTS.SECONDS_UNIT}
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <label htmlFor="custom-time" className="text-sm font-medium text-gray-700">
                  {TEXTS.CUSTOM_TIME_LABEL}
                </label>
                <input
                  id="custom-time"
                  type="number"
                  inputMode="numeric"
                  min={GAME_CONFIG.MIN_CUSTOM_TIME}
                  max={GAME_CONFIG.MAX_CUSTOM_TIME}
                  value={customTime}
                  onChange={handleCustomTime}
                  placeholder={TEXTS.CUSTOM_TIME_PLACEHOLDER}
                  className={`w-24 rounded-xl border-2 bg-white/70 px-3 py-2 text-center font-semibold text-gray-800 focus:outline-none ${
                    customTime ? 'border-primary' : 'border-gray-300 focus:border-primary'
                  }`}
                />
                <span className="text-sm text-gray-600">{TEXTS.SECONDS_LABEL}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {GAME_CONFIG.MIN_CUSTOM_TIME}-{GAME_CONFIG.MAX_CUSTOM_TIME} {TEXTS.SECONDS_LABEL}
              </p>
            </div>

            <motion.button
              type="button"
              onClick={initializeGame}
              className="mx-auto w-full max-w-xs rounded-2xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {TEXTS.START_GAME_BUTTON}
            </motion.button>
          </motion.div>
        )}

        {/* Playing State */}
        {isInGame && (
          <div className="w-full max-w-4xl">
            <WordDisplay
              currentWord={currentWord}
              typedText={typedText}
              hasError={hasError}
              showNextWord
              nextWord={nextWord}
            />

            <div className="mt-6">
              <Keyboard
                onKeyPress={handleKeyPress}
                disabled={gameState !== GAME_STATES.PLAYING}
              />
            </div>

            {/* Progress indicator */}
            <div className="mt-6 text-center">
              <div className="mb-2 text-sm text-gray-600">
                {TEXTS.ROUND_LABEL} {currentRound} of {riddlesData.riddles.length} &middot;{' '}
                {TEXTS.WORD_LABEL} {Math.min(currentWordIndex + 1, roundWords.length)} of {roundWords.length}
              </div>
              <div className="mx-auto h-2 w-full max-w-md rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${roundProgress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex shrink-0 flex-col items-center justify-between gap-3 p-4 text-sm sm:flex-row sm:p-6">
        <div className="w-full rounded-lg bg-white/70 px-4 py-2 text-center shadow-lg backdrop-blur-sm sm:w-auto sm:min-w-[200px]">
          <div className="text-sm text-gray-600">{TEXTS.YOUR_BEST_LABEL}</div>
          <div className="text-xl font-bold text-primary">{playerHighScore}</div>
        </div>

        <div className="text-xs font-medium text-gray-500">{TEXTS.FOOTER_VERSION}</div>
      </footer>

      {/* Modals */}
      <RiddleModal
        isOpen={showRiddleModal}
        riddle={currentRiddle}
        onAnswer={handleRiddleAnswer}
        timeLeft={timeLeft}
      />

      <ScoreBoardModal
        isOpen={showScoreBoard}
        onClose={() => setShowScoreBoard(false)}
      />

      <GameOverModal
        isOpen={showGameOver}
        score={score}
        isNewBest={isNewBest}
        onSave={() => {
          setShowGameOver(false);
          setShowSaveScore(true);
        }}
        onPlayAgain={initializeGame}
        onBackToMenu={goToMenu}
      />

      <SaveScoreModal
        isOpen={showSaveScore}
        score={score}
        defaultName={playerName}
        onSave={handleSaveScore}
        onSkip={goToMenu}
      />
    </div>
  );
};

export default App;
