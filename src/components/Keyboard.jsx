import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Keyboard = ({ onKeyPress, pressedKey, disabled = false }) => {
  const [animatingKeys, setAnimatingKeys] = useState(new Set());

  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled) return;
      
      // Check if event.key exists and is a string before calling toUpperCase
      if (!event.key || typeof event.key !== 'string') return;
      
      // Handle backspace
      if (event.key === 'Backspace') {
        event.preventDefault();
        onKeyPress('BACKSPACE');
        
        // Add animation for backspace
        setAnimatingKeys(prev => new Set([...prev, 'BACKSPACE']));
        setTimeout(() => {
          setAnimatingKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete('BACKSPACE');
            return newSet;
          });
        }, 200);
        return;
      }
      
      // Filter out special keys
      const specialKeys = [
        'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown',
        'Insert', 'Delete', 'Enter', ' '
      ];
      
      if (specialKeys.includes(event.key)) {
        console.log('Ignoring special key:', event.key);
        return;
      }
      
      // Only accept A-Z and a-z characters (preserve original case)
      if (event.key.match(/^[A-Za-z]$/)) {
        event.preventDefault();
        const key = event.key; // Keep original case
        onKeyPress(key);
        
        // Add animation (use uppercase for visual key highlighting)
        const visualKey = key.toUpperCase();
        setAnimatingKeys(prev => new Set([...prev, visualKey]));
        setTimeout(() => {
          setAnimatingKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(visualKey);
            return newSet;
          });
        }, 200);
      } else {
        console.log('Ignoring non-letter key:', event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, disabled]);

  // Handle visual key press animation
  useEffect(() => {
    if (pressedKey) {
      setAnimatingKeys(prev => new Set([...prev, pressedKey]));
      setTimeout(() => {
        setAnimatingKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(pressedKey);
          return newSet;
        });
      }, 200);
    }
  }, [pressedKey]);

  const handleKeyClick = (key) => {
    if (disabled) return;
    onKeyPress(key);
  };

  const KeyButton = ({ keyChar, extraClasses = '' }) => {
    const isAnimating = animatingKeys.has(keyChar);
    
    return (
      <motion.button
        key={keyChar}
        onClick={() => handleKeyClick(keyChar)}
        disabled={disabled}
        className={`
          relative h-12 w-10 sm:h-14 sm:w-12 md:h-16 md:w-14 
          bg-primary text-white font-semibold text-sm sm:text-base
          rounded-lg shadow-lg border-2 border-primary
          transition-all duration-200 ease-in-out
          hover:bg-secondary hover:border-secondary hover:shadow-xl
          active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          no-select
          ${isAnimating ? 'animate-key-press' : ''}
          ${extraClasses}
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        animate={isAnimating ? {
          scale: [1, 0.95, 1],
          backgroundColor: ['#146C94', '#19A7CE', '#146C94']
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {keyChar}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 bg-accent rounded-lg opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl">
      {/* First Row */}
      <div className="flex space-x-1 sm:space-x-2">
        {keyboardLayout[0].map((key) => (
          <KeyButton key={key} keyChar={key} />
        ))}
      </div>
      
      {/* Second Row */}
      <div className="flex space-x-1 sm:space-x-2">
        {keyboardLayout[1].map((key) => (
          <KeyButton key={key} keyChar={key} />
        ))}
      </div>
      
      {/* Third Row */}
      <div className="flex space-x-1 sm:space-x-2">
        {keyboardLayout[2].map((key) => (
          <KeyButton key={key} keyChar={key} />
        ))}
      </div>
      
      {/* Space Bar and Backspace */}
      <div className="flex justify-center items-center space-x-4 pt-2">
        <motion.button
          onClick={() => handleKeyClick('BACKSPACE')}
          disabled={disabled}
          className={`
            h-12 w-20 sm:h-14 sm:w-24 md:h-16 md:w-28
            bg-red-500 text-white font-semibold text-xs sm:text-sm
            rounded-lg shadow-lg border-2 border-red-500
            transition-all duration-200 ease-in-out
            hover:bg-red-600 hover:border-red-600 hover:shadow-xl
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300
            disabled:opacity-50 disabled:cursor-not-allowed
            no-select
            ${animatingKeys.has('BACKSPACE') ? 'animate-key-press' : ''}
          `}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          ⌫ DEL
        </motion.button>
        
        <motion.button
          onClick={() => handleKeyClick(' ')}
          disabled={disabled}
          className={`
            h-12 w-32 sm:h-14 sm:w-40 md:h-16 md:w-48
            bg-primary text-white font-semibold text-sm sm:text-base
            rounded-lg shadow-lg border-2 border-primary
            transition-all duration-200 ease-in-out
            hover:bg-secondary hover:border-secondary hover:shadow-xl
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            no-select
            ${animatingKeys.has(' ') ? 'animate-key-press' : ''}
          `}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          SPACE
        </motion.button>
      </div>
      
    </div>
  );
};

export default Keyboard;
