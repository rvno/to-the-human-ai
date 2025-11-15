# Chat with Claude - p5.js AI Application

A simple, educational chat interface built with p5.js that connects to Anthropic's Claude AI. Perfect for teaching students about API integration, asynchronous programming, and creative coding with AI.

![Chat Interface](https://img.shields.io/badge/p5.js-ED225D?style=flat&logo=p5.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-191919?style=flat&logo=anthropic&logoColor=white)

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** installed (v14 or higher) - [Download here](https://nodejs.org/)
- An **Anthropic API key** - [Get one here](https://console.anthropic.com/)
- A text editor (VS Code recommended)
- A web browser (Chrome, Firefox, Safari, etc.)

## 🚀 Quick Start

### 1. Clone or Download This Repository

If you haven't already, clone or download this repository to your local machine:

```bash
git clone <repository-url>
cd "Anthropic API + p5"
```

Or if you downloaded the ZIP file, extract it and navigate to the folder in your terminal.

### 2. Get an Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key** and copy your new API key

### 3. Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install Express, CORS, and node-fetch packages needed for the server.

### 4. Configure Your API Key

**Create your config file:**

1. Copy `config.example.js` to create your own `config.js`:

```bash
cp config.example.js config.js
```

2. Open `config.js` in your text editor
3. Replace `'your-api-key-here'` with your actual API key:

```javascript
const CONFIG = {
  ANTHROPIC_API_KEY: 'sk-ant-api03-your-actual-key-here'
};
```

4. Save the file

> **⚠️ Important:** The `config.js` file is git-ignored for security. Never commit your API key to version control!

### 5. Run the Application

**Start the server:**

```bash
npm start
```

You should see:
```
Server running at http://localhost:3000
Open this URL in your browser to use the chat app
API endpoint available at: http://localhost:3000/api/chat
API Key loaded: Yes
```

**Open your browser** to:
```
http://localhost:3000
```

That's it! You should see the chat interface. Type a message and press Enter or click Send.

## 📁 Project Structure

```
Anthropic API + p5/
├── sketch.js          # Main p5.js code (chat interface)
├── server.js          # Node.js proxy server (handles API calls)
├── config.js          # Your API key (git-ignored)
├── config.example.js  # Example config file (safe to share)
├── index.html         # HTML page that loads everything
├── package.json       # Node.js dependencies
├── .gitignore         # Prevents sensitive files from being committed
├── libraries/         # p5.js library files (git-ignored)
├── node_modules/      # npm dependencies (git-ignored)
└── README.md          # This file!
```

## 🎓 How It Works

### The Architecture

```
Browser (p5.js)  →  Local Server (Node.js)  →  Anthropic API (Claude)
    ↓                      ↓                         ↓
  sketch.js            server.js                 Claude AI
```

1. **User types a message** in the p5.js interface
2. **sketch.js sends** the message to `http://localhost:3000/api/chat`
3. **server.js receives** the request and forwards it to Anthropic's API
4. **Claude processes** the message and sends back a response
5. **server.js returns** the response to sketch.js
6. **sketch.js displays** Claude's response on the canvas

### Why Use a Server?

Browsers block direct API calls to external services (CORS policy). The Node.js server acts as a "middleman" that:
- Keeps your API key secure (never exposed to the browser)
- Bypasses CORS restrictions
- Could add features like rate limiting or logging

## 🛠️ Troubleshooting

### "Port 3000 already in use"

Another process is using port 3000. Kill it:

```bash
lsof -ti:3000 | xargs kill -9
```

Then run `npm start` again.

### "API Key loaded: No"

You likely haven't created your `config.js` file yet. Check that:
1. You copied `config.example.js` to create `config.js` (see step 4 above)
2. Your API key is properly formatted with quotes in `config.js`
3. The file is saved

If `config.js` doesn't exist, run:
```bash
cp config.example.js config.js
```
Then edit `config.js` with your API key.

### "404 Not Found" or "Connection refused"

Make sure the server is running:
```bash
npm start
```

You should see the "Server running..." message.

### Messages aren't appearing

1. Check the browser console (F12) for errors
2. Check the terminal where the server is running for errors
3. Verify your API key is valid at [console.anthropic.com](https://console.anthropic.com)

## 🎨 Customization Ideas for Students

### Easy Changes:
- Change colors in `sketch.js` (lines 88, 92)
- Modify canvas size (line 27)
- Change the title text (line 75)
- Adjust message spacing (lines 126, 130)

### Intermediate Challenges:
- Add a "Clear Chat" button
- Save conversation history to localStorage
- Add different colors for different types of messages
- Create a typing animation
- Add message timestamps

### Advanced Projects:
- Add support for streaming responses
- Implement message editing
- Add file upload capability
- Create different "personas" for Claude
- Build a voice interface

## 📚 Learning Resources

- [p5.js Reference](https://p5js.org/reference/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [JavaScript Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🔒 Security Notes

- **Never share your API key** publicly
- **Never commit `config.js`** to git (it's already in `.gitignore`)
- The `config.example.js` file is safe to share
- Monitor your API usage at [console.anthropic.com](https://console.anthropic.com)
- Files in `.gitignore`: `config.js`, `node_modules/`, `libraries/`, `.env`, and system files

## 📝 License

This project is intended for educational purposes. Feel free to use, modify, and share!

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to modify and improve this code for your students!

## ❓ Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console for error messages (browser and terminal)
3. Verify your API key is active
4. Make sure Node.js and npm are properly installed

---

**Happy coding! 🚀**
