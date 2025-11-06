// Basic DOM refs
const filterButtons = document.querySelectorAll('.filter-btn');
const gallery = document.getElementById('gallery');
const cards = Array.from(document.querySelectorAll('.image-card'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const lbNext = document.getElementById('lbNext');
const lbPrev = document.getElementById('lbPrev');

let visibleCards = [];        // current list of visible cards (after filter)
let currentVisibleIndex = 0;  // index inside visibleCards for lightbox

// Initialize visibleCards (all shown)
function updateVisibleCards() {
  visibleCards = Array.from(cards).filter(c => !c.classList.contains('hidden'));
}
updateVisibleCards();

// --- FILTERING LOGIC ---
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // set active class
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const cat = btn.dataset.category;
    if (cat === 'all') {
      cards.forEach(c => c.classList.remove('hidden'));
    } else {
      cards.forEach(c => {
        if (c.dataset.category === cat) c.classList.remove('hidden');
        else c.classList.add('hidden');
      });
    }

    updateVisibleCards();
    // optional: scroll gallery to top for better UX
    gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- LIGHTBOX LOGIC ---
// Open lightbox when any image-card is clicked
cards.forEach((card, index) => {
  card.addEventListener('click', (e) => {
    // refresh visible list and find index among visible
    updateVisibleCards();
    const filtered = visibleCards;
    // find which position this clicked card has in visibleCards
    currentVisibleIndex = filtered.indexOf(card);
    // If card is currently hidden (shouldn't be clickable), return
    if (currentVisibleIndex === -1) return;
    openLightbox(card);
  });
});

function openLightbox(card) {
  const img = card.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || '';
  lbCaption.textContent = card.querySelector('.caption')?.textContent || '';
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  // trap focus for accessibility (send focus to close button)
  lbClose.focus();
}

// Close lightbox
function closeLightbox() {
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
  lbCaption.textContent = '';
}

// Navigate in current visible list
function showByVisibleIndex(i) {
  updateVisibleCards();
  if (visibleCards.length === 0) return;
  if (i < 0) i = visibleCards.length - 1;
  if (i >= visibleCards.length) i = 0;
  currentVisibleIndex = i;
  const card = visibleCards[currentVisibleIndex];
  const img = card.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || '';
  lbCaption.textContent = card.querySelector('.caption')?.textContent || '';
}

// Next & Prev
lbNext.addEventListener('click', (e) => {
  e.stopPropagation();
  showByVisibleIndex(currentVisibleIndex + 1);
});
lbPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  showByVisibleIndex(currentVisibleIndex - 1);
});

// Close when clicking X or background
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showByVisibleIndex(currentVisibleIndex + 1);
  if (e.key === 'ArrowLeft') showByVisibleIndex(currentVisibleIndex - 1);
});

// When images load, ensure a smooth transition (preload)
cards.forEach(card => {
  const img = card.querySelector('img');
  img.addEventListener('error', () => {
    // if image fails, hide the card gracefully
    card.style.display = 'none';
  });
});
