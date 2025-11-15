/*
 * CHAT WITH CLAUDE - A p5.js + AI Application
 * This sketch creates a chat interface where users can talk with Claude AI
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Where to send our messages (our server acts as a middleman to Claude)
const API_URL = "http://localhost:3000/api/chat";

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let inputField;              // Text box where user types
let submitButton;            // Button to send messages
let conversationHistory = []; // Array storing all messages back and forth
let isLoading = false;       // Are we waiting for Claude to respond?

// =============================================================================
// SETUP - Runs once when the program starts
// =============================================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create text input box at top of screen
  inputField = createInput("");
  inputField.position(20, 20);
  inputField.size(width - 140, 40);
  inputField.attribute("placeholder", "Type your message here...");

  // Create send button next to input box
  submitButton = createButton("Send");
  submitButton.position(width - 100, 20);
  submitButton.size(80, 40);
  submitButton.mousePressed(sendMessage); // When clicked, call sendMessage()

  // Allow Enter key to send message (instead of clicking button)
  inputField.elt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Set default text settings
  textAlign(LEFT, TOP);
  textSize(14);
}

// =============================================================================
// DRAW - Runs 60 times per second, displays everything on screen
// =============================================================================

function draw() {
  background(240); // Light gray background

  // Draw all messages starting below the input
  let yPos = 80;
  textSize(16);

  for (let msg of conversationHistory) {
    if (msg.role === "user") {
      fill(0, 0, 255);
      text("You: " + msg.content, 20, yPos);
    } else if (msg.role === "assistant") {
      fill(255, 0, 0);
      text("Claude: " + msg.content, 20, yPos);
    }
    yPos += 25;
  }

  // Show loading indicator
  if (isLoading) {
    fill(100);
    textStyle(ITALIC);
    text("Claude is typing...", 20, yPos);
    textStyle(NORMAL);
  }
}

// =============================================================================
// SENDING MESSAGES TO CLAUDE
// =============================================================================

async function sendMessage() {
  // Don't send if we're already waiting or if input is empty
  if (isLoading || inputField.value().trim() === "") {
    return;
  }

  // Get the user's message and clear the input box
  let userMessage = inputField.value().trim();
  inputField.value("");

  // Add user's message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  // Show loading indicator
  isLoading = true;

  try {
    // Send request to our server (which talks to Claude)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",  // Which AI model to use
        max_tokens: 1024,                      // Maximum length of response
        messages: conversationHistory          // All previous messages
      })
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Read the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Add placeholder for assistant's response (after we know streaming started successfully)
    conversationHistory.push({
      role: "assistant",
      content: ""
    });

    // Hide loading indicator now that we have a response container
    isLoading = false;

    // Get reference to the assistant's message we're building
    const assistantMessage = conversationHistory[conversationHistory.length - 1];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);

            // Handle content_block_delta events
            if (event.type === 'content_block_delta' && event.delta?.text) {
              assistantMessage.content += event.delta.text;
            }

          } catch (e) {
            // Skip unparseable lines
          }
        }
      }
    }

  } catch (error) {
    // If something goes wrong, show error message
    console.error("Error calling Anthropic API:", error);

    // Add error message to conversation
    conversationHistory.push({
      role: "assistant",
      content: "Error: " + error.message
    });

    // Hide loading indicator
    isLoading = false;
  }
}
