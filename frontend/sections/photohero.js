// ═══════════════════════════════════════════════════
//  SECTION: PHOTO HERO SLIDESHOW
// ═══════════════════════════════════════════════════

document.getElementById('mount-photohero').innerHTML = `
  <div id="photo-hero">
    <div class="ph-slide active" style="background-image:url('images/hero1.jpg')"></div>
    <div class="ph-slide"        style="background-image:url('images/hero2.jpg')"></div>
    <div class="ph-slide"        style="background-image:url('images/hero3.jpg')"></div>
    <div class="ph-slide"        style="background-image:url('images/hero4.jpg')"></div>

    <div class="ph-overlay"></div>

    <div class="ph-text">
      <div class="ph-eyebrow">✦ FIFA World Cup 2026™ · Los Angeles ✦</div>
      <h1 class="ph-headline">THE <em>BEAUTIFUL</em><br>GAME COMES TO<br><span class="ph-outline">HOLLYWOOD</span></h1>
      <p class="ph-sub">June – July 2026 · SoFi Stadium · Inglewood, California</p>
    </div>

    <div class="ph-dots">
      <button class="ph-dot active" onclick="goSlide(0)"></button>
      <button class="ph-dot"        onclick="goSlide(1)"></button>
      <button class="ph-dot"        onclick="goSlide(2)"></button>
      <button class="ph-dot"        onclick="goSlide(3)"></button>
    </div>

    <!-- CTA Button -->
    <div class="ph-cta-wrap">
      <a class="ph-cta" onclick="document.getElementById('matches').scrollIntoView({behavior:'smooth'})">
        <span class="ph-cta-label">Start Your Adventure</span>
        <span class="ph-cta-arrow">↓</span>
      </a>
    </div>

    <div class="ph-scroll-hint">
      <span>Scroll</span>
      <div class="ph-scroll-line"></div>
    </div>
  </div>

  <style>
    #photo-hero {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #0a0a0a;
    }

    .ph-slide {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1.2s ease-in-out;
    }
    .ph-slide.active { opacity: 1; }

    .ph-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.25) 0%,
        rgba(0,0,0,0.45) 50%,
        rgba(0,0,0,0.70) 100%
      );
      z-index: 1;
    }

    .ph-text {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }

    .ph-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1.5rem;
    }

    .ph-headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 8vw, 7rem);
      font-weight: 900;
      color: #fff;
      line-height: 1.05;
      margin: 0 0 1.5rem;
      text-shadow: 0 2px 24px rgba(0,0,0,0.5);
    }
    .ph-headline em { font-style: italic; color: #e8d5a3; }

    .ph-outline {
      -webkit-text-stroke: 2px #fff;
      color: transparent;
    }

    .ph-sub {
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: rgba(255,255,255,0.65);
    }

    .ph-dots {
      position: absolute;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      display: flex;
      gap: 0.6rem;
    }

    .ph-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.6);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background 0.3s, transform 0.3s;
    }
    .ph-dot.active {
      background: #fff;
      transform: scale(1.25);
    }

    .ph-cta-wrap {
      position: absolute;
      bottom: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
    }

    .ph-cta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      text-decoration: none;
    }

    .ph-cta-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.7);
      padding: 0.65rem 1.8rem;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(4px);
      transition: background 0.3s, border-color 0.3s;
    }

    .ph-cta:hover .ph-cta-label {
      background: rgba(255,255,255,0.2);
      border-color: #fff;
    }

    .ph-cta-arrow {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.7);
      animation: bounceDown 1.6s ease-in-out infinite;
    }

    @keyframes bounceDown {
      0%, 100% { transform: translateY(0); opacity: 0.7; }
      50%       { transform: translateY(5px); opacity: 1; }
    }

    .ph-scroll-hint {
      position: absolute;
      bottom: 2.4rem;
      right: 2.5rem;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      color: rgba(255,255,255,0.5);
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .ph-scroll-line {
      width: 1px;
      height: 40px;
      background: rgba(255,255,255,0.3);
      animation: scrollPulse 2s ease-in-out infinite;
    }
    @keyframes scrollPulse {
      0%, 100% { opacity: 0.3; }
      50%       { opacity: 0.8; }
    }
  </style>
`;

(function () {
  const slides = document.querySelectorAll('.ph-slide');
  const dots   = document.querySelectorAll('.ph-dot');
  let current  = 0;
  let timer;

  function goSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  window.goSlide = goSlide;

  function start() {
    timer = setInterval(() => goSlide(current + 1), 3000);
  }

  const hero = document.getElementById('photo-hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', start);

  start();
})();
