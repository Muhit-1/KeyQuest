# KeyQuest - Typing & Riddle Game

A modern, responsive typing and riddle game built with React and Tailwind CSS. Test your typing skills and logical thinking, then climb a leaderboard stored right in your browser.

**No backend, no database, no accounts.** KeyQuest runs entirely in the browser - clone it, `npm install`, `npm start`, and you are playing.

## Features

- **Interactive Typing Game**: Type words on a visual QWERTY keyboard or your real one
- **Riddle Challenges**: Solve a riddle after typing each round of words
- **Forgiving Feedback**: The word is always shown correctly spelled; a wrong key flashes red instead of corrupting the word
- **Custom Timer**: Pick 30s, 45s, 60s, or any duration you like
- **Local Leaderboard**: Top scores are kept in `localStorage` on your device
- **Restart Anytime**: Restart or quit mid-game without reloading the page
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Sound Effects**: Audio feedback via the Web Audio API
- **Smooth Animations**: Transitions powered by Framer Motion

## How to Play

1. **Start the Game**: Pick a duration and click "Start Game"
2. **Type Words**: Type the displayed word using your keyboard or the on-screen keys (capitalization does not matter)
3. **Solve the Riddle**: After finishing the round's words, answer the riddle they hint at
4. **Earn Points**: Points for every completed word and a bigger bonus for a correct riddle
5. **Beat the Clock**: A correct riddle answer buys you extra seconds
6. **Save Your Score**: Add your name to the local leaderboard

## Tech Stack

- **Frontend**: React 18 (Functional Components & Hooks)
- **Styling**: Tailwind CSS with a custom design system
- **Icons**: lucide-react
- **Animations**: Framer Motion
- **Storage**: Browser `localStorage`
- **Build Tool**: Create React App
- **Deployment**: Ready for Netlify/Vercel (static hosting, nothing else required)

## Screenshots

![Home Page](https://i.postimg.cc/k5zZ0Vdw/screencapture-localhost-3000-2025-10-03-01-24-15.png)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm start
```

The game opens at `http://localhost:3000`. There is nothing to configure - no environment variables, no API keys.

### 4. Build for Production
```bash
npm run build
```

Deploy the `build/` folder to any static host. `public/_headers` carries the security headers for Netlify; copy those values into your host's config if you use something else.

## Game Mechanics

### Scoring
- **Completed word**: +5 points
- **Correct riddle**: +20 points
- **Wrong key**: -3 points (score never drops below 0)
- **Wrong riddle answer**: game over

### Rounds
- Each round pulls 4 random words from a riddle's word list
- Finishing all 4 words opens that round's riddle
- A correct answer starts a new round with a fresh riddle and +10 seconds

### Timer
- Choose 30s, 45s, 60s, or a custom value between 10 and 600 seconds
- Bonus time is capped at whichever is larger: your chosen duration or 60s

## Customization

### Adding New Riddles
Edit `src/data/riddles.json`:

```json
{
  "id": 9,
  "words": ["Word1", "Word2", "Word3", "Word4"],
  "question": "What is the common theme?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "theme": "Theme Name"
}
```

Words must contain letters only - no spaces or punctuation. A riddle can hold more words than a round uses; the game picks `WORDS_PER_ROUND` of them at random.

### Modifying Game Settings
All tunables live in `GAME_CONFIG` in `src/constants/texts.js`: timer defaults and bounds, words per round, points, and penalties.

### Customizing Appearance
Edit `tailwind.config.js` for the colour palette, animations, and breakpoints.

## Project Structure

```
src/
  App.jsx                  Game state machine and layout
  components/
    Keyboard.jsx           On-screen + physical keyboard input
    WordDisplay.jsx        Word rendering and typing feedback
    RiddleModal.jsx        Riddle question and answer feedback
    ScoreBoardModal.jsx    Local leaderboard view
    GameOverModal.jsx      End-of-game summary
    SaveScoreModal.jsx     Name entry for the leaderboard
  constants/texts.js       All copy + GAME_CONFIG
  data/riddles.json        Riddle content
  utils/
    leaderboard.js         localStorage leaderboard
    security.js            Input validation and sanitization
```

## Security

KeyQuest stores nothing off-device and talks to no third-party service, which removes most of the usual attack surface. What remains is covered by:

- **Input Validation**: Player names are validated against an allow-list pattern
- **XSS Protection**: Pattern detection plus HTML entity escaping helpers
- **Safe Storage**: Leaderboard reads are validated and bounded before use
- **Secure Headers**: CSP, X-Frame-Options, Referrer-Policy, and Permissions-Policy in `public/_headers`
- **Dependency Security**: Automated vulnerability scanning in CI

See [SECURITY.md](./SECURITY.md) for details.

### Reporting Security Issues
Please report vulnerabilities privately to the repository owner rather than opening a public issue.

## Security Scripts

```bash
npm run security:check
```

```bash
npm run security:audit-fix
```

## License

MIT.

---

**Built for typing enthusiasts and puzzle lovers.**
