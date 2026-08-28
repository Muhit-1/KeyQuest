export const TEXTS = {
  // Branding
  APP_TITLE: "KeyQuest",
  MARK_A: "Key",
  MARK_B: "Quest",

  // Start screen
  EYEBROW: "Typing · Riddles · Leaderboard",
  HERO_LINE_1: "Type fast.",
  HERO_LINE_2: "Think faster.",
  LEDE: "Clear the word, crack the riddle, keep the clock alive. Pick how long your run should be.",
  RUN_LENGTH_LABEL: "Run length",
  CUSTOM_TIME_LABEL: "Custom",
  CUSTOM_TIME_PLACEHOLDER: "90",
  SECONDS_LABEL: "seconds",
  START_GAME_BUTTON: "Start game",

  // Rail
  SCORE_LABEL: "Score",
  BEST_LABEL: "Best",
  TIME_LABEL: "Time",
  SCORES_BUTTON: "Scores",
  RESTART_BUTTON: "Restart",
  QUIT_BUTTON: "Quit",

  // Play screen
  CHARACTERS_LABEL: "characters",
  UP_NEXT_LABEL: "Up next",
  ROUND_LABEL: "Round",
  WORD_LABEL: "Word",
  DELETE_KEY: "DEL",

  // End screen
  RUN_COMPLETE: "Run complete",
  OVER_TIME_UP: "Time's up",
  OVER_WRONG_ANSWER: "Wrong answer",
  OVER_ALL_CLEAR: "All riddles cleared",
  NEW_HIGH_SCORE: "New personal best",
  PLAY_AGAIN_BUTTON: "Play again",
  BACK_TO_MENU_BUTTON: "Back to menu",
  SAVE_SCORE_BUTTON: "Save score",

  // Riddle
  RIDDLE_EYEBROW: "Round riddle",
  RIDDLE_TITLE: "Riddle time",
  RIDDLE_CORRECT: "Correct",
  RIDDLE_WRONG: "Wrong answer",
  RIDDLE_NEXT_ROUND: "Next round in a moment...",

  // Leaderboard
  BOARD_EYEBROW: "Hall of fame",
  BOARD_TITLE: "Top scores",
  NO_SCORES_TITLE: "No runs recorded",
  NO_SCORES_MESSAGE: "Finish a game and your score lands here.",
  BOARD_LOCAL_NOTE: "Scores stay on this device",
  REFRESH_SCORES_BUTTON: "Refresh",
  ANONYMOUS: "Anonymous",

  // Save score
  SAVE_EYEBROW: "Leaderboard",
  SAVE_SCORE_TITLE: "Save your run",
  ENTER_NAME_PLACEHOLDER: "Your name",
  SAVE_BUTTON: "Save",
  SKIP_BUTTON: "Skip",

  // Footer
  FOOT_PREFIX: "KeyQuest — built by",
  FOOT_AUTHOR: "Muhit"
};

// Game Configuration Constants
export const GAME_CONFIG = {
  INITIAL_TIME: 30,
  BONUS_TIME: 10,
  MAX_TIME: 60,
  MIN_CUSTOM_TIME: 10,
  MAX_CUSTOM_TIME: 600,
  TIME_PRESETS: [30, 45, 60],
  WORDS_PER_ROUND: 4,
  POINTS_PER_WORD: 5,
  POINTS_PER_RIDDLE: 20,
  POINTS_PENALTY_WRONG_KEY: 3,
  MAX_PLAYER_NAME_LENGTH: 20,
  LEADERBOARD_LIMIT: 10
};
