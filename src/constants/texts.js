
export const TEXTS = {
  // App Title and Branding
  APP_TITLE: "KeyQuest",
  APP_SUBTITLE: "Type and solve",

  // Landing Page
  WELCOME_HEADING: "Welcome to KeyQuest!",
  WELCOME_SUBTITLE: "Type words quickly, solve riddles, and climb the leaderboard! Test your typing skills and logical thinking in this exciting game.",
  START_GAME_BUTTON: "Start Game",
  DURATION_HEADING: "Select Game Duration:",
  CUSTOM_TIME_LABEL: "Custom",
  CUSTOM_TIME_PLACEHOLDER: "e.g. 90",
  SECONDS_LABEL: "seconds",

  // Header Labels
  SCORE_LABEL: "Score",
  TIME_LABEL: "Time",
  YOUR_BEST_LABEL: "Your Best",

  // Buttons
  TOP_SCOREBOARD_BUTTON: "Top Score Board",
  SAVE_SCORE_BUTTON: "Save Score to Leaderboard",
  PLAY_AGAIN_BUTTON: "Play Again",
  BACK_TO_MENU_BUTTON: "Back to Menu",
  REFRESH_SCORES_BUTTON: "Refresh Scores",
  RESTART_BUTTON: "Restart",
  QUIT_BUTTON: "Quit",

  // Game Over Modal
  GAME_OVER_TITLE: "Game Over!",
  FINAL_SCORE_LABEL: "Final Score",
  NEW_HIGH_SCORE: "New High Score!",

  // Save Score Modal
  SAVE_SCORE_TITLE: "Save Your Score!",
  ENTER_NAME_PLACEHOLDER: "Enter your name",
  SAVE_BUTTON: "Save Score",
  SKIP_BUTTON: "Skip",
  SAVING_TEXT: "Saving...",

  // Leaderboard
  LEADERBOARD_TITLE: "Top Score Board",
  LEADERBOARD_SUBTITLE: "Hall of Fame - Best Players",
  NO_SCORES_TITLE: "No scores yet!",
  NO_SCORES_MESSAGE: "Be the first to make it to the leaderboard!",
  LOADING_MESSAGE: "Loading leaderboard...",
  ERROR_MESSAGE: "Oops! Something went wrong",
  TRY_AGAIN_BUTTON: "Try Again",
  LEADERBOARD_LOCAL_NOTE: "Scores are stored on this device only.",

  // Footer
  FOOTER_VERSION: "KeyQuest v1.0",

  // Progress Indicators
  ROUND_LABEL: "Round",
  WORD_LABEL: "Word",
  CHARACTERS_LABEL: "characters",
  NEXT_WORD_LABEL: "Next word:",

  // Completion Messages
  WORD_COMPLETE_TITLE: "Perfect!",
  WORD_COMPLETE_MESSAGE: "Word completed successfully",
  CONGRATULATIONS_TITLE: "Congratulations!",
  SCORE_SAVED_MESSAGE: "Your score has been saved.",

  // Riddle Modal
  RIDDLE_TITLE: "Riddle Time!",
  RIDDLE_CORRECT: "Correct!",
  RIDDLE_WRONG: "Wrong Answer!",
  RIDDLE_NEXT_ROUND: "Moving to next round in 2 seconds...",

  // Rank Labels
  CHAMPION: "Champion",
  RUNNER_UP: "Runner-up",
  THIRD_PLACE: "Third Place",
  ANONYMOUS: "Anonymous",

  // Units
  POINTS_UNIT: "pts",
  SECONDS_UNIT: "s"
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
  POINTS_PENALTY_WRONG_KEY: 3, // Points deducted for each wrong key
  MAX_PLAYER_NAME_LENGTH: 20,
  LEADERBOARD_LIMIT: 10
};
