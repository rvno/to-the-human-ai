/*
 * TO THE HUMAN - An AI-Powered Self-Reflection Experience
 * Users answer questions about their humanity, building an ASCII portrait of themselves
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_URL = "http://localhost:3000/api/chat";

// =============================================================================
// QUESTIONS
// =============================================================================

const questions = [
  "What's a moment from your past that you return to when you need comfort?",
  "Describe someone who changed you just by knowing them.",
  "What have you had to let go of, even though part of you wanted to hold on forever?",
  "What truth about yourself are you still learning to accept?",
  "When was the last time something small made you unreasonably happy?",
  "What do you do that makes you feel like yourself?",
  "What are you quietly hoping for, even if you don't say it out loud?",
  "What two opposite things are both true about you right now?"
];

// Map questions to body regions
const questionToRegion = [
  'head',       // Q0: Memory - where thoughts live
  'heart',      // Q1: Connection - center of feeling
  'leftHand',   // Q2: Loss - letting go
  'gut',        // Q3: Fear/Truth - gut feeling
  'face',       // Q4: Joy - expression
  'shoulders',  // Q5: Purpose - what you carry
  'rightHand',  // Q6: Hope - reaching forward
  'fullBody'    // Q7: Paradox - all of it
];

// =============================================================================
// GLOBAL STATE
// =============================================================================

let currentQuestionIndex = 0;
let answers = []; // {question, answer, emotion, color, scale}
let currentAnswer = "";
let isAnalyzing = false;
let isComplete = false;

// UI Elements
let inputField;
let submitButton;
let viewResultsButton;
let qaLogContainer;

// ASCII Figure
let asciiChars = [];
let figureTemplate = [];
const defaultChars = ['?', '!', '.', ':', ')', '(', '/', '\\', '~', '*'];

// Animation
let charCycleSpeed = 0.02;
let questionContainer;

// Typewriter animation
let typewriterAnswers = []; // Stores {text, currentIndex, targetIndex, color, yPos}

// Final reflection data
let reflectionText = "";
let emotionBreakdown = {};
let emotionKeywordsUsed = {}; // Track which keywords triggered each emotion
let archetypePhrase = "";
let dominantEmotion = "";

// Pie chart interaction
let hoveredSlice = null;
let pieSlices = []; // Store slice data for hover detection

// =============================================================================
// EMOTION ANALYSIS
// =============================================================================

const emotionKeywords = {
  wonder: ['beautiful', 'amazing', 'alive', 'magic', 'awe', 'wonder', 'incredible', 'startle', 'surprise', 'breathtaking', 'mesmerize', 'extraordinary', 'magnificent', 'stunning', 'remarkable'],
  joy: ['happy', 'laugh', 'joy', 'delight', 'sunshine', 'smile', 'fun', 'bright', 'giggle', 'cheerful', 'excited', 'thrill', 'elated', 'bliss', 'glee', 'ecstatic'],
  love: ['love', 'heart', 'connection', 'together', 'care', 'close', 'bond', 'cherish', 'adore', 'warmth', 'tender', 'affection', 'devotion', 'embrace', 'beloved', 'precious'],
  grief: ['loss', 'miss', 'gone', 'goodbye', 'empty', 'lost', 'never', 'anymore', 'ache', 'mourn', 'sorrow', 'absence', 'tears', 'grief', 'departed', 'void'],
  fear: ['afraid', 'scared', 'worry', 'anxious', 'uncertain', 'fear', 'nervous', 'doubt', 'terrified', 'panic', 'dread', 'overwhelmed', 'uneasy', 'stress'],
  peace: ['calm', 'peace', 'serene', 'tranquil', 'settled'],
  hope: ['hope', 'tomorrow', 'dream', 'wish', 'future', 'someday', 'will', 'possibility', 'maybe', 'aspire', 'imagine', 'optimistic', 'faith', 'believe', 'envision', 'forward'],
  longing: ['want', 'yearn', 'crave', 'desire', 'long', 'wish', 'ache', 'hunger', 'need', 'seek', 'search', 'miss', 'longing', 'yearn', 'pine']
};

const emotionColors = {
  wonder: '#F7DC6F',    // Light gold
  joy: '#FFD700',       // Warm gold
  love: '#FF6B9D',      // Soft pink
  grief: '#4A5899',     // Deep blue
  fear: '#708090',      // Gray
  peace: '#98D8C8',     // Soft green
  hope: '#87CEEB',      // Bright blue
  longing: '#DDA0DD'    // Plum
};

function analyzeEmotion(text) {
  const lowerText = text.toLowerCase();
  let scores = {};
  let keywordsFound = {};

  // Initialize scores
  for (let emotion in emotionKeywords) {
    scores[emotion] = 0;
    keywordsFound[emotion] = [];
  }

  // Count keyword matches and track which keywords were found
  for (let emotion in emotionKeywords) {
    emotionKeywords[emotion].forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[emotion]++;
        keywordsFound[emotion].push(keyword);
      }
    });
  }

  // Find dominant emotion
  let maxEmotion = 'peace'; // default
  let maxScore = 0;
  for (let emotion in scores) {
    if (scores[emotion] > maxScore) {
      maxScore = scores[emotion];
      maxEmotion = emotion;
    }
  }

  // Store keywords for this emotion
  if (!emotionKeywordsUsed[maxEmotion]) {
    emotionKeywordsUsed[maxEmotion] = [];
  }
  emotionKeywordsUsed[maxEmotion] = emotionKeywordsUsed[maxEmotion].concat(keywordsFound[maxEmotion]);

  return maxEmotion;
}

function getEmotionColor(emotion) {
  return emotionColors[emotion] || '#CCCCCC';
}

// =============================================================================
// TEXT ANIMATION FUNCTIONS
// =============================================================================

function animateTitle() {
  const titleContainer = document.getElementById('title-container');
  const titleText = "To the Human AI";

  // Split text into words to prevent word breaks
  titleContainer.innerHTML = '';
  const words = titleText.split(' ');

  words.forEach((word, wordIndex) => {
    // Create word wrapper to keep words together
    const wordWrapper = document.createElement('span');
    wordWrapper.className = 'word-wrapper';

    // Split word into characters
    const chars = word.split('');
    chars.forEach((char, charIndex) => {
      // Create char wrapper for overflow hidden effect
      const charWrapper = document.createElement('span');
      charWrapper.className = 'char-wrapper';

      // Create the character span
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char;

      charWrapper.appendChild(span);
      wordWrapper.appendChild(charWrapper);
    });

    titleContainer.appendChild(wordWrapper);
  });

  // Animate each character with unified motion - slide up from below with blur
  gsap.to('#title-container .char', {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.025,
    delay: 0.1
  });
}

function animateQuestion(questionText) {
  // Get the question container
  questionContainer = document.getElementById('question-container');

  // Split text into words to prevent word breaks
  questionContainer.innerHTML = '';
  const words = questionText.split(' ');

  words.forEach((word, wordIndex) => {
    // Create word wrapper to keep words together
    const wordWrapper = document.createElement('span');
    wordWrapper.className = 'word-wrapper';

    // Split word into characters
    const chars = word.split('');
    chars.forEach((char, charIndex) => {
      // Create char wrapper for overflow hidden effect
      const charWrapper = document.createElement('span');
      charWrapper.className = 'char-wrapper';

      // Create the character span
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char;

      charWrapper.appendChild(span);
      wordWrapper.appendChild(charWrapper);
    });

    questionContainer.appendChild(wordWrapper);
  });

  // Animate each character with unified motion - slide up from below with blur
  gsap.to('#question-container .char', {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.025,
    delay: 0.3
  });
}

function clearQuestion() {
  questionContainer = document.getElementById('question-container');
  gsap.to('#question-container .char', {
    opacity: 0,
    y: 20,
    duration: 0.4,
    ease: 'power2.in',
    stagger: 0.02,
    onComplete: () => {
      questionContainer.innerHTML = '';
    }
  });
}

// =============================================================================
// ASCII FIGURE GENERATION
// =============================================================================

function createFigureTemplate() {
  figureTemplate = [];

  const centerX = windowWidth * 0.75;
  const centerY = windowHeight * 0.5;
  const scale = 2;
  const density = 6; // Spacing between points

  // HEAD (region: 'head') - Simple oval silhouette
  for (let angle = 0; angle < TWO_PI; angle += 0.2) {
    let radiusX = 28;
    let radiusY = 32;
    let x = centerX + cos(angle) * radiusX * scale;
    let y = centerY - 110 * scale + sin(angle) * radiusY * scale;
    figureTemplate.push({ x, y, region: 'head' });
  }

  // Fill head
  for (let py = -140; py < -80; py += density) {
    for (let px = -25; px < 25; px += density) {
      let dist = sqrt(px * px / (28 * 28) + (py + 110) * (py + 110) / (32 * 32));
      if (dist < 1) {
        figureTemplate.push({
          x: centerX + px * scale,
          y: centerY + py * scale,
          region: 'head'
        });
      }
    }
  }

  // FACE (region: 'face') - minimal features
  for (let px = -12; px < 13; px += density) {
    for (let py = -120; py < -100; py += density) {
      figureTemplate.push({
        x: centerX + px * scale,
        y: centerY + py * scale,
        region: 'face'
      });
    }
  }

  // NECK (connecting)
  for (let py = -80; py < -50; py += density) {
    for (let px = -10; px < 10; px += density) {
      figureTemplate.push({
        x: centerX + px * scale,
        y: centerY + py * scale,
        region: 'heart'
      });
    }
  }

  // SHOULDERS (region: 'shoulders')
  for (let px = -45; px < 45; px += density) {
    let py = -50 + Math.abs(px) * 0.15;
    for (let dy = 0; dy < 8; dy += density) {
      figureTemplate.push({
        x: centerX + px * scale,
        y: centerY + (py + dy) * scale,
        region: 'shoulders'
      });
    }
  }

  // TORSO (region: 'heart' for upper, 'gut' for lower)
  for (let py = -42; py < 40; py += density) {
    let t = (py + 42) / 82;
    let width = lerp(40, 32, t);
    let region = py < 0 ? 'heart' : 'gut';

    for (let px = -width; px < width; px += density) {
      figureTemplate.push({
        x: centerX + px * scale,
        y: centerY + py * scale,
        region
      });
    }
  }

  // LEFT ARM (region: 'leftHand')
  for (let i = 0; i < 50; i += density) {
    let t = i / 50;
    let x = -45 - t * 20 - sin(t * PI) * 10;
    let y = -40 + t * 65;
    let width = lerp(7, 3, t);

    for (let w = -width; w < width; w += density) {
      figureTemplate.push({
        x: centerX + (x + w) * scale,
        y: centerY + y * scale,
        region: 'leftHand'
      });
    }
  }

  // RIGHT ARM (region: 'rightHand')
  for (let i = 0; i < 50; i += density) {
    let t = i / 50;
    let x = 45 + t * 20 + sin(t * PI) * 10;
    let y = -40 + t * 65;
    let width = lerp(7, 3, t);

    for (let w = -width; w < width; w += density) {
      figureTemplate.push({
        x: centerX + (x + w) * scale,
        y: centerY + y * scale,
        region: 'rightHand'
      });
    }
  }

  // LEGS (region: 'fullBody')
  for (let leg = -1; leg <= 1; leg += 2) {
    for (let i = 0; i < 80; i += density) {
      let t = i / 80;
      let x = leg * 15;
      let y = 40 + i;
      let width = lerp(8, 4, t);

      for (let w = -width; w < width; w += density) {
        figureTemplate.push({
          x: centerX + (x + w) * scale,
          y: centerY + y * scale,
          region: 'fullBody'
        });
      }
    }
  }
}

function initializeASCIIChars() {
  asciiChars = [];

  for (let point of figureTemplate) {
    asciiChars.push({
      x: point.x,
      y: point.y,
      char: random(defaultChars),
      color: color(200),
      region: point.region,
      cyclePhase: random(TWO_PI)
    });
  }
}

function updateASCIIWithAnswer(answerText, emotion, questionIndex) {
  const targetRegion = questionToRegion[questionIndex];
  const answerColor = color(getEmotionColor(emotion));

  // Get all characters from the answer
  let answerChars = answerText.split('').filter(c => c.trim() !== '');

  // Find indices of ASCII chars in the target region
  let regionIndices = [];
  for (let i = 0; i < asciiChars.length; i++) {
    // For fullBody, only update if not already colored by another answer
    if (targetRegion === 'fullBody') {
      // Check if this char hasn't been updated yet (still has default gray)
      if (red(asciiChars[i].color) === 200 && green(asciiChars[i].color) === 200 && blue(asciiChars[i].color) === 200) {
        regionIndices.push(i);
      }
    } else if (asciiChars[i].region === targetRegion) {
      regionIndices.push(i);
    }
  }

  // Replace characters in the region
  for (let i = 0; i < regionIndices.length; i++) {
    if (answerChars.length > 0) {
      let idx = regionIndices[i];
      asciiChars[idx].char = answerChars[i % answerChars.length];
      asciiChars[idx].color = color(answerColor); // Create new color object to avoid reference issues
    }
  }
}

function drawASCII() {
  push();
  textAlign(CENTER, CENTER);
  textSize(12);

  for (let ch of asciiChars) {
    // Subtle animation
    let wobbleX = sin(frameCount * charCycleSpeed + ch.cyclePhase) * 2;
    let wobbleY = cos(frameCount * charCycleSpeed + ch.cyclePhase) * 2;

    fill(ch.color);
    noStroke();
    text(ch.char, ch.x + wobbleX, ch.y + wobbleY);
  }

  pop();
}

// =============================================================================
// UI RENDERING
// =============================================================================

function drawQuestionSection() {
  push();

  // Left half background
  fill(250, 248, 245);
  noStroke();
  rect(0, 0, windowWidth / 2, windowHeight);

  // Question handled by HTML div with GSAP at the top
  // Q&A Log handled by HTML scrollable container

  pop();
}

function updateQALog() {
  qaLogContainer = document.getElementById('qa-log-container');
  if (!qaLogContainer) return;

  let html = '';

  // Build Q&A pairs from oldest to newest
  for (let i = 0; i < answers.length; i++) {
    let qa = answers[i];

    // Update scale for completed answers
    if (qa.typewriterIndex >= qa.answer.length && qa.scale > 0.7) {
      qa.scale = lerp(qa.scale, 0.7, 0.05);
    }

    let currentScale = qa.scale || 1.0;
    let displayText = qa.answer;

    // Typewriter effect
    if (qa.typewriterIndex !== undefined && qa.typewriterIndex < qa.answer.length) {
      displayText = qa.answer.substring(0, qa.typewriterIndex);
    }

    let colorHex = rgbToHex(qa.color);

    html += `
      <div class="qa-pair" style="margin-bottom: 20px; transform: scale(${currentScale}); transform-origin: left top;">
        <p style="font-style: italic; color: #646464; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">
          Q: ${escapeHtml(qa.question)}
        </p>
        <p style="color: ${colorHex}; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
          A: ${escapeHtml(displayText)}
        </p>
      </div>
    `;
  }

  qaLogContainer.innerHTML = html;

  // Auto-scroll to bottom
  qaLogContainer.scrollTop = qaLogContainer.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function rgbToHex(c) {
  if (typeof c === 'string') return c;
  let r = Math.round(red(c));
  let g = Math.round(green(c));
  let b = Math.round(blue(c));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Update typewriter animations
function updateTypewriter() {
  for (let qa of answers) {
    if (qa.typewriterIndex !== undefined && qa.typewriterIndex < qa.answer.length) {
      // Increment by a speed factor (2 chars per frame for smooth typing)
      qa.typewriterIndex = min(qa.typewriterIndex + 2, qa.answer.length);
    }
  }
}

function drawLoadingAnimation() {
  push();

  fill(150);
  textAlign(CENTER, CENTER);
  textSize(16);

  let dots = '.'.repeat((frameCount / 20) % 4);

  // Check if this is the final question
  if (currentQuestionIndex >= questions.length) {
    text("Analyzing your humanity" + dots, windowWidth / 4, windowHeight / 2);
  } else {
    text("Reflecting" + dots, windowWidth / 4, windowHeight - 100);
  }

  pop();
}

function showResultsModal() {
  const modal = document.getElementById('results-modal');
  const modalInner = document.getElementById('modal-inner');

  // Get top 3 keywords for each emotion
  let topKeywords = {};
  for (let emotion in emotionBreakdown) {
    if (emotionKeywordsUsed[emotion] && emotionKeywordsUsed[emotion].length > 0) {
      // Count frequency of each keyword
      let freq = {};
      emotionKeywordsUsed[emotion].forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
      });

      // Sort by frequency and get top 3
      let sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
      topKeywords[emotion] = sorted.slice(0, 3);
    } else {
      // Fallback: extract top words from answers with this emotion
      let words = [];
      for (let qa of answers) {
        if (qa.emotion === emotion) {
          // Extract words from answer (filter out common words)
          let answerWords = qa.answer.toLowerCase()
            .replace(/[.,!?;:]/g, '')
            .split(' ')
            .filter(w => w.length > 3 && !['that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'what', 'when', 'where'].includes(w));
          words = words.concat(answerWords);
        }
      }

      // Count frequency
      let freq = {};
      words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
      });

      // Sort by frequency and get top 3
      let sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
      topKeywords[emotion] = sorted.slice(0, 3);
    }
  }

  // Build modal HTML
  let html = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 36px; color: #3C3C3C; margin: 0 0 10px 0; font-weight: bold;">
        ${archetypePhrase}
      </h1>
      <p style="font-size: 20px; color: #666; font-style: italic; margin: 0;">
        Driven by ${dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start;">
      <!-- Left: Reflection Text -->
      <div style="padding-right: 20px;">
        <h2 style="font-size: 22px; color: #3C3C3C; margin: 0 0 20px 0;">Your Reflection</h2>
        <p style="font-size: 16px; line-height: 1.8; color: #444;">
          ${reflectionText}
        </p>
      </div>

      <!-- Right: Pie Chart -->
      <div id="pie-chart-container" style="display: flex; flex-direction: column; align-items: center;">
        <h2 style="font-size: 22px; color: #3C3C3C; margin: 0 0 20px 0;">Emotional Profile</h2>
        <canvas id="pie-canvas" width="400" height="400"></canvas>
      </div>
    </div>

    <div class="pie-tooltip" id="pie-tooltip"></div>
  `;

  modalInner.innerHTML = html;
  modal.style.display = 'block';

  // Draw pie chart on canvas
  setTimeout(() => {
    drawPieChartCanvas(topKeywords);
  }, 100);
}

function drawPieChartCanvas(topKeywords) {
  const canvas = document.getElementById('pie-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const centerX = 200;
  const centerY = 200;
  const radius = 120;

  // Calculate total
  let total = 0;
  for (let emotion in emotionBreakdown) {
    total += emotionBreakdown[emotion];
  }

  if (total === 0) return;

  let startAngle = -Math.PI / 2;
  pieSlices = [];

  // Draw slices
  for (let emotion in emotionBreakdown) {
    let value = emotionBreakdown[emotion];
    let sliceAngle = (value / total) * Math.PI * 2;
    let endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.fillStyle = emotionColors[emotion] || '#CCCCCC';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    // White border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Store slice data for hover
    pieSlices.push({
      emotion: emotion,
      startAngle: startAngle,
      endAngle: endAngle,
      percentage: Math.round((value / total) * 100),
      keywords: topKeywords[emotion] || []
    });

    startAngle = endAngle;
  }

  // Draw center circle (donut)
  ctx.fillStyle = '#FAF8F5';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Center text
  ctx.fillStyle = '#3C3C3C';
  ctx.font = '14px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Emotional', centerX, centerY - 8);
  ctx.fillText('Profile', centerX, centerY + 8);

  // Add hover listener
  canvas.addEventListener('mousemove', handlePieHover);
  canvas.addEventListener('mouseleave', hidePieTooltip);
}

function handlePieHover(event) {
  const canvas = document.getElementById('pie-canvas');
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = 200;
  const centerY = 200;

  // Calculate angle and distance
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  let angle = Math.atan2(dy, dx);

  // Normalize angle to match our pie chart (starting from top)
  angle = angle + Math.PI / 2;
  if (angle < 0) angle += Math.PI * 2;

  // Check if hovering over a slice (not center hole)
  const radius = 120;
  if (distance < radius * 0.4 || distance > radius) {
    hidePieTooltip();
    return;
  }

  // Find which slice
  for (let slice of pieSlices) {
    let start = slice.startAngle + Math.PI / 2;
    let end = slice.endAngle + Math.PI / 2;

    if (start < 0) start += Math.PI * 2;
    if (end < 0) end += Math.PI * 2;

    if (start > end) {
      // Slice crosses zero
      if (angle >= start || angle <= end) {
        showPieTooltip(slice, event.clientX, event.clientY);
        return;
      }
    } else {
      if (angle >= start && angle <= end) {
        showPieTooltip(slice, event.clientX, event.clientY);
        return;
      }
    }
  }

  hidePieTooltip();
}

function showPieTooltip(slice, x, y) {
  const tooltip = document.getElementById('pie-tooltip');
  if (!tooltip) return;

  let keywordText = slice.keywords.length > 0
    ? slice.keywords.join(', ')
    : 'No keywords detected';

  tooltip.innerHTML = `
    <strong>${slice.emotion.charAt(0).toUpperCase() + slice.emotion.slice(1)}</strong>: ${slice.percentage}%<br>
    <span style="font-size: 12px; opacity: 0.9;">Keywords: ${keywordText}</span>
  `;

  tooltip.style.left = (x + 15) + 'px';
  tooltip.style.top = (y - 15) + 'px';
  tooltip.style.display = 'block';
}

function hidePieTooltip() {
  const tooltip = document.getElementById('pie-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

// =============================================================================
// SETUP
// =============================================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create ASCII figure
  createFigureTemplate();
  initializeASCIIChars();

  // Create input field
  let elementWidth = windowWidth / 2 - 80;
  inputField = createElement('textarea');
  inputField.position(40, windowHeight - 190);
  inputField.size(elementWidth, 100);
  inputField.attribute('placeholder', 'Type your answer here...');
  inputField.style('font-size', '16px');
  inputField.style('padding', '10px');
  inputField.style('border-radius', '8px');
  inputField.style('border', '2px solid #DDD');
  inputField.style('font-family', 'Georgia, serif');
  inputField.style('resize', 'none');
  inputField.style('box-sizing', 'border-box');

  // Add Enter key to submit
  inputField.elt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // Create submit button (underneath textarea with 15px margin)
  submitButton = createButton('Continue');
  submitButton.position(40, windowHeight - 75);
  submitButton.size(elementWidth, 50);
  submitButton.mousePressed(handleSubmit);
  submitButton.style('font-size', '16px');
  submitButton.style('border-radius', '8px');
  submitButton.style('border', 'none');
  submitButton.style('background-color', '#98D8C8');
  submitButton.style('cursor', 'pointer');
  submitButton.style('font-family', 'Georgia, serif');
  submitButton.style('box-sizing', 'border-box');

  // Create view results button (hidden initially)
  viewResultsButton = createButton('View Results');
  viewResultsButton.position(windowWidth * 0.75 - 100, windowHeight - 100);
  viewResultsButton.size(200, 60);
  viewResultsButton.mousePressed(showResultsModal);
  viewResultsButton.style('font-size', '18px');
  viewResultsButton.style('border-radius', '12px');
  viewResultsButton.style('border', 'none');
  viewResultsButton.style('background-color', '#98D8C8');
  viewResultsButton.style('cursor', 'pointer');
  viewResultsButton.style('font-family', 'Georgia, serif');
  viewResultsButton.style('box-sizing', 'border-box');
  viewResultsButton.style('font-weight', 'bold');
  viewResultsButton.hide();

  textFont('Georgia');

  // Set up modal close button
  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.onclick = function() {
      document.getElementById('results-modal').style.display = 'none';
    };
  }

  // Close modal when clicking outside of it
  window.onclick = function(event) {
    const modal = document.getElementById('results-modal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // Animate title first
  setTimeout(() => {
    animateTitle();
  }, 300);

  // Then animate first question
  setTimeout(() => {
    animateQuestion(questions[0]);
  }, 1200); // Delayed to let title finish first
}

// =============================================================================
// DRAW LOOP
// =============================================================================

function draw() {
  background(255);

  if (isComplete) {
    // Just show ASCII with view results button
    drawQuestionSection();
    drawASCII();
    inputField.hide();
    submitButton.hide();

    if (viewResultsButton) {
      viewResultsButton.show();
    }
  } else {
    // Update typewriter animations
    updateTypewriter();
    updateQALog();

    // Draw split screen
    drawQuestionSection();
    drawASCII();

    // Draw loading
    if (isAnalyzing) {
      drawLoadingAnimation();
    }
  }
}

// =============================================================================
// INTERACTION
// =============================================================================

function handleSubmit() {
  if (isAnalyzing) return;

  let answer = inputField.value().trim();
  if (answer === "") return;

  // Clear current question with animation
  clearQuestion();

  // Show loading
  isAnalyzing = true;

  // Disable inputs
  inputField.attribute('disabled', '');
  submitButton.attribute('disabled', '');
  inputField.style('opacity', '0.5');
  submitButton.style('opacity', '0.5');
  submitButton.style('cursor', 'not-allowed');

  // Analyze emotion
  setTimeout(() => {
    let emotion = analyzeEmotion(answer);
    let emotionColor = color(getEmotionColor(emotion));

    // Store answer with typewriter starting index and scale
    answers.push({
      question: questions[currentQuestionIndex],
      answer: answer,
      emotion: emotion,
      color: emotionColor,
      typewriterIndex: 0,  // Start typewriter animation from 0
      scale: 1.0  // Start at full scale
    });

    // Update ASCII figure
    updateASCIIWithAnswer(answer, emotion, currentQuestionIndex);

    // Clear input
    inputField.value('');

    // Move to next question or finish
    currentQuestionIndex++;

    if (currentQuestionIndex >= questions.length) {
      // Show analyzing overlay with gradient from user's emotions
      showAnalyzingOverlay();

      // Generate final reflection
      generateReflection();
    } else {
      // Re-enable inputs
      inputField.removeAttribute('disabled');
      submitButton.removeAttribute('disabled');
      inputField.style('opacity', '1');
      submitButton.style('opacity', '1');
      submitButton.style('cursor', 'pointer');

      // Animate next question after clearing animation completes
      setTimeout(() => {
        animateQuestion(questions[currentQuestionIndex]);
        isAnalyzing = false;
      }, 1000); // Increased delay to allow clear animation to complete
    }
  }, 800); // Simulate analysis time
}

// =============================================================================
// ANALYZING OVERLAY
// =============================================================================

function showAnalyzingOverlay() {
  const overlay = document.getElementById('analyzing-overlay');
  const text = document.getElementById('analyzing-text');

  // Build gradient from user's emotion colors
  let colors = [];
  for (let qa of answers) {
    colors.push(rgbToHex(qa.color));
  }

  // If we have colors, use them; otherwise use defaults
  if (colors.length > 0) {
    text.style.background = `linear-gradient(90deg, ${colors.join(', ')})`;
    text.style.backgroundSize = '200% 200%';
  }

  overlay.style.display = 'flex';
}

function hideAnalyzingOverlay() {
  const overlay = document.getElementById('analyzing-overlay');
  overlay.style.display = 'none';
}

// =============================================================================
// FINAL REFLECTION GENERATION
// =============================================================================

async function generateReflection() {
  // Calculate emotion breakdown
  emotionBreakdown = {};
  for (let qa of answers) {
    if (!emotionBreakdown[qa.emotion]) {
      emotionBreakdown[qa.emotion] = 0;
    }
    emotionBreakdown[qa.emotion]++;
  }

  // Find dominant emotion
  let maxCount = 0;
  for (let emotion in emotionBreakdown) {
    if (emotionBreakdown[emotion] > maxCount) {
      maxCount = emotionBreakdown[emotion];
      dominantEmotion = emotion;
    }
  }

  // Prepare conversation for Claude
  let reflectionPrompt = `I've had a conversation with someone about their humanity. They answered these questions:\n\n`;

  for (let qa of answers) {
    reflectionPrompt += `Q: ${qa.question}\n`;
    reflectionPrompt += `A: ${qa.answer}\n\n`;
  }

  reflectionPrompt += `Based on these answers, write:\n1. A poetic archetype phrase (like "The Keeper of Quiet Joys" or "The Wanderer Between Worlds") - just the phrase, nothing else on this line\n2. A compassionate, uplifting reflection (2-3 paragraphs) that addresses them directly but politely, seeing beauty in their complexity and struggles. Be truthful but kind. Avoid using "you" too much - instead describe what their answers reveal. Be optimistic about any challenges they mention.\n\nFormat your response as:\nARCHETYPE: [your archetype phrase]\nREFLECTION: [your reflection text]`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: reflectionPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              fullResponse += event.delta.text;
            }
          } catch (e) {
            // Skip unparseable lines
          }
        }
      }
    }

    // Parse response
    const archetypeMatch = fullResponse.match(/ARCHETYPE:\s*(.+?)(?:\n|$)/);
    const reflectionMatch = fullResponse.match(/REFLECTION:\s*([\s\S]+)/);

    if (archetypeMatch) {
      archetypePhrase = archetypeMatch[1].trim();
    } else {
      archetypePhrase = "The Seeker of Truth";
    }

    if (reflectionMatch) {
      reflectionText = reflectionMatch[1].trim();
    } else {
      reflectionText = fullResponse;
    }

  } catch (error) {
    console.error("Error generating reflection:", error);
    archetypePhrase = "The Unique Soul";
    reflectionText = "There is something beautiful in the willingness to reflect, to answer honestly, to look inward. These answers reveal a person navigating the complexity of being human with grace and authenticity.";
  }

  // Hide analyzing overlay
  hideAnalyzingOverlay();

  isAnalyzing = false;
  isComplete = true;
}

// =============================================================================
// WINDOW RESIZE
// =============================================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createFigureTemplate();
  initializeASCIIChars();

  // Reapply all answers to rebuild the figure
  for (let i = 0; i < answers.length; i++) {
    updateASCIIWithAnswer(answers[i].answer, answers[i].emotion, i);
  }

  // Reposition input elements
  let elementWidth = windowWidth / 2 - 80;
  inputField.position(40, windowHeight - 190);
  inputField.size(elementWidth, 100);
  submitButton.position(40, windowHeight - 75);
  submitButton.size(elementWidth, 50);
}
