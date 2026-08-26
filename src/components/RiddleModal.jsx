import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const optionClass = (index) => {
    const classes = ['opt'];
    if (!showResult) return classes.join(' ');

    if (index === riddle.correctAnswer) classes.push('is-right');
    else if (index === selectedAnswer) classes.push('is-wrong');
    else classes.push('is-dim');

    return classes.join(' ');
  };

  return (
    <div className="scrim">
      <div className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="riddleTitle">
        <div className="modal__hd">
          <div>
            <p>{TEXTS.RIDDLE_EYEBROW}</p>
            <h3 id="riddleTitle">{TEXTS.RIDDLE_TITLE}</h3>
          </div>
          <span className="modal__clock">{timeLeft}s</span>
        </div>

        <div className="modal__bd">
          <h4 className="riddle__q">{riddle.question}</h4>

          <div className="opts">
            {riddle.options.map((option, index) => (
              <button
                key={option}
                type="button"
                className={optionClass(index)}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <span className="opt__n">{index + 1}</span>
                <span>{option}</span>
                {showResult && index === riddle.correctAnswer && <span className="opt__ico">✓</span>}
                {showResult && index === selectedAnswer && index !== riddle.correctAnswer && (
                  <span className="opt__ico">✕</span>
                )}
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`verdict ${isCorrect ? 'verdict--ok' : 'verdict--no'}`}>
              <div className="verdict__t">
                {isCorrect ? TEXTS.RIDDLE_CORRECT : TEXTS.RIDDLE_WRONG}
              </div>
              <p>
                {isCorrect
                  ? `+${GAME_CONFIG.POINTS_PER_RIDDLE} points and +${GAME_CONFIG.BONUS_TIME} seconds.`
                  : `The answer was ${riddle.options[riddle.correctAnswer]}.`}
              </p>
              {isCorrect && <small>{TEXTS.RIDDLE_NEXT_ROUND}</small>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiddleModal;
