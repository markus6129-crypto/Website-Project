// FlashEspañol — frontend logic
// Handles deck loading, category filter, flip, rating, score, streak,
// pronunciation, keyboard shortcuts, and dark mode.

let allCards = [];          // Full deck from the server
let cards = [];             // Currently active deck (filtered by category)
let currentIndex = 0;
let score = 0;
let streak = 0;
let currentCategory = 'all';

// DOM references
const cardEl = document.getElementById('card');
const spanishEl = document.getElementById('spanish-word');
const englishEl = document.getElementById('english-word');
const frontCategoryEl = document.getElementById('front-category');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const speakerBtn = document.getElementById('speaker-btn');
const knowBtn = document.getElementById('know-btn');
const dontKnowBtn = document.getElementById('dont-know-btn');
const ratingEl = document.getElementById('rating');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const categoryEl = document.getElementById('categories');

// ===== Dark mode (saved in browser between visits) =====
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
}
const savedTheme = localStorage.getItem('flashesp-theme') === 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('flashesp-theme', isDark ? 'dark' : 'light');
});

// ===== Show current card =====
function showCard() {
  if (cards.length === 0) {
    spanishEl.textContent = 'No cards';
    englishEl.textContent = 'Try another category';
    progressEl.textContent = '0/0';
    return;
  }
  cardEl.classList.remove('flipped', 'correct', 'incorrect');
  ratingEl.classList.remove('visible');
  const card = cards[currentIndex];
  spanishEl.textContent = card.spanish;
  englishEl.textContent = card.english;
  frontCategoryEl.textContent = card.category;
  progressEl.textContent = `${currentIndex + 1}/${cards.length}`;
}

// ===== Filter by category =====
function filterByCategory(category) {
  currentCategory = category;
  cards = category === 'all'
    ? [...allCards]
    : allCards.filter(c => c.category === category);
  currentIndex = 0;
  showCard();
}

categoryEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('chip')) return;
  // Update active chip
  categoryEl.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  filterByCategory(e.target.dataset.category);
});

// ===== Flip card (click or keyboard) =====
function flipCard() {
  if (cards.length === 0) return;
  cardEl.classList.toggle('flipped');
  // Show rating buttons once user has seen the answer
  if (cardEl.classList.contains('flipped')) {
    ratingEl.classList.add('visible');
  }
}

cardEl.addEventListener('click', (e) => {
  // Don't flip if the speaker button was clicked
  if (e.target.closest('.speaker-btn')) return;
  flipCard();
});

cardEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    flipCard();
  }
});

// ===== Pronunciation using browser's built-in voice =====
speakerBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // don't flip the card
  if (cards.length === 0) return;
  const word = cards[currentIndex].spanish;
  // Cancel any speech in progress to avoid overlap
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es-ES'; // Spanish (Spain)
  utterance.rate = 0.9;     // Slightly slower for beginners
  window.speechSynthesis.speak(utterance);
});

// ===== Navigation =====
nextBtn.addEventListener('click', () => {
  if (cards.length === 0) return;
  currentIndex = (currentIndex + 1) % cards.length;
  showCard();
});

prevBtn.addEventListener('click', () => {
  if (cards.length === 0) return;
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  showCard();
});

shuffleBtn.addEventListener('click', () => {
  if (cards.length === 0) return;
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentIndex = 0;
  showCard();
});

// ===== Self-rating + score + streak =====
function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = `${streak} 🔥`;
}

knowBtn.addEventListener('click', () => {
  score += 10;
  streak += 1;
  updateStats();
  cardEl.classList.add('correct');
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    showCard();
  }, 500);
});

dontKnowBtn.addEventListener('click', () => {
  streak = 0; // reset streak
  updateStats();
  cardEl.classList.add('incorrect');
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    showCard();
  }, 500);
});

// ===== Keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing somewhere
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  // Ignore if the card itself has focus (it handles its own keys)
  if (e.target === cardEl) return;

  if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
  else if (e.key === 's' || e.key === 'S') { e.preventDefault(); shuffleBtn.click(); }
  else if (e.key === ' ') { e.preventDefault(); flipCard(); }
});

// ===== Load the deck =====
fetch('/api/cards')
  .then((res) => res.json())
  .then((data) => {
    allCards = data;
    cards = [...allCards];
    showCard();
    updateStats();
  })
  .catch((err) => {
    console.error('Failed to load cards:', err);
    spanishEl.textContent = 'Error';
    englishEl.textContent = 'Could not load deck';
  });
