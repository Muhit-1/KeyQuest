import React, { useEffect, useState } from 'react';
import { TEXTS, GAME_CONFIG } from '../constants/texts';

const SaveScoreModal = ({ isOpen, score, defaultName = '', onSave, onSkip }) => {
  const [inputName, setInputName] = useState(defaultName);
  const [error, setError] = useState(null);

  // Reset the field each time the modal opens, not on every parent render
  useEffect(() => {
    if (isOpen) {
      setInputName(defaultName);
      setError(null);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSave = () => {
    const result = onSave(inputName);
    if (result && !result.success) setError(result.error);
  };

  return (
    <div className="scrim">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="saveTitle">
        <div className="modal__hd">
          <div>
            <p>{TEXTS.SAVE_EYEBROW}</p>
            <h3 id="saveTitle">{TEXTS.SAVE_SCORE_TITLE}</h3>
          </div>
          <button type="button" className="modal__x" onClick={onSkip} aria-label="Close">✕</button>
        </div>

        <div className="modal__bd">
          <div className="big" style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 52, color: 'var(--deep)', lineHeight: 1, marginBottom: 6 }}>
            {score.toLocaleString()}
          </div>
          <p className="sub">Name this run to put it on the board.</p>

          <div style={{ marginTop: 22 }}>
            <input
              className="field"
              type="text"
              value={inputName}
              onChange={(e) => { setInputName(e.target.value); setError(null); }}
              placeholder={TEXTS.ENTER_NAME_PLACEHOLDER}
              maxLength={GAME_CONFIG.MAX_PLAYER_NAME_LENGTH}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && inputName.trim()) handleSave(); }}
            />
            {error && <p className="err">{error}</p>}
          </div>

          <div className="over__acts">
            <button type="button" className="start start--sm" onClick={handleSave} disabled={!inputName.trim()}>
              {TEXTS.SAVE_BUTTON}
            </button>
            <button type="button" className="btn" onClick={onSkip}>
              {TEXTS.SKIP_BUTTON}
            </button>
          </div>

          <div className="modal__ft">
            <small>{TEXTS.BOARD_LOCAL_NOTE}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveScoreModal;
