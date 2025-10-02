import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Keyboard from './components/Keyboard';
import WordDisplay from './components/WordDisplay';
import RiddleModal from './components/RiddleModal';
import ScoreBoardModal from './components/ScoreBoardModal';
import { getPlayerHighScore, saveScore } from './utils/supabaseClient';
import { validatePlayerName, sanitizeText, checkRateLimit } from './utils/security';
import riddlesData from './data/riddles.json';
import { TEXTS, GAME_CONFIG } from './constants/texts';
import developerImage from './data/me_hit.png';

// Game states
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  RIDDLE: 'riddle',
  GAME_OVER: 'game_over'
};

// Sound effects (using Web Audio API)
const playSound = (frequency, duration, type = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    console.log('Audio not supported');
  }
};

const App = () => {
  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedTime, setSelectedTime] = useState(30); // Selected initial time
  const [playerHighScore, setPlayerHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('');

  // Typing game state
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [pressedKey, setPressedKey] = useState('');
  const [wrongKeyCount, setWrongKeyCount] = useState(0);
  const [usedRiddleIndices, setUsedRiddleIndices] = useState([]);
  const [currentRound, setCurrentRound] = useState(1); // Independent round counter

  // Modal states
  const [showRiddleModal, setShowRiddleModal] = useState(false);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  // Get current riddle and word
  const currentRiddle = riddlesData.riddles[currentRiddleIndex];
  const currentWord = currentRiddle?.words[currentWordIndex];
  const nextWord = currentRiddle?.words[currentWordIndex + 1];

  // Initialize game
  const initializeGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setTimeLeft(selectedTime);
    
    // Start with a random riddle
    const firstRiddleIndex = Math.floor(Math.random() * riddlesData.riddles.length);
    setCurrentRiddleIndex(firstRiddleIndex);
    setUsedRiddleIndices([firstRiddleIndex]);
    
    setCurrentWordIndex(0);
    setTypedText('');
    setPressedKey('');
    setWrongKeyCount(0);
    setCurrentRound(1); // Reset round counter to 1
    setShowRiddleModal(false);
    setShowGameOver(false);
    setShowScoreBoard(false);
    setShowSaveScore(false);
    gameStartTimeRef.current = Date.now();
  }, [selectedTime]);

  // Timer effect
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GAME_STATES.PLAYING) {
      endGame();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  useEffect(() => {
    // Load best score immediately from localStorage
    const localBestScore = localStorage.getItem('keyquest_best_score');
    if (localBestScore) {
      setPlayerHighScore(parseInt(localBestScore, 10));
    }
    
    // Load player name and sync with Supabase if available
    const savedName = localStorage.getItem('keyquest_player_name');
    if (savedName) {
      setPlayerName(savedName);
      loadPlayerHighScore(savedName);
    }
  }, []);

  // Load player high score from localStorage and Supabase
  const loadPlayerHighScore = async (name) => {
    // First load from localStorage for immediate display
    const localBestScore = localStorage.getItem('keyquest_best_score');
    if (localBestScore) {
      setPlayerHighScore(parseInt(localBestScore, 10));
    }
    
    // Then load from Supabase if name is provided
    if (name && name.trim()) {
      const supabaseBestScore = await getPlayerHighScore(name);
      const finalBestScore = Math.max(
        parseInt(localBestScore || '0', 10), 
        supabaseBestScore
      );
      setPlayerHighScore(finalBestScore);
      localStorage.setItem('keyquest_best_score', finalBestScore.toString());
    }
  };

  // Move to next word
  const moveToNextWord = useCallback((wordCompleted = true) => {
    try {
      console.log('🔄 Moving to next word. Completed:', wordCompleted, 'Current word index:', currentWordIndex);
      
      // Validate current riddle exists
      if (!currentRiddle || !currentRiddle.words) {
        console.error('❌ No current riddle or words found');
        return;
      }
      
      // Award or deduct points based on word completion
      if (wordCompleted) {
        setScore(prev => prev + GAME_CONFIG.POINTS_PER_WORD);
        console.log(`✅ Word completed! +${GAME_CONFIG.POINTS_PER_WORD} points`);
      } else {
        const penalty = GAME_CONFIG.PENALTY_PER_WRONG_WORD;
        setScore(prev => Math.max(0, prev - penalty));
        console.log(`❌ Word failed! -${penalty} points (minimum 0)`);
      }
      
      if (currentWordIndex + 1 < currentRiddle.words.length) {
        // More words in current riddle
        console.log(`📝 Moving to word ${currentWordIndex + 2} of ${currentRiddle.words.length}`);
        setCurrentWordIndex(prev => prev + 1);
        setTypedText('');
        setWrongKeyCount(0); // Reset wrong key count for new word
      } else {
        // All words completed, show riddle
        console.log('🧩 All words completed, showing riddle modal');
        setShowRiddleModal(true);
        setGameState(GAME_STATES.RIDDLE);
      }
    } catch (error) {
      console.error('❌ Error in moveToNextWord:', error);
      // Fallback: reset state to prevent freezing
      setTypedText('');
      setWrongKeyCount(0);
      setGameState(GAME_STATES.PLAYING);
    }
  }, [currentWordIndex, currentRiddle]);

  // Handle key press
  const handleKeyPress = useCallback((key) => {
    if (gameState !== GAME_STATES.PLAYING || !currentWord || !key || typeof key !== 'string') return;

    setPressedKey(key);
    
    // Clear pressed key after animation
    setTimeout(() => setPressedKey(''), 200);

    // Handle backspace
    if (key === 'BACKSPACE') {
      if (typedText.length > 0) {
        setTypedText(prev => prev.slice(0, -1));
        // Reset wrong key count when backspacing
        if (wrongKeyCount > 0) {
          setWrongKeyCount(prev => Math.max(0, prev - 1));
        }
      }
      return;
    }

    const targetChar = currentWord[typedText.length];
    if (!targetChar) {
      console.log('No target character found - word may be complete');
      return;
    }
    
    // Removed verbose logging - specific logs below handle this
    
    if (key === targetChar) {
      // Correct key - case-sensitive match
      console.log(`✅ Correct key: "${key}" Expected: "${targetChar}"`);
      playSound(800, 0.1);
      const newTypedText = typedText + key;
      setTypedText(newTypedText);

      // Check if word is complete (no animation delay)
      if (newTypedText.length === currentWord.length) {
        console.log(`✅ Word completed: "${newTypedText}" +${GAME_CONFIG.POINTS_PER_WORD} points`);
        moveToNextWord(true); // Word completed successfully - no delay
      }
    } else {
      // Wrong key - case-sensitive mismatch
      console.log(`❌ Wrong key: "${key}" Expected: "${targetChar}" -${GAME_CONFIG.POINTS_PENALTY_WRONG_KEY} points`);
      playSound(400, 0.15, 'sine');
      
      // Deduct points for wrong key
      setScore(prev => Math.max(0, prev - GAME_CONFIG.POINTS_PENALTY_WRONG_KEY));
      
      // Add the wrong character to typed text (keep it until backspace)
      const newTypedText = typedText + key;
      setTypedText(newTypedText);
      
      // Increment wrong key count for this word
      const newWrongCount = wrongKeyCount + 1;
      setWrongKeyCount(newWrongCount);
      
      // If max wrong keys reached for this word, skip to next word
      if (newWrongCount >= GAME_CONFIG.MAX_WRONG_KEYS_PER_WORD) {
        console.log(`🔄 Skipping word due to ${GAME_CONFIG.MAX_WRONG_KEYS_PER_WORD} wrong attempts`);
        setTimeout(() => {
          try {
            moveToNextWord(false); // Word failed
          } catch (error) {
            console.error('❌ Error moving to next word:', error);
            // Fallback: reset current word state
            setTypedText('');
            setWrongKeyCount(0);
          }
        }, 500);
      }
    }
  }, [gameState, currentWord, typedText, wrongKeyCount, moveToNextWord]);

  // Handle riddle answer
  const handleRiddleAnswer = useCallback((isCorrect) => {
    setShowRiddleModal(false);
    
    if (isCorrect) {
      playSound(1000, 0.5);
      setScore(prev => prev + GAME_CONFIG.POINTS_PER_RIDDLE);
      console.log(`✅ Riddle correct! +${GAME_CONFIG.POINTS_PER_RIDDLE} points`);
      
      // Move to next riddle or end game
      if (usedRiddleIndices.length < riddlesData.riddles.length) {
        // Get next random riddle
        const availableIndices = riddlesData.riddles
          .map((_, index) => index)
          .filter(index => !usedRiddleIndices.includes(index));
        
        if (availableIndices.length > 0) {
          const nextRiddleIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          setUsedRiddleIndices(prev => [...prev, nextRiddleIndex]);
          setCurrentRiddleIndex(nextRiddleIndex);
          setCurrentWordIndex(0);
          setTypedText('');
          setWrongKeyCount(0);
          setCurrentRound(prev => prev + 1); // Increment round counter
          setGameState(GAME_STATES.PLAYING);
          // Add bonus time for correct answer
          setTimeLeft(prev => Math.min(prev + 10, 60));
        } else {
          // All riddles completed
          endGame();
        }
      } else {
        // All riddles completed
        endGame();
      }
    } else {
      // Wrong riddle answer = Game Over
      console.log('❌ Wrong riddle answer - Game Over');
      playSound(150, 0.8, 'sawtooth');
      endGame();
    }
  }, [currentRiddleIndex, usedRiddleIndices]);

  // End game
  const endGame = useCallback(() => {
    setGameState(GAME_STATES.GAME_OVER);
    setShowGameOver(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Check if it's a high score and persist it
    if (score > playerHighScore) {
      setPlayerHighScore(score);
      localStorage.setItem('keyquest_best_score', score.toString());
      console.log('New best score saved to localStorage:', score);
    }
  }, [score, playerHighScore]);

  // Save score to leaderboard
  const handleSaveScore = async (name) => {
    // Validate input
    const validation = validatePlayerName(name);
    if (!validation.isValid) {
      alert(`Invalid name: ${validation.error}`);
      return;
    }

    // Rate limiting check
    if (!checkRateLimit('save_score_ui', 3, 60000)) {
      alert('Please wait before saving another score.');
      return;
    }

    console.log('Attempting to save score:', { name: validation.sanitized, score });
    const result = await saveScore(validation.sanitized, score);
    
    if (result.success) {
      const sanitizedName = validation.sanitized;
      localStorage.setItem('keyquest_player_name', sanitizedName);
      setPlayerName(sanitizedName);
      await loadPlayerHighScore(sanitizedName);
      setShowSaveScore(false);
      setShowGameOver(false);
      setGameState(GAME_STATES.MENU);
      alert('Score saved successfully!');
    } else {
      console.error('Save failed:', result.error);
      alert(`Failed to save score: ${result.error}`);
    }
  };

  // Save Score Modal Component
  const SaveScoreModal = () => {
    const [inputName, setInputName] = useState(playerName);

    return (
      <AnimatePresence>
        {showSaveScore && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-primary mb-4">{TEXTS.SAVE_SCORE_TITLE}</h2>
                <p className="text-gray-600 mb-6">Enter your name to save your score of {score} points!</p>
                
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={TEXTS.ENTER_NAME_PLACEHOLDER}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-primary focus:outline-none"
                  maxLength={GAME_CONFIG.MAX_PLAYER_NAME_LENGTH}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputName.trim()) {
                      handleSaveScore(inputName);
                    }
                  }}
                />
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleSaveScore(inputName)}
                    disabled={!inputName.trim()}
                    className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {TEXTS.SAVE_BUTTON}
                  </button>
                  <button
                    onClick={() => {
                      console.log('Skip button clicked - returning to landing page');
                      setShowSaveScore(false);
                      setShowGameOver(false);
                      setGameState(GAME_STATES.MENU);
                    }}
                    className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                  >
                    {TEXTS.SKIP_BUTTON}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Game Over Modal Component
  const GameOverModal = () => (
    <AnimatePresence>
      {showGameOver && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                🎮
              </motion.div>
              <h2 className="text-3xl font-bold text-primary mb-4">{TEXTS.GAME_OVER_TITLE}</h2>
              <div className="bg-accent/20 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-primary mb-2">{score}</div>
                <div className="text-gray-600">{TEXTS.FINAL_SCORE_LABEL}</div>
                {score > playerHighScore && (
                  <motion.div
                    className="text-green-600 font-semibold mt-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {TEXTS.NEW_HIGH_SCORE}
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    console.log('Save Score button clicked - closing game over modal and opening save modal');
                    setShowGameOver(false);
                    setTimeout(() => {
                      setShowSaveScore(true);
                    }, 100); // Small delay to ensure game over modal closes first
                  }}
                  className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors"
                >
                  {TEXTS.SAVE_SCORE_BUTTON}
                </button>
                <button
                  onClick={() => {
                    setShowGameOver(false);
                    setGameState(GAME_STATES.MENU);
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  {TEXTS.PLAY_AGAIN_BUTTON}
                </button>
                <button
                  onClick={() => {
                    setShowGameOver(false);
                    setGameState(GAME_STATES.MENU);
                  }}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  {TEXTS.BACK_TO_MENU_BUTTON}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex flex-col">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4 sm:gap-0">
        {/* Score */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 shadow-lg w-full sm:min-w-[200px] sm:w-auto text-center order-1 sm:order-1">
          <div className="text-xs sm:text-sm text-gray-600">{TEXTS.SCORE_LABEL}</div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{score}</div>
        </div>

        {/* Title */}
        <div className="text-center order-2 sm:order-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 leading-tight">
            {TEXTS.APP_TITLE}
          </h1>
        </div>

        {/* Timer & Navigation */}
        <div className="text-center order-3 sm:order-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 shadow-lg w-full sm:min-w-[200px] sm:w-auto text-center mb-2">
            <div className="text-xs sm:text-sm text-gray-600">{TEXTS.TIME_LABEL}</div>
            <div className={`text-xl sm:text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-primary'}`}>
              {timeLeft}{TEXTS.SECONDS_UNIT}
            </div>
          </div>
          {gameState === GAME_STATES.MENU && (
            <button
              onClick={() => setShowScoreBoard(true)}
              className="bg-secondary text-white rounded-lg hover:bg-primary transition-colors text-xs sm:text-sm font-medium px-4 py-2 w-full sm:w-auto"
              style={{ minHeight: '36px', maxWidth: '180px' }}
            >
              {TEXTS.TOP_SCOREBOARD_BUTTON}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 pb-32 sm:pb-32">
        {/* Menu State */}
        {gameState === GAME_STATES.MENU && (
          <motion.div
            className="text-center max-w-2xl w-full flex flex-col justify-center min-h-[60vh] sm:min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl sm:text-8xl mb-6 sm:mb-8"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ⌨️
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              {TEXTS.WELCOME_HEADING}
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-4">
              {TEXTS.WELCOME_SUBTITLE}
            </p>
            
            {/* Time Selection */}
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-700 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Select Game Duration:</p>
              <div className="flex justify-center space-x-2 sm:space-x-4">
                {[30, 45, 60].map((time) => (
                  <motion.button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      console.log(`Selected time: ${time}s`);
                    }}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all duration-300 text-sm sm:text-base ${
                      selectedTime === time
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    whileHover={{ scale: selectedTime === time ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time}s
                  </motion.button>
                ))}
              </div>
            </div>
            
            <motion.button
              onClick={initializeGame}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 w-full max-w-xs sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {TEXTS.START_GAME_BUTTON}
            </motion.button>
          </motion.div>
        )}

        {/* Playing State */}
        {gameState === GAME_STATES.PLAYING && (
          <div className="w-full max-w-4xl">
            <WordDisplay
              currentWord={currentWord}
              typedText={typedText}
              isComplete={typedText === currentWord}
              showNextWord={true}
              nextWord={nextWord}
            />
            <div className="mt-8">
              <Keyboard
                onKeyPress={handleKeyPress}
                pressedKey={pressedKey}
                disabled={gameState !== GAME_STATES.PLAYING}
              />
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">
                Round {currentRound} of {riddlesData.riddles.length} • 
                Word {currentWordIndex + 1} of {currentRiddle?.words.length}
              </div>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(((currentRound - 1) * 4 + currentWordIndex) / (riddlesData.riddles.length * 4)) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-center p-2 sm:p-6 text-sm bg-gradient-to-br from-background via-accent/20 to-background gap-2 sm:gap-0 border-t border-gray-200/50">
        {/* High Score */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 w-full sm:min-w-[200px] sm:w-auto shadow-lg text-center">
          <div className="text-xs sm:text-sm text-gray-600">{TEXTS.YOUR_BEST_LABEL}</div>
          <div className="text-lg sm:text-xl font-bold text-primary">{playerHighScore}</div>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/muhit-1/KeyQuest" // Replace with actual GitHub URL
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1 sm:py-2 w-full sm:min-w-[200px] sm:w-auto shadow-lg hover:bg-white/80 hover:shadow-xl transition-all duration-300 hover:scale-105 group gap-2 sm:gap-3"
        >
          <img 
            src={developerImage} 
            alt="Developer" 
            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
          />
          <div className="text-center">
            <div className="font-medium text-gray-700 group-hover:text-primary transition-colors text-xs sm:text-sm">
              {TEXTS.FOOTER_VERSION}
            </div>
            <div className="text-xs text-gray-600 group-hover:text-secondary transition-colors">
              {TEXTS.GITHUB_BUTTON}
            </div>
          </div>
        </a>
      </footer>

      {/* Modals */}
      <RiddleModal
        isOpen={showRiddleModal}
        riddle={currentRiddle}
        onAnswer={handleRiddleAnswer}
        onClose={() => {}}
        timeLeft={timeLeft}
      />

      <ScoreBoardModal
        isOpen={showScoreBoard}
        onClose={() => setShowScoreBoard(false)}
        showSaveScore={showGameOver}
        currentScore={score}
        onScoreSaved={(name, savedScore) => {
          setPlayerName(name);
          setShowScoreBoard(false);
          setGameState(GAME_STATES.MENU);
        }}
      />

      <GameOverModal />
      <SaveScoreModal />
    </div>
  );
};

export default App;
