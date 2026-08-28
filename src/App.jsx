import React, { useState, useEffect, useCallback, useRef } from 'react';
import Keyboard from './components/Keyboard';
import WordDisplay from './components/WordDisplay';
import RiddleModal from './components/RiddleModal';
import ScoreBoardModal from './components/ScoreBoardModal';
import SaveScoreModal from './components/SaveScoreModal';
import OverScreen from './components/OverScreen';
import { getBestScore, getPlayerName, saveScore, setBestScore } from './utils/leaderboard';
import { validatePlayerName } from './utils/security';
import riddlesData from './data/riddles.json';
import { TEXTS, GAME_CONFIG } from './constants/texts';
import logo from './assets/keyquest-logo.png';

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  RIDDLE: 'riddle',
  GAME_OVER: 'game_over'
};

const END_REASONS = {
  TIME: 'time',
  WRONG: 'wrong',
  CLEARED: 'cleared'
};

const ERROR_FLASH_MS = 350;
const TYPE_SPEED_MS = 58;

/* ─── sound ─────────────────────────────────────────────── */
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
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked;
};

/** Keeps a chosen duration inside the allowed range. */
const clampDuration = (seconds) => {
  const value = Number.parseInt(seconds, 10);
  if (!Number.isFinite(value)) return GAME_CONFIG.INITIAL_TIME;
  return Math.min(Math.max(value, GAME_CONFIG.MIN_CUSTOM_TIME), GAME_CONFIG.MAX_CUSTOM_TIME);
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ─── hero that types itself ────────────────────────────── */
const Hero = () => {
  const [line1, setLine1] = useState(prefersReducedMotion() ? TEXTS.HERO_LINE_1 : '');
  const [line2, setLine2] = useState(prefersReducedMotion() ? TEXTS.HERO_LINE_2 : '');

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const t1 = TEXTS.HERO_LINE_1;
    const t2 = TEXTS.HERO_LINE_2;
    let i = 0;
    let timer = null;

    const step = () => {
      if (i < t1.length) {
        i += 1;
        setLine1(t1.slice(0, i));
        timer = setTimeout(step, TYPE_SPEED_MS);
      } else if (i < t1.length + t2.length) {
        i += 1;
        setLine2(t2.slice(0, i - t1.length));
        timer = setTimeout(step, TYPE_SPEED_MS);
      }
    };

    timer = setTimeout(step, 420);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className="hero">
      <span>{line1}</span>
      <span className="lit">
        {line2}
        <i className="caret" />
      </span>
    </h1>
  );
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
  const [endReason, setEndReason] = useState(END_REASONS.TIME);
  const [wordsCleared, setWordsCleared] = useState(0);

  // Typing state
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [usedRiddleIndices, setUsedRiddleIndices] = useState([]);
  const [roundWords, setRoundWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [hasError, setHasError] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Modals
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);

  // Refs
  const scoreRef = useRef(0);
  const wordsRef = useRef(0);
  const errorTimeoutRef = useRef(null);

  const currentRiddle = riddlesData.riddles[currentRiddleIndex];
  const currentWord = roundWords[currentWordIndex] || '';
  const nextWord = roundWords[currentWordIndex + 1] || '';
  const isMenu = gameState === GAME_STATES.MENU;
  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isRiddle = gameState === GAME_STATES.RIDDLE;
  const isOver = gameState === GAME_STATES.GAME_OVER;
  const inRun = isPlaying || isRiddle;

  // Keep refs in sync so callbacks can stay stable
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { wordsRef.current = wordsCleared; }, [wordsCleared]);

  useEffect(() => {
    setPlayerHighScore(getBestScore());
    setPlayerName(getPlayerName());
  }, []);

  useEffect(() => () => clearTimeout(errorTimeoutRef.current), []);

  const startRound = useCallback((riddleIndex) => {
    setCurrentRiddleIndex(riddleIndex);
    setRoundWords(pickRoundWords(riddlesData.riddles[riddleIndex]?.words));
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
    setWordsCleared(0);
    wordsRef.current = 0;
    setTimeLeft(duration);
    setUsedRiddleIndices([firstRiddleIndex]);
    setCurrentRound(1);
    setIsNewBest(false);
    setShowScoreBoard(false);
    setShowSaveScore(false);
    startRound(firstRiddleIndex);
    setGameState(GAME_STATES.PLAYING);
  }, [selectedTime, startRound]);

  const goToMenu = useCallback(() => {
    setShowSaveScore(false);
    setTimeLeft(clampDuration(selectedTime));
    setGameState(GAME_STATES.MENU);
  }, [selectedTime]);

  // Stable identity - reads the live score from refs
  const endGame = useCallback((reason = END_REASONS.TIME) => {
    const finalScore = scoreRef.current;
    const storedBest = getBestScore();

    if (finalScore > storedBest) {
      setIsNewBest(true);
      setBestScore(finalScore);
      setPlayerHighScore(finalScore);
    } else {
      setIsNewBest(false);
    }

    setEndReason(reason);
    setGameState(GAME_STATES.GAME_OVER);
  }, []);

  // Countdown - one interval per playing session
  useEffect(() => {
    if (!isPlaying) return undefined;
    const intervalId = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && timeLeft === 0) endGame(END_REASONS.TIME);
  }, [isPlaying, timeLeft, endGame]);

  const moveToNextWord = useCallback(() => {
    setScore((prev) => prev + GAME_CONFIG.POINTS_PER_WORD);
    setWordsCleared((prev) => prev + 1);

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

  /**
   * Handles one keypress.
   * @returns {boolean} true when the key matched (the deck uses this to flash).
   */
  const handleKeyPress = useCallback((key) => {
    if (!isPlaying || !currentWord || typeof key !== 'string') return true;

    if (key === 'BACKSPACE') {
      setTypedText((prev) => prev.slice(0, -1));
      setHasError(false);
      return true;
    }

    const targetChar = currentWord[typedText.length];
    if (!targetChar) return true;

    // Case-insensitive: the on-screen deck has no Shift key
    if (key.toLowerCase() === targetChar.toLowerCase()) {
      playSound(800, 0.1);
      clearTimeout(errorTimeoutRef.current);
      setHasError(false);

      const newTypedText = typedText + targetChar;
      setTypedText(newTypedText);
      if (newTypedText === currentWord) moveToNextWord();
      return true;
    }

    // Wrong key: flash the slot red, take the penalty, do NOT advance
    playSound(400, 0.15);
    setScore((prev) => Math.max(0, prev - GAME_CONFIG.POINTS_PENALTY_WRONG_KEY));
    setHasError(true);
    clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setHasError(false), ERROR_FLASH_MS);
    return false;
  }, [isPlaying, currentWord, typedText, moveToNextWord]);

  const handleRiddleAnswer = useCallback((isCorrect) => {
    if (!isCorrect) {
      playSound(150, 0.8, 'sawtooth');
      endGame(END_REASONS.WRONG);
      return;
    }

    playSound(1000, 0.5);
    setScore((prev) => prev + GAME_CONFIG.POINTS_PER_RIDDLE);

    const availableIndices = riddlesData.riddles
      .map((_, index) => index)
      .filter((index) => !usedRiddleIndices.includes(index));

    if (availableIndices.length === 0) {
      endGame(END_REASONS.CLEARED);
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

  const handleSaveScore = (name) => {
    const validation = validatePlayerName(name);
    if (!validation.isValid) return { success: false, error: validation.error };

    const result = saveScore(validation.sanitized, score);
    if (!result.success) return result;

    setPlayerName(validation.sanitized);
    setShowSaveScore(false);
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

  const displayedTime = isMenu ? clampDuration(selectedTime) : timeLeft;
  const clockLow = inRun && timeLeft <= 10;
  const hintKey = isPlaying ? (currentWord[typedText.length] || '') : '';
  const wordProgress = currentWord.length ? (typedText.length / currentWord.length) * 100 : 0;
  const overHeadline =
    endReason === END_REASONS.WRONG ? TEXTS.OVER_WRONG_ANSWER
      : endReason === END_REASONS.CLEARED ? TEXTS.OVER_ALL_CLEAR
        : TEXTS.OVER_TIME_UP;

  return (
    <div className="shell">
      {/* top rail */}
      <header className="rail">
        <div className="stats">
          <div className="stat">
            <span className="stat__k">{TEXTS.SCORE_LABEL}</span>
            <span className="stat__v">{score.toLocaleString()}</span>
          </div>
          <div className="stat__div" />
          <div className="stat stat--muted">
            <span className="stat__k">{TEXTS.BEST_LABEL}</span>
            <span className="stat__v">{playerHighScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="mark">
          <img className="mark__logo" src={logo} alt="" />
          <span className="mark__text">{TEXTS.MARK_A}<em>{TEXTS.MARK_B}</em></span>
        </div>

        <div className="railR">
          <div className={`clock${clockLow ? ' clock--low' : ''}`}>
            <span className="clock__k">{TEXTS.TIME_LABEL}</span>
            <span className="clock__v">{displayedTime}s</span>
          </div>
          <div className="stat__div" />
          <div className="acts">
            {!inRun && (
              <button type="button" className="btn btn--ghost" onClick={() => setShowScoreBoard(true)}>
                {TEXTS.SCORES_BUTTON}
              </button>
            )}
            {inRun && (
              <>
                <button type="button" className="btn" onClick={initializeGame}>
                  {TEXTS.RESTART_BUTTON}
                </button>
                <button type="button" className="btn" onClick={goToMenu}>
                  {TEXTS.QUIT_BUTTON}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* start */}
      {isMenu && (
        <main className="stage">
          <div className="rise">
            <p className="eyebrow">{TEXTS.EYEBROW}</p>
            <Hero />
            <p className="lede">{TEXTS.LEDE}</p>

            <div className="setup">
              <span className="setup__k">{TEXTS.RUN_LENGTH_LABEL}</span>
              <div className="segs" role="group" aria-label={TEXTS.RUN_LENGTH_LABEL}>
                {GAME_CONFIG.TIME_PRESETS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className="seg"
                    aria-pressed={selectedTime === time && !customTime}
                    onClick={() => handlePresetTime(time)}
                  >
                    {time}s
                  </button>
                ))}
              </div>

              <label className="custom" htmlFor="customSec">
                {TEXTS.CUSTOM_TIME_LABEL}
                <input
                  id="customSec"
                  type="number"
                  inputMode="numeric"
                  min={GAME_CONFIG.MIN_CUSTOM_TIME}
                  max={GAME_CONFIG.MAX_CUSTOM_TIME}
                  value={customTime}
                  onChange={handleCustomTime}
                  placeholder={TEXTS.CUSTOM_TIME_PLACEHOLDER}
                  aria-label="Custom run length in seconds"
                />
                {TEXTS.SECONDS_LABEL}
              </label>
              <span className="hint">
                {GAME_CONFIG.MIN_CUSTOM_TIME}–{GAME_CONFIG.MAX_CUSTOM_TIME} {TEXTS.SECONDS_LABEL}
              </span>

              <button type="button" className="start" onClick={initializeGame}>
                {TEXTS.START_GAME_BUTTON}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* play */}
      {inRun && (
        <main className="stage">
          <WordDisplay
            currentWord={currentWord}
            typedText={typedText}
            hasError={hasError}
            nextWord={nextWord}
          />

          <Keyboard onKeyPress={handleKeyPress} disabled={!isPlaying} hintKey={hintKey} />

          <div className="run">
            <div className="rail-line">
              <i style={{ width: `${wordProgress}%` }} />
            </div>
            <span className="run__k">
              {TEXTS.ROUND_LABEL} <b>{currentRound}</b> of {riddlesData.riddles.length}
              &nbsp;·&nbsp; {TEXTS.WORD_LABEL} <b>{Math.min(currentWordIndex + 1, roundWords.length)}</b> of {roundWords.length}
            </span>
            <div className="pips">
              {roundWords.map((word, index) => (
                <span className={`pip${index <= currentWordIndex ? ' on' : ''}`} key={`${word}-${index}`} />
              ))}
            </div>
          </div>
        </main>
      )}

      {/* end */}
      {isOver && (
        <OverScreen
          score={score}
          wordsCleared={wordsCleared}
          headline={overHeadline}
          isNewBest={isNewBest}
          onSave={() => setShowSaveScore(true)}
          onPlayAgain={initializeGame}
          onMenu={goToMenu}
        />
      )}

      <p className="foot">
        {TEXTS.FOOT_PREFIX} <b>{TEXTS.FOOT_AUTHOR}</b>
      </p>

      {/* overlays */}
      <RiddleModal
        isOpen={isRiddle}
        riddle={currentRiddle}
        onAnswer={handleRiddleAnswer}
        timeLeft={timeLeft}
      />

      <ScoreBoardModal isOpen={showScoreBoard} onClose={() => setShowScoreBoard(false)} />

      <SaveScoreModal
        isOpen={showSaveScore}
        score={score}
        defaultName={playerName}
        onSave={handleSaveScore}
        onSkip={() => setShowSaveScore(false)}
      />
    </div>
  );
};

export default App;
