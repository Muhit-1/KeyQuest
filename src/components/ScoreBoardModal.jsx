import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Crown, Medal, RefreshCw, Target, Trophy, X } from 'lucide-react';
import { getTopScores } from '../utils/leaderboard';
import { TEXTS, GAME_CONFIG } from '../constants/texts';

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-600" aria-hidden="true" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-500" aria-hidden="true" />;
  if (rank === 3) return <Award className="h-6 w-6 text-orange-600" aria-hidden="true" />;
  return <span className="text-lg font-bold text-primary">#{rank}</span>;
};

const getRankColor = (rank) => {
  switch (rank) {
    case 1: return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 2: return 'text-gray-700 bg-gray-50 border-gray-200';
    case 3: return 'text-orange-700 bg-orange-50 border-orange-200';
    default: return 'text-primary bg-primary/5 border-primary/10';
  }
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
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

const ScoreBoardModal = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState([]);

  const fetchScores = useCallback(() => {
    const result = getTopScores(GAME_CONFIG.LEADERBOARD_LIMIT);
    setScores(result.data);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen, fetchScores]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-9 w-9" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">{TEXTS.LEADERBOARD_TITLE}</h2>
                  <p className="text-white/80">{TEXTS.LEADERBOARD_SUBTITLE}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close leaderboard"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {scores.length === 0 && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {TEXTS.NO_SCORES_TITLE}
                </h3>
                <p className="text-gray-600">{TEXTS.NO_SCORES_MESSAGE}</p>
              </div>
            )}

            {scores.length > 0 && (
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-gray-700 text-sm">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-3">Score</div>
                  <div className="col-span-3">Date</div>
                </div>

                {/* Score Rows */}
                {scores.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <motion.div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getRankColor(rank)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="col-span-2 flex items-center">
                        <RankIcon rank={rank} />
                      </div>

                      <div className="col-span-4 flex items-center">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {entry.name || TEXTS.ANONYMOUS}
                          </div>
                          {rank <= 3 && (
                            <div className="text-xs text-gray-500">
                              {rank === 1 ? TEXTS.CHAMPION : rank === 2 ? TEXTS.RUNNER_UP : TEXTS.THIRD_PLACE}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center">
                        <div className="text-xl font-bold text-primary">
                          {entry.score}
                          <span className="text-sm text-gray-500 ml-1">{TEXTS.POINTS_UNIT}</span>
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center">
                        <div className="text-sm text-gray-600">{formatDate(entry.time)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">{TEXTS.LEADERBOARD_LOCAL_NOTE}</p>
              <button
                type="button"
                onClick={fetchScores}
                className="mt-3 inline-flex items-center gap-2 text-primary hover:text-secondary text-sm font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {TEXTS.REFRESH_SCORES_BUTTON}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScoreBoardModal;
