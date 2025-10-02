import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTopScores, saveScore } from '../utils/supabaseClient';

const ScoreBoardModal = ({ isOpen, onClose, showSaveScore = false, currentScore = 0, onScoreSaved }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(showSaveScore);

  useEffect(() => {
    if (isOpen) {
      fetchScores();
      setShowSaveForm(showSaveScore);
      // Load saved player name
      const savedName = localStorage.getItem('keyquest_player_name');
      if (savedName) {
        setPlayerName(savedName);
      }
    }
  }, [isOpen, showSaveScore]);

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getTopScores(10);
      if (result.success) {
        setScores(result.data);
      } else {
        setError(result.error || 'Failed to fetch scores');
      }
    } catch (err) {
      setError('Failed to connect to leaderboard');
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      setSaveError('Please enter your name');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const result = await saveScore(playerName.trim(), currentScore);
      if (result.success) {
        localStorage.setItem('keyquest_player_name', playerName.trim());
        setShowSaveForm(false);
        await fetchScores(); // Refresh the leaderboard
        if (onScoreSaved) {
          onScoreSaved(playerName.trim(), currentScore);
        }
      } else {
        setSaveError(result.error || 'Failed to save score');
      }
    } catch (error) {
      setSaveError('Failed to save score. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-primary bg-primary/5';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Top Score Board</h2>
                  <p className="text-white/80">Hall of Fame - Best Players</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Save Score Form */}
            {showSaveForm && (
              <motion.div
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-primary mb-2">Save Your Score!</h3>
                  <p className="text-gray-600">You scored <span className="font-bold text-primary">{currentScore}</span> points!</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                      maxLength={20}
                      disabled={saving}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && playerName.trim() && !saving) {
                          handleSaveScore();
                        }
                      }}
                    />
                  </div>
                  
                  {saveError && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                      {saveError}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveScore}
                      disabled={!playerName.trim() || saving}
                      className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Saving...
                        </>
                      ) : (
                        'Save Score'
                      )}
                    </button>
                    <button
                      onClick={() => setShowSaveForm(false)}
                      disabled={saving}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="ml-3 text-gray-600">Loading leaderboard...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchScores}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && scores.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No scores yet!
                </h3>
                <p className="text-gray-600">
                  Be the first to make it to the leaderboard!
                </p>
              </div>
            )}

            {!loading && !error && scores.length > 0 && (
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-gray-700 text-sm">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-3">Score</div>
                  <div className="col-span-3">Date</div>
                </div>

                {/* Score Rows */}
                {scores.map((score, index) => {
                  const rank = index + 1;
                  return (
                    <motion.div
                      key={score.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getRankColor(rank)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Rank */}
                      <div className="col-span-2 flex items-center">
                        <span className="text-2xl font-bold">
                          {getRankIcon(rank)}
                        </span>
                      </div>

                      {/* Player Name */}
                      <div className="col-span-4 flex items-center">
                        <div>
                          <div className="font-semibold text-gray-800 truncate">
                            {score.name || 'Anonymous'}
                          </div>
                          {rank <= 3 && (
                            <div className="text-xs text-gray-500">
                              {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Third Place'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-3 flex items-center">
                        <div className="text-xl font-bold text-primary">
                          {score.score}
                          <span className="text-sm text-gray-500 ml-1">pts</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-3 flex items-center">
                        <div className="text-sm text-gray-600">
                          {formatDate(score.time)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Compete with players worldwide and climb the leaderboard!
              </p>
              <button
                onClick={fetchScores}
                className="mt-3 text-primary hover:text-secondary text-sm font-medium transition-colors"
              >
                🔄 Refresh Scores
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScoreBoardModal;
