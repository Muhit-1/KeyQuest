import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TEXTS } from '../constants/texts';

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

const DOWN_MS = 120;
const MISS_MS = 260;

/**
 * The keycap deck. Mirrors both on-screen clicks and physical typing,
 * and lifts the next expected key so the player can find it.
 */
const Keyboard = ({ onKeyPress, disabled = false, hintKey = '' }) => {
  const [downKey, setDownKey] = useState('');
  const [missKey, setMissKey] = useState('');
  const timersRef = useRef({ down: null, miss: null });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      clearTimeout(timers.down);
      clearTimeout(timers.miss);
    };
  }, []);

  const flash = useCallback((key, isMiss) => {
    const timers = timersRef.current;
    if (isMiss) {
      setMissKey(key);
      clearTimeout(timers.miss);
      timers.miss = setTimeout(() => setMissKey(''), MISS_MS);
      return;
    }
    setDownKey(key);
    clearTimeout(timers.down);
    timers.down = setTimeout(() => setDownKey(''), DOWN_MS);
  }, []);

  const send = useCallback((key) => {
    if (disabled) return;
    const visual = key === 'BACKSPACE' ? 'BACKSPACE' : key.toUpperCase();
    const accepted = onKeyPress(key);
    flash(visual, accepted === false);
  }, [disabled, onKeyPress, flash]);

  // Physical keyboard
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled) return;
      if (!event.key || typeof event.key !== 'string') return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'Backspace') {
        event.preventDefault();
        send('BACKSPACE');
        return;
      }

      if (IGNORED_KEYS.includes(event.key)) return;

      if (/^[A-Za-z]$/.test(event.key)) {
        event.preventDefault();
        send(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, send]);

  const capClass = (key) => {
    const classes = ['key'];
    if (downKey === key) classes.push('down');
    if (missKey === key) classes.push('miss');
    if (hintKey && hintKey.toUpperCase() === key) classes.push('hintable');
    return classes.join(' ');
  };

  return (
    <section className="deck no-select" aria-label="On-screen keyboard">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div className="deck__row" key={`row-${rowIndex}`}>
          {row.map((key, keyIndex) => (
            <button
              key={key}
              type="button"
              className={capClass(key)}
              style={{ animationDelay: `${rowIndex * 90 + keyIndex * 22}ms` }}
              onClick={() => send(key)}
              disabled={disabled}
              aria-label={`Key ${key}`}
            >
              {key}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              type="button"
              className={`${capClass('BACKSPACE')} key--del`}
              style={{ animationDelay: '300ms' }}
              onClick={() => send('BACKSPACE')}
              disabled={disabled}
              aria-label="Backspace"
            >
              ⌫ {TEXTS.DELETE_KEY}
            </button>
          )}
        </div>
      ))}
    </section>
  );
};

export default Keyboard;
