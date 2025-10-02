import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RiddleModal = ({ 
  isOpen, 
  riddle, 
  onAnswer, 
  onClose,
  timeLeft = 30 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  }, [isOpen, riddle]);

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === riddle.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Auto-close after showing result
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  const handleKeyPress = (event) => {
    if (!isOpen || showResult) return;
    
    const key = event.key;
    if (key >= '1' && key <= '4') {
      const answerIndex = parseInt(key) - 1;
      if (answerIndex < riddle.options.length) {
        handleAnswerSelect(answerIndex);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, showResult, riddle]);

  if (!isOpen || !riddle) return null;

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
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🧩
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              Riddle Time!
            </h2>
            <p className="text-gray-600">
             
            </p>
          </div>


          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
              {riddle.question}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {riddle.options.map((option, index) => {
              let buttonClass = `
                p-4 rounded-xl border-2 transition-all duration-300 text-left
                hover:shadow-lg transform hover:scale-105 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-accent
              `;

              if (showResult) {
                if (index === riddle.correctAnswer) {
                  buttonClass += ' bg-green-100 border-green-500 text-green-800';
                } else if (index === selectedAnswer && index !== riddle.correctAnswer) {
                  buttonClass += ' bg-red-100 border-red-500 text-red-800';
                } else {
                  buttonClass += ' bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed';
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += ' bg-secondary/20 border-secondary text-primary';
                } else {
                  buttonClass += ' bg-white border-gray-300 text-gray-700 hover:border-primary';
                }
              }

              return (
                <motion.button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                  {showResult && index === riddle.correctAnswer && (
                    <motion.span
                      className="ml-auto text-green-600 text-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {showResult && index === selectedAnswer && index !== riddle.correctAnswer && (
                    <motion.span
                      className="ml-auto text-red-600 text-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ✗
                    </motion.span>
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
                  {isCorrect ? 'Correct!' : '❌ Wrong Answer!'}
                </div>
                <p className="text-gray-600 mb-4">
                  {isCorrect 
                    ? `Great job! You earned 10 points!` 
                    : `The correct answer was: ${riddle.options[riddle.correctAnswer]}`
                  }
                </p>
                <div className="text-sm text-gray-500">
                  Moving to next round in 2 seconds...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer */}
          <div className="absolute top-4 right-4">
            <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* Instructions */}
          {!showResult && (
            <div className="text-center text-xs text-gray-500 mt-4">
          
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RiddleModal;
