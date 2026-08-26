import React from 'react';
import { TEXTS } from '../constants/texts';

/**
 * The word the player has to type, as underlined slots.
 *
 * The target word is ALWAYS shown exactly as it is spelled - a wrong key never
 * replaces a letter. A mistake only turns the current slot red and nudges it.
 */
const WordDisplay = ({ currentWord = '', typedText = '', hasError = false, nextWord = '' }) => {
  const slotClass = (index) => {
    const classes = ['slot'];
    if (index < typedText.length) classes.push('done');
    if (index === typedText.length) {
      classes.push('now');
      if (hasError) classes.push('bad');
    }
    return classes.join(' ');
  };

  return (
    <>
      <div className="target">
        {[...currentWord].map((char, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span className={slotClass(index)} key={`${currentWord}-${index}`}>
            {char}
          </span>
        ))}
      </div>

      <div className="count">
        <b>{typedText.length}</b> / {currentWord.length} {TEXTS.CHARACTERS_LABEL}
      </div>

      {nextWord && (
        <div className="queue">
          <span className="queue__k">{TEXTS.UP_NEXT_LABEL}</span>
          <span className="queue__v">{nextWord}</span>
        </div>
      )}
    </>
  );
};

export default WordDisplay;
