import React from 'react';
import { motion } from 'framer-motion';
import { TEXTS } from '../constants/texts';

/**
 * Renders the word the player has to type.
 *
 * The target word is ALWAYS shown exactly as it is spelled - a wrong key never
 * replaces a letter on screen. A mistake only flashes the current letter red.
 */
const WordDisplay = ({
  currentWord,
  typedText = '',
  hasError = false,
  showNextWord = false,
  nextWord = ''
}) => {
  const renderWord = (word, typed, isCurrentWord = true) => {
    if (!word) return null;

    return word.split('').map((char, index) => {
      let charClass = 'text-4xl sm:text-5xl md:text-6xl font-bold transition-colors duration-150 ';

      if (!isCurrentWord) {
        charClass += 'text-gray-300'; // Next word preview
      } else if (index < typed.length) {
        charClass += 'text-green-500'; // Already typed correctly
      } else if (index === typed.length) {
        // The letter waiting to be typed - turns red while a wrong key is held
        charClass += hasError
          ? 'text-red-500 border-b-4 border-red-500'
          : 'text-primary border-b-4 border-secondary';
      } else {
        charClass += 'text-gray-400'; // Not yet typed
      }

      return (
        <motion.span
          key={`${word}-${index}`}
          className={charClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {char}
        </motion.span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Current Word */}
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex justify-center items-center space-x-1 mb-4 flex-wrap"
          animate={hasError ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderWord(currentWord, typedText, true)}
        </motion.div>

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
            {typedText.length} / {currentWord?.length || 0} {TEXTS.CHARACTERS_LABEL}
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
          <p className="text-sm text-gray-500 mb-2">{TEXTS.NEXT_WORD_LABEL}</p>
          <div className="flex justify-center items-center space-x-1 flex-wrap">
            {renderWord(nextWord, '', false)}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WordDisplay;
