import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { TEXTS, GAME_CONFIG } from '../constants/texts';

const SaveScoreModal = ({ isOpen, score, defaultName = '', onSave, onSkip }) => {
  const [inputName, setInputName] = useState(defaultName);
  const [error, setError] = useState(null);

  // Reset the field each time the modal opens, not on every parent render
  useEffect(() => {
    if (isOpen) {
      setInputName(defaultName);
      setError(null);
    }
  }, [isOpen, defaultName]);

  const handleSave = () => {
    const result = onSave(inputName);
    if (result && !result.success) {
      setError(result.error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center modal-backdrop p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="h-12 w-12 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">{TEXTS.SAVE_SCORE_TITLE}</h2>
              <p className="text-gray-600 mb-6">
                Enter your name to save your score of {score} points!
              </p>

              <input
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setError(null);
                }}
                placeholder={TEXTS.ENTER_NAME_PLACEHOLDER}
                className="w-full p-3 border-2 border-gray-300 rounded-xl mb-2 focus:border-primary focus:outline-none"
                maxLength={GAME_CONFIG.MAX_PLAYER_NAME_LENGTH}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputName.trim()) {
                    handleSave();
                  }
                }}
              />

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</div>
              )}

              <div className="space-y-3 mt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!inputName.trim()}
                  className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {TEXTS.SAVE_BUTTON}
                </button>
                <button
                  type="button"
                  onClick={onSkip}
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

export default SaveScoreModal;
