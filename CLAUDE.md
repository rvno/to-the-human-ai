# Claude.md - Project Context for AI Assistants

## 🎓 AI Assistant Behavior Mode: TEACHING ASSISTANT

**IMPORTANT**: This is a learning project. When interacting with the user:

### DO:
- ✅ Provide hints and guidance about where to make changes
- ✅ Explain concepts and syntax
- ✅ Point to relevant documentation
- ✅ Suggest approaches and explain tradeoffs
- ✅ Show small syntax examples (1-3 lines) to illustrate a concept
- ✅ Ask guiding questions to help the user think through problems
- ✅ Review code and point out issues when asked
- ✅ Explain error messages

### DON'T:
- ❌ Write complete code solutions
- ❌ Use the Edit or Write tools unless explicitly asked
- ❌ Implement features for the user
- ❌ Make changes directly to files

### Example Interactions:

**Bad (doing the work):**
```
User: "How do I change the background color?"
AI: *uses Edit tool to change the background color*
```

**Good (teaching):**
```
User: "How do I change the background color?"
AI: "In p5.js, you can change the background color using the background() function.
Look in sketch.js around line 30-35 in the draw() function. You'll see something like:
  background(220);
The number represents grayscale. Try changing it to background(0) for black, or use
background(r, g, b) for RGB colors. What color were you thinking?"
```

---

## Project Overview
This is an educational p5.js application that demonstrates how to integrate with Anthropic's Claude API. It features a chat interface where users can interact with Claude AI through a simple canvas-based UI.

## Architecture
- **Frontend**: p5.js canvas-based chat interface (`sketch.js`, `index.html`)
- **Backend**: Express.js proxy server (`server.js`) that handles API requests to Anthropic
- **Configuration**: API key stored in `config.js` (git-ignored for security)

## Key Files
- `sketch.js` - Main p5.js application with chat UI
- `server.js` - Node.js Express server that proxies requests to Anthropic API
- `config.js` - Contains the Anthropic API key (NOT in git)
- `config.example.js` - Template for config file (safe to commit)
- `index.html` - HTML wrapper that loads p5.js and the sketch
- `package.json` - Node dependencies (express, cors, node-fetch)

## Current Configuration

### Model
Currently using: `claude-haiku-4-5-20251001` (Claude Haiku 4.5)
- Faster and more cost-effective than Sonnet
- Good balance of speed and quality for chat applications

### System Prompt
The server includes a custom system prompt that makes Claude act as a WWE wrestler:
- Wrestling name: "THE CORGI"
- Personality: Intense, confident, dramatic, over-the-top
- **Important constraint**: Must NEVER call itself "The Champ" - only "The Corgi"

Location: `server.js` lines 34-35

### API Configuration
- Endpoint: `https://api.anthropic.com/v1/messages`
- API version: `2023-06-01`
- Streaming: Enabled (`stream: true`)
- Max tokens: 1024

## Git Ignore Rules
The following are intentionally excluded from version control:
- `node_modules/` - npm dependencies
- `libraries/` - p5.js library files
- `config.js` - Contains sensitive API key
- `.env` - Environment variables
- `.DS_Store`, `Thumbs.db` - OS files
- `.vscode/`, `.idea/` - IDE settings
- `*.log` - Log files

## Setup Instructions (for new clones)
1. Clone repository
2. Run `npm install`
3. Copy `config.example.js` to `config.js`
4. Add Anthropic API key to `config.js`
5. Run `npm start`
6. Open `http://localhost:3000` in browser

## Common Tasks

### Changing the AI Model
Edit `sketch.js` line 115 to change the model name.
Available models:
- `claude-sonnet-4-5-20250929` - Most capable, slower, more expensive
- `claude-haiku-4-5-20251001` - Fast, cost-effective (current)
- `claude-opus-4-1-20250805` - Most capable, slowest, most expensive

### Modifying the System Prompt
Edit `server.js` lines 34-35 to change Claude's personality/behavior.

### Changing the Port
Edit `server.js` line 19 to change from port 3000.

### Killing Port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

## Educational Context
This project is designed for teaching:
- API integration and authentication
- Asynchronous JavaScript (async/await, fetch)
- Server-side proxying to avoid CORS issues
- Creative coding with p5.js
- Working with streaming responses
- Security best practices (API key management, .gitignore)

## Security Notes
- API key is stored server-side only (never exposed to browser)
- `config.js` is git-ignored to prevent accidental commits
- Server acts as a proxy to keep API key secure
- Users should monitor their API usage at console.anthropic.com

## Known Issues / Quirks
- Claude Haiku may occasionally still say "The Champ" despite system prompt instructions - this is a model instruction-following limitation
- Server must be restarted after changing system prompt or other server.js configurations
- Port 3000 must be free before starting the server