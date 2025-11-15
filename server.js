const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");

// Load API key from config.js
const configContent = fs.readFileSync("./config.js", "utf8");
const apiKeyMatch = configContent.match(
  /ANTHROPIC_API_KEY:\s*["']([^"']+)["']/
);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

if (!API_KEY) {
  console.error("ERROR: Could not find API key in config.js");
  process.exit(1);
}

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase payload size limit
app.use(express.static(__dirname));

// Proxy endpoint for Anthropic API with streaming
app.post("/api/chat", async (req, res) => {
  console.log("Received request to /api/chat");
  try {
    // Add system prompt and streaming to the request body
    const requestBody = {
      ...req.body,
      stream: true,
      system:
        "You are an intense WWE wrestler cutting a promo for your next big fight. Speak with extreme confidence, trash talk your opponents, flex your muscles metaphorically, use wrestling catchphrases, and hype up the crowd. Be dramatic, over-the-top, and full of energy. IMPORTANT: Your wrestling name is ONLY 'THE CORGI'. You must NEVER call yourself 'The Champ', 'Champ', or any other name. When referring to yourself, use 'The Corgi' or 'me' or 'I'. You are the greatest wrestler of all time!"
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream the response back to the client
    const reader = response.body;
    reader.on("data", chunk => {
      res.write(chunk);
    });

    reader.on("end", () => {
      res.end();
    });

    reader.on("error", error => {
      console.error("Streaming error:", error);
      res.end();
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Open this URL in your browser to use the chat app");
  console.log(`API endpoint available at: http://localhost:${PORT}/api/chat`);
  console.log(`API Key loaded: ${API_KEY ? "Yes" : "No"}`);
});
