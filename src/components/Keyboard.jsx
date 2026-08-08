import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// Keys that must never count as input (space included - no word contains one)
const IGNORED_KEYS = [
  'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown',
  'Insert', 'Delete', 'Enter', ' '
];

const KeyButton = ({ keyChar, isAnimating, disabled, onPress }) => (
  <motion.button
    type="button"
    onClick={() => onPress(keyChar)}
    disabled={disabled}
    aria-label={`Key ${keyChar}`}
    className={`
      relative h-12 w-10 sm:h-14 sm:w-12 md:h-16 md:w-14
      bg-primary text-white font-semibold text-sm sm:text-base
      rounded-lg shadow-lg border-2 border-primary
      transition-all duration-200 ease-in-out
      hover:bg-secondary hover:border-secondary hover:shadow-xl
      active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent
      disabled:opacity-50 disabled:cursor-not-allowed
      no-select
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
  </motion.button>
);

const Keyboard = ({ onKeyPress, disabled = false }) => {
  const [animatingKeys, setAnimatingKeys] = useState(() => new Set());

  const flashKey = useCallback((visualKey) => {
    setAnimatingKeys((prev) => new Set(prev).add(visualKey));
    setTimeout(() => {
      setAnimatingKeys((prev) => {
        const next = new Set(prev);
        next.delete(visualKey);
        return next;
      });
    }, 200);
  }, []);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled) return;
      if (!event.key || typeof event.key !== 'string') return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'Backspace') {
        event.preventDefault();
        onKeyPress('BACKSPACE');
        flashKey('BACKSPACE');
        return;
      }

      if (IGNORED_KEYS.includes(event.key)) return;

      // Only A-Z and a-z, keeping the original case
      if (/^[A-Za-z]$/.test(event.key)) {
        event.preventDefault();
        onKeyPress(event.key);
        flashKey(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, disabled, flashKey]);

  const handleKeyClick = (key) => {
    if (disabled) return;
    onKeyPress(key);
    flashKey(key);
  };

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-1 sm:space-x-2">
          {row.map((key) => (
            <KeyButton
              key={key}
              keyChar={key}
              isAnimating={animatingKeys.has(key)}
              disabled={disabled}
              onPress={handleKeyClick}
            />
          ))}
        </div>
      ))}

      {/* Backspace */}
      <div className="flex justify-center items-center pt-2">
        <motion.button
          type="button"
          onClick={() => handleKeyClick('BACKSPACE')}
          disabled={disabled}
          aria-label="Backspace"
          className={`
            flex h-12 w-28 sm:h-14 sm:w-32 items-center justify-center gap-2
            bg-red-500 text-white font-semibold text-xs sm:text-sm
            rounded-lg shadow-lg border-2 border-red-500
            transition-all duration-200 ease-in-out
            hover:bg-red-600 hover:border-red-600 hover:shadow-xl
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300
            disabled:opacity-50 disabled:cursor-not-allowed
            no-select
          `}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          animate={animatingKeys.has('BACKSPACE') ? { scale: [1, 0.95, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          <Delete className="h-4 w-4" aria-hidden="true" />
          DEL
        </motion.button>
      </div>
    </div>
  );
};

export default Keyboard;
