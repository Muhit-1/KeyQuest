import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Puzzle, Timer, X } from 'lucide-react';
import { TEXTS, GAME_CONFIG } from '../constants/texts';

const RESULT_DELAY_MS = 2000;

const RiddleModal = ({ isOpen, riddle, onAnswer, timeLeft = 30 }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const resultTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  }, [isOpen, riddle]);

  // Never let a pending "next round" timer fire after the modal is gone
  useEffect(() => () => clearTimeout(resultTimeoutRef.current), []);

  const handleAnswerSelect = useCallback((answerIndex) => {
    if (showResult || !riddle) return;

    const correct = answerIndex === riddle.correctAnswer;
    setSelectedAnswer(answerIndex);
    setIsCorrect(correct);
    setShowResult(true);

    clearTimeout(resultTimeoutRef.current);
    resultTimeoutRef.current = setTimeout(() => onAnswer(correct), RESULT_DELAY_MS);
  }, [showResult, riddle, onAnswer]);

  useEffect(() => {
    if (!isOpen || showResult || !riddle) return undefined;

    const handleKeyDown = (event) => {
      if (event.key >= '1' && event.key <= '9') {
        const answerIndex = parseInt(event.key, 10) - 1;
        if (answerIndex < riddle.options.length) {
          handleAnswerSelect(answerIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showResult, riddle, handleAnswerSelect]);

  if (!isOpen || !riddle) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Puzzle className="h-12 w-12 text-secondary" aria-hidden="true" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
              {TEXTS.RIDDLE_TITLE}
            </h2>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              {riddle.question}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {riddle.options.map((option, index) => {
              let buttonClass = `
                flex items-center p-4 rounded-xl border-2 transition-all duration-300 text-left
                focus:outline-none focus:ring-2 focus:ring-accent
              `;

              if (showResult) {
                if (index === riddle.correctAnswer) {
                  buttonClass += ' bg-green-100 border-green-500 text-green-800';
                } else if (index === selectedAnswer) {
                  buttonClass += ' bg-red-100 border-red-500 text-red-800';
                } else {
                  buttonClass += ' bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed';
                }
              } else if (selectedAnswer === index) {
                buttonClass += ' bg-secondary/20 border-secondary text-primary cursor-pointer';
              } else {
                buttonClass += ' bg-white border-gray-300 text-gray-700 hover:border-primary hover:shadow-lg cursor-pointer';
              }

              return (
                <motion.button
                  key={option}
                  type="button"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <span className="bg-primary text-white w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium">{option}</span>
                  {showResult && index === riddle.correctAnswer && (
                    <Check className="ml-auto h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                  )}
                  {showResult && index === selectedAnswer && index !== riddle.correctAnswer && (
                    <X className="ml-auto h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Result Message */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? TEXTS.RIDDLE_CORRECT : TEXTS.RIDDLE_WRONG}
                </div>
                <p className="text-gray-600 mb-4">
                  {isCorrect
                    ? `Great job! You earned ${GAME_CONFIG.POINTS_PER_RIDDLE} points!`
                    : `The correct answer was: ${riddle.options[riddle.correctAnswer]}`}
                </p>
                {isCorrect && (
                  <div className="text-sm text-gray-500">{TEXTS.RIDDLE_NEXT_ROUND}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
              <Timer className="h-4 w-4" aria-hidden="true" />
              {timeLeft}
              {TEXTS.SECONDS_UNIT}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RiddleModal;
