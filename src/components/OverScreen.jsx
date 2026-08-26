import React from 'react';
import { TEXTS } from '../constants/texts';

const OverScreen = ({ score, wordsCleared, headline, isNewBest, onSave, onPlayAgain, onMenu }) => (
  <main className="stage">
    <div className="over rise">
      <p className="eyebrow">{TEXTS.RUN_COMPLETE}</p>
      <h2>{headline}</h2>
      <div className="big">{score.toLocaleString()}</div>
      <p>
        points from {wordsCleared} {wordsCleared === 1 ? 'word' : 'words'}
      </p>

      {isNewBest && <div className="badge">★ {TEXTS.NEW_HIGH_SCORE}</div>}

      <div className="over__acts">
        <button type="button" className="start start--sm" onClick={onPlayAgain}>
          {TEXTS.PLAY_AGAIN_BUTTON}
        </button>
        <button type="button" className="btn btn--solid" onClick={onSave}>
          {TEXTS.SAVE_SCORE_BUTTON}
        </button>
        <button type="button" className="btn" onClick={onMenu}>
          {TEXTS.BACK_TO_MENU_BUTTON}
        </button>
      </div>
    </div>
  </main>
);

export default OverScreen;
