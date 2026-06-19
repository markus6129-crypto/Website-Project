// FlashEspañol — static version (no server needed)
// The deck is embedded directly here so this works on any web host.

const DECK = [
  // Greetings & basics
  { spanish: 'Hola',         english: 'Hello',        category: 'greetings' },
  { spanish: 'Adiós',        english: 'Goodbye',      category: 'greetings' },
  { spanish: 'Por favor',    english: 'Please',       category: 'greetings' },
  { spanish: 'Gracias',      english: 'Thank you',    category: 'greetings' },
  { spanish: 'Sí',           english: 'Yes',          category: 'greetings' },
  { spanish: 'No',           english: 'No',           category: 'greetings' },
  { spanish: 'Buenos días',  english: 'Good morning', category: 'greetings' },
  { spanish: 'Buenas noches', english: 'Good night',  category: 'greetings' },

  // Numbers 1–10
  { spanish: 'Uno',    english: 'One',   category: 'numbers' },
  { spanish: 'Dos',    english: 'Two',   category: 'numbers' },
  { spanish: 'Tres',   english: 'Three', category: 'numbers' },
  { spanish: 'Cuatro', english: 'Four',  category: 'numbers' },
  { spanish: 'Cinco',  english: 'Five',  category: 'numbers' },
  { spanish: 'Seis',   english: 'Six',   category: 'numbers' },
  { spanish: 'Siete',  english: 'Seven', category: 'numbers' },
  { spanish: 'Ocho',   english: 'Eight', category: 'numbers' },
  { spanish: 'Nueve',  english: 'Nine',  category: 'numbers' },
  { spanish: 'Diez',   english: 'Ten',   category: 'numbers' },

  // Colors
  { spanish: 'Rojo',     english: 'Red',    category: 'colors' },
  { spanish: 'Azul',     english: 'Blue',   category: 'colors' },
  { spanish: 'Verde',    english: 'Green',  category: 'colors' },
  { spanish: 'Amarillo', english: 'Yellow', category: 'colors' },
  { spanish: 'Negro',    english: 'Black',  category: 'colors' },
  { spanish: 'Blanco',   english: 'White',  category: 'colors' },

  // Food & drink
  { spanish: 'Agua',    english: 'Water',   category: 'food' },
  { spanish: 'Pan',     english: 'Bread',   category: 'food' },
  { spanish: 'Leche',   english: 'Milk',    category: 'food' },
  { spanish: 'Café',    english: 'Coffee',  category: 'food' },
  { spanish: 'Manzana', english: 'Apple',   category: 'food' },
  { spanish: 'Queso',   english: 'Cheese',  category: 'food' },
  { spanish: 'Pollo',   english: 'Chicken', category: 'food' },
  { spanish: 'Arroz',   english: 'Rice',    category: 'food' },

  // Common verbs
  { spanish: 'Ser',    english: 'To be',        category: 'verbs' },
  { spanish: 'Tener',  english: 'To have',      category: 'verbs' },
  { spanish: 'Hacer',  english: 'To do / make', category: 'verbs' },
  { spanish: 'Ir',     english: 'To go',        category: 'verbs' },
  { spanish: 'Comer',  english: 'To eat',       category: 'verbs' },
  { spanish: 'Beber',  english: 'To drink',     category: 'verbs' },
  { spanish: 'Hablar', english: 'To speak',     category: 'verbs' },
  { spanish: 'Querer', english: 'To want',      category: 'verbs' }
];

let allCards = [...DECK];
let cards = [...DECK];
let currentIndex = 0;
let score = 0;
let streak = 0;

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

// Dark mode (persisted in browser)
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
}
applyTheme(localStorage.getItem('flashesp-theme') === 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('flashesp-theme', isDark ? 'dark' : 'light');
});

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

function filterByCategory(category) {
  cards = category === 'all'
    ? [...allCards]
    : allCards.filter(c => c.category === category);
  currentIndex = 0;
  showCard();
}

categoryEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('chip')) return;
  categoryEl.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  filterByCategory(e.target.dataset.category);
});

function flipCard() {
  if (cards.length === 0) return;
  cardEl.classList.toggle('flipped');
  if (cardEl.classList.contains('flipped')) {
    ratingEl.classList.add('visible');
  }
}

cardEl.addEventListener('click', (e) => {
  if (e.target.closest('.speaker-btn')) return;
  flipCard();
});

cardEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    flipCard();
  }
});

// Pronunciation via browser's built-in voice
speakerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (cards.length === 0) return;
  const word = cards[currentIndex].spanish;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
});

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
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentIndex = 0;
  showCard();
});

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
  streak = 0;
  updateStats();
  cardEl.classList.add('incorrect');
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    showCard();
  }, 500);
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.target === cardEl) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
  else if (e.key === 's' || e.key === 'S') { e.preventDefault(); shuffleBtn.click(); }
  else if (e.key === ' ') { e.preventDefault(); flipCard(); }
});

// Initial render
showCard();
updateStats();
