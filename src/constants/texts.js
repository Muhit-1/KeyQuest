
export const TEXTS = {
  // App Title and Branding
  APP_TITLE: "KeyQuest",
  APP_SUBTITLE: "Type and solve",
  
  // Landing Page
  WELCOME_HEADING: "Welcome to KeyQuest!",
  WELCOME_SUBTITLE: "Type words quickly, solve riddles, and climb the leaderboard! Test your typing skills and logical thinking in this exciting game.",
  START_GAME_BUTTON: "Start Game",
  
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
  
  // Footer
  FOOTER_VERSION: "KeyQuest v1.0",
  FOOTER_TECH: "Built By Muhit",
  GITHUB_BUTTON: "Built By Muhit",
  FOOTER_COMPETE_MESSAGE: "Compete with players worldwide and climb the leaderboard!",
  
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
  POINTS_PER_WORD: 5,
  POINTS_PER_RIDDLE: 20,
  PENALTY_PER_WRONG_WORD: 3,
  POINTS_PENALTY_WRONG_KEY: 3, // Points deducted for each wrong key
  MAX_WRONG_KEYS_PER_WORD: 2,
  MAX_PLAYER_NAME_LENGTH: 20,
  LEADERBOARD_LIMIT: 10
};
