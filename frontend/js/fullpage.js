// ═══════════════════════════════════════════════════
//  FULL-PAGE SCROLL — snap between sections
// ═══════════════════════════════════════════════════

(function () {
  const SECTION_IDS = [
    'mount-photohero',
    'mount-matches',
    'mount-showcase',
    'mount-itinerary',
    'mount-explore',
    'mount-discover',
    'mount-about',
    'mount-footer',
  ];

  const LABELS = [
    'Hero', 'Matches', 'Los Angeles',
    'Itinerary', 'Map', 'Discover', 'About', ''
  ];

  const sections = SECTION_IDS
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  // ── Page dots ──────────────────────────────────
  const dotWrap = document.createElement('div');
  dotWrap.id = 'fp-dots';
  document.body.appendChild(dotWrap);

  const dots = sections.map((el, i) => {
    const d = document.createElement('button');
    d.className = 'fp-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', LABELS[i] || `Section ${i + 1}`);
    d.addEventListener('click', () => el.scrollIntoView({ behavior: 'smooth' }));
    dotWrap.appendChild(d);
    return d;
  });

  let activeIdx = 0;

  function setActive(i) {
    if (i === activeIdx && dots[i].classList.contains('active')) return;
    activeIdx = i;
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
  }

  // ── IntersectionObserver to track active section ──
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= 0.5) {
        const i = sections.indexOf(e.target);
        if (i >= 0) setActive(i);
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(el => io.observe(el));

  // ── Keyboard navigation ────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      const next = Math.min(activeIdx + 1, sections.length - 1);
      sections[next].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      const prev = Math.max(activeIdx - 1, 0);
      sections[prev].scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ── Nav link clicks scroll to section ──────────
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
