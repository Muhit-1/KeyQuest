# KeyQuest - Typing & Riddle Game 🎮⌨️

A modern, responsive typing and riddle game built with React, Tailwind CSS, and Supabase. Test your typing skills and logical thinking while competing on a global leaderboard!

## 🚀 Features

- **Interactive Typing Game**: Type words on a beautiful visual QWERTY keyboard
- **Riddle Challenges**: Solve riddles based on the words you've typed
- **Real-time Scoring**: Dynamic scoring system with timer-based gameplay
- **Global Leaderboard**: Compete with players worldwide using Supabase
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Sound Effects**: Audio feedback for key presses and game events
- **Smooth Animations**: Beautiful transitions using Framer Motion
- **Modern UI**: Clean, minimal design with custom color palette

## 🎯 How to Play

1. **Start the Game**: Click "Start Game" from the main menu
2. **Type Words**: Type the displayed words using your keyboard or on-screen keys
3. **Solve Riddles**: After typing several words, answer riddles based on their theme
4. **Earn Points**: Get 10 points for each correct riddle answer
5. **Beat the Clock**: Complete as many rounds as possible within the time limit
6. **Save Your Score**: Add your name to the global leaderboard

## 🛠 Tech Stack

- **Frontend**: React 18 (Functional Components & Hooks)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Database**: Supabase for leaderboard and user data
- **Build Tool**: Create React App
- **Deployment**: Ready for Netlify/Vercel deployment

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for leaderboard functionality)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd KeyQuest
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to **SQL Editor** and run this query to create the leaderboard table:


```

4. Get your project URL and anon key from **Settings > API**

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Start the Development Server
```bash
npm start
```

The game will open at `http://localhost:3000`


## 📱 Responsive Design

The game is fully responsive and optimized for:
- **Desktop**: Full keyboard and mouse support
- **Tablet**: Touch-friendly interface with on-screen keyboard
- **Mobile**: Optimized layout with haptic feedback

## 🎵 Audio Features

- **Key Press**: Pleasant click sound for each keystroke
- **Correct Answer**: Success chime for correct riddles
- **Wrong Answer**: Error buzz for incorrect answers
- **Web Audio API**: Modern browser-based sound generation

## 📊 Game Mechanics

### Scoring System
- **Correct Riddle**: +20 points
- **Wrong Answer**: -3 points

### Timer System
- **Initial Time**: 30 seconds per game , user can also choose between 30 ,45 , 60 seconds
- **Maximum Time**: 60 seconds (prevents infinite gameplay)

### Difficulty Progression
- 8 built-in riddle sets with varying difficulty
- Words progress from simple to complex themes
- Riddles require logical thinking and pattern recognition

## 🚀 Deployment

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag the `build` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🔧 Customization

### Adding New Riddles
Edit `src/data/riddles.json` to add new riddle sets:

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

### Modifying Game Settings
In `App.jsx`, you can adjust:
- Initial timer duration
- Points per correct answer
- Bonus time amounts
- Maximum time limit

### Customizing Appearance
Modify `tailwind.config.js` to change:
- Color palette
- Animations
- Responsive breakpoints
- Custom components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Supabase** for the backend-as-a-service platform
- **Create React App** for the development setup

## 🔒 Security

KeyQuest implements comprehensive security measures:

- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: Automatic detection and prevention of cross-site scripting
- **Rate Limiting**: Client-side rate limiting for API calls
- **Secure Headers**: CSP, X-Frame-Options, and other security headers
- **Environment Security**: No hardcoded secrets, all sensitive data uses environment variables
- **Dependency Security**: Automated vulnerability scanning and updates

### Security Features
- Input sanitization and validation
- XSS pattern detection and blocking
- Rate limiting for score submissions
- Secure Supabase client configuration
- Comprehensive security headers
- Automated security testing in CI/CD

For detailed security information, see:
- [SECURITY.md](./SECURITY.md) - Complete security documentation
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Pre-deployment security checklist

### Reporting Security Issues
If you discover a security vulnerability, please report it responsibly by emailing [your-email@domain.com] instead of creating a public issue.

## 🛠️ Security Scripts

```bash
# Run security audit
npm run security:check

# Fix security vulnerabilities
npm run security:audit-fix

# Scan for secrets (requires TruffleHog)
npm run security:scan

# Clean up accidentally committed secrets
npm run security:cleanup
```

---

**Built with ❤️ and 🔒 for typing enthusiasts and puzzle lovers!**

Enjoy playing KeyQuest and don't forget to challenge your friends to beat your high score! 🏆
