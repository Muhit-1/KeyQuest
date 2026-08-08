import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Star } from 'lucide-react';
import { TEXTS } from '../constants/texts';

const GameOverModal = ({ isOpen, score, isNewBest, onSave, onPlayAgain, onBackToMenu }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4"
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
              <Gamepad2 className="h-14 w-14 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">{TEXTS.GAME_OVER_TITLE}</h2>

            <div className="bg-accent/20 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{score}</div>
              <div className="text-gray-600">{TEXTS.FINAL_SCORE_LABEL}</div>
              {isNewBest && (
                <motion.div
                  className="flex items-center justify-center gap-2 text-green-600 font-semibold mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  {TEXTS.NEW_HIGH_SCORE}
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onSave}
                className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors"
              >
                {TEXTS.SAVE_SCORE_BUTTON}
              </button>
              <button
                type="button"
                onClick={onPlayAgain}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                {TEXTS.PLAY_AGAIN_BUTTON}
              </button>
              <button
                type="button"
                onClick={onBackToMenu}
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

export default GameOverModal;
