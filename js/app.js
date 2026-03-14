/* =============================================
   Abodess Guest Guide — Navigation + Carousel
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Tab switching ──────────────────────────────────
  const navBtns = document.querySelectorAll('.nav-btn[data-tab]');
  const panels  = document.querySelectorAll('.tab-panel[data-tab]');

  function showTab(tabId) {
    panels.forEach(p => p.classList.toggle('active', p.dataset.tab === tabId));
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  navBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => showTab(el.dataset.goto));
  });

  if (navBtns.length) showTab(navBtns[0].dataset.tab);

  // ── Code Reveal ────────────────────────────────────
  // Host sends link like: gunter-grove/?code=1234&date=2024-12-20
  // Code is revealed at 12:00 PM on the check-in date (3 hrs before 3 PM check-in)
  const params   = new URLSearchParams(window.location.search);
  const guestCode = params.get('code');
  const checkInDate = params.get('date');

  if (guestCode && checkInDate) {
    const revealAt = new Date(checkInDate + 'T12:00:00');

    function updateReveal() {
      const now = new Date();
      if (now >= revealAt) {
        // Show code
        const el = document.getElementById('crNoCode') || document.getElementById('crCountdown');
        document.getElementById('crNoCode')?.classList.add('hidden');
        document.getElementById('crCountdown')?.classList.add('hidden');
        const unlocked = document.getElementById('crUnlocked');
        const codeEl = document.getElementById('crCode');
        if (unlocked && codeEl) {
          unlocked.classList.remove('hidden');
          codeEl.textContent = guestCode;
        }
        return true; // done
      } else {
        // Show countdown
        document.getElementById('crNoCode')?.classList.add('hidden');
        document.getElementById('crCountdown')?.classList.remove('hidden');
        const diff = revealAt - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const timer = document.getElementById('crTimer');
        if (timer) timer.textContent =
          `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        return false;
      }
    }

    if (!updateReveal()) {
      const interval = setInterval(() => { if (updateReveal()) clearInterval(interval); }, 1000);
    }
  }

  // ── Accordion (info cards) ─────────────────────────
  document.querySelectorAll('.info-card .ic-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.info-card');
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.info-card').forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
    });
  });
  const firstCard = document.querySelector('.info-card');
  if (firstCard) firstCard.classList.add('open');

  // ── Image Carousel ─────────────────────────────────
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track    = carousel.querySelector('.carousel-track');
  const imgs     = track.querySelectorAll('img');
  const total    = imgs.length;
  const prevBtn  = carousel.querySelector('.carousel-btn.prev');
  const nextBtn  = carousel.querySelector('.carousel-btn.next');
  const indicator = document.querySelector('.page-indicator');
  const dots     = document.querySelectorAll('.dot');

  let current = 0;

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    if (indicator) indicator.textContent = `${current + 1} / ${total}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn && (prevBtn.style.opacity = current === 0 ? '0.3' : '1');
    nextBtn && (nextBtn.style.opacity = current === total - 1 ? '0.3' : '1');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging  = false;

  carousel.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  carousel.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) {
      isDragging = true;
      e.preventDefault();
    }
  }, { passive: false });

  carousel.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    const guidePanel = document.querySelector('.tab-panel[data-tab="guide"]');
    if (!guidePanel?.classList.contains('active')) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  goTo(0);
});
