import React from 'react';
import { motion } from 'framer-motion';

const WordDisplay = ({ 
  currentWord, 
  typedText, 
  isComplete, 
  showNextWord = false,
  nextWord = ''
}) => {
  const renderWord = (word, typed, isCurrentWord = true) => {
    if (!word) return null;

    return word.split('').map((char, index) => {
      let charClass = 'text-4xl sm:text-5xl md:text-6xl font-bold transition-all duration-200 ';
      
      if (isCurrentWord) {
        if (index < typed.length) {
          // Character has been typed - check if it matches the target character (case-sensitive)
          const typedChar = typed[index];
          if (typedChar && typeof typedChar === 'string' && typedChar === char) {
            charClass += 'text-green-500'; // Correct - exact match (case-sensitive)
          } else {
            charClass += 'text-red-500 bg-red-100 rounded px-1'; // Incorrect - case mismatch or wrong letter
          }
        } else if (index === typed.length && typed.length < word.length) {
          charClass += 'text-primary border-b-4 border-secondary animate-pulse'; // Current character
        } else {
          charClass += 'text-gray-400'; // Not yet typed
        }
      } else {
        charClass += 'text-gray-300'; // Next word preview
      }

      return (
        <motion.span
          key={`${word}-${index}`}
          className={charClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {index < typed.length ? typed[index] : char}
        </motion.span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] p-8">
      {/* Current Word */}
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center items-center space-x-1 mb-4">
          {renderWord(currentWord, typedText, true)}
        </div>
        
        {/* Progress indicator */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${currentWord ? (typedText.length / currentWord.length) * 100 : 0}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {typedText.length} / {currentWord?.length || 0} characters
          </p>
        </div>
      </motion.div>

      {/* Next Word Preview */}
      {showNextWord && nextWord && (
        <motion.div
          className="text-center opacity-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-gray-500 mb-2">Next word:</p>
          <div className="flex justify-center items-center space-x-1">
            {renderWord(nextWord, '', false)}
          </div>
        </motion.div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-green-50/90 backdrop-blur-sm rounded-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ✅
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Perfect!</h2>
            <p className="text-green-500">Word completed successfully</p>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default WordDisplay;
