import React, { useCallback, useEffect, useState } from 'react';
import { getTopScores } from '../utils/leaderboard';
import { TEXTS, GAME_CONFIG } from '../constants/texts';

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
};

const ScoreBoardModal = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState([]);

  const fetchScores = useCallback(() => {
    setScores(getTopScores(GAME_CONFIG.LEADERBOARD_LIMIT).data);
  }, []);

  useEffect(() => {
    if (isOpen) fetchScores();
  }, [isOpen, fetchScores]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="boardTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__hd">
          <div>
            <p>{TEXTS.BOARD_EYEBROW}</p>
            <h3 id="boardTitle">{TEXTS.BOARD_TITLE}</h3>
          </div>
          <button type="button" className="modal__x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal__bd">
          {scores.length > 0 ? (
            <div className="rows">
              {scores.map((entry, index) => (
                <div className={`row${index === 0 ? ' row--top' : ''}`} key={entry.id}>
                  <span className="row__n">{index + 1}</span>
                  <span>
                    <span className="row__name">{entry.name || TEXTS.ANONYMOUS}</span>
                    <br />
                    <span className="row__meta">{formatDate(entry.time)}</span>
                  </span>
                  <span className="row__s">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="empty__ico">◎</div>
              <h4>{TEXTS.NO_SCORES_TITLE}</h4>
              <p className="sub">{TEXTS.NO_SCORES_MESSAGE}</p>
            </div>
          )}

          <div className="modal__ft">
            <small>{TEXTS.BOARD_LOCAL_NOTE}</small>
            <button type="button" className="btn btn--ghost" onClick={fetchScores}>
              {TEXTS.REFRESH_SCORES_BUTTON}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoardModal;
