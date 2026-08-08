/**
 * Local leaderboard for KeyQuest.
 *
 * The game has no backend - every score lives in this browser's localStorage.
 * All functions are synchronous and never throw: if storage is unavailable
 * (private mode, quota, corrupted JSON) they fall back to sensible defaults.
 */

import { validatePlayerName } from './security';
import { GAME_CONFIG } from '../constants/texts';

const LEADERBOARD_KEY = 'keyquest_leaderboard';
const PLAYER_NAME_KEY = 'keyquest_player_name';
const BEST_SCORE_KEY = 'keyquest_best_score';

// Keep the stored list bounded so localStorage never grows without limit
const MAX_STORED_ENTRIES = 100;
const MAX_SCORE = 100000;

const isValidEntry = (entry) =>
  entry &&
  typeof entry === 'object' &&
  typeof entry.name === 'string' &&
  typeof entry.score === 'number' &&
  Number.isFinite(entry.score);

const byScoreThenTime = (a, b) => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  // Older entries win ties
  return new Date(a.time).getTime() - new Date(b.time).getTime();
};

const readEntries = () => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch (error) {
    console.warn('Could not read the local leaderboard:', error);
    return [];
  }
};

const writeEntries = (entries) => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.warn('Could not write the local leaderboard:', error);
    return false;
  }
};

/**
 * Saves a score to the local leaderboard.
 * @param {string} name - Player name (validated and sanitized)
 * @param {number} score - Final score
 * @returns {object} - { success, data } or { success: false, error }
 */
export const saveScore = (name, score) => {
  const nameValidation = validatePlayerName(name);
  if (!nameValidation.isValid) {
    return { success: false, error: nameValidation.error };
  }

  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return { success: false, error: 'Invalid score value' };
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: nameValidation.sanitized,
    score,
    time: new Date().toISOString()
  };

  const entries = [...readEntries(), entry]
    .sort(byScoreThenTime)
    .slice(0, MAX_STORED_ENTRIES);

  if (!writeEntries(entries)) {
    return { success: false, error: 'Could not save your score on this device.' };
  }

  setPlayerName(entry.name);
  return { success: true, data: entry };
};

/**
 * Returns the highest scores, best first.
 * @param {number} limit - Maximum number of entries
 * @returns {object} - { success, data }
 */
export const getTopScores = (limit = GAME_CONFIG.LEADERBOARD_LIMIT) => {
  const entries = readEntries().sort(byScoreThenTime).slice(0, limit);
  return { success: true, data: entries };
};

/**
 * Returns the best score stored for a given player name.
 * @param {string} name - Player name
 * @returns {number} - Best score, or 0 when the player has none
 */
export const getPlayerHighScore = (name) => {
  const nameValidation = validatePlayerName(name);
  if (!nameValidation.isValid) {
    return 0;
  }

  return readEntries()
    .filter((entry) => entry.name === nameValidation.sanitized)
    .reduce((best, entry) => Math.max(best, entry.score), 0);
};

/**
 * Personal best across every session on this device.
 * @returns {number}
 */
export const getBestScore = () => {
  try {
    const stored = parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10);
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Stores a new personal best.
 * @param {number} score
 */
export const setBestScore = (score) => {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch (error) {
    console.warn('Could not store the best score:', error);
  }
};

/**
 * The last name the player saved a score under.
 * @returns {string}
 */
export const getPlayerName = () => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || '';
  } catch (error) {
    return '';
  }
};

/**
 * Remembers the player name for the next save.
 * @param {string} name
 */
export const setPlayerName = (name) => {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch (error) {
    console.warn('Could not store the player name:', error);
  }
};
