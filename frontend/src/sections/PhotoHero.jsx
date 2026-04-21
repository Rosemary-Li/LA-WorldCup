import React, { useEffect, useState } from "react";

const SLIDES = ["hero1.jpg", "hero2.jpg", "hero3.jpg", "hero4.jpg"];

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function PhotoHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((n) => (n + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="photo-hero">
      {SLIDES.map((slide, i) => (
        <div key={slide} className={`ph-slide ${i === current ? "active" : ""}`} style={{ backgroundImage: `url('images/${slide}')` }} />
      ))}
      <div className="ph-overlay" />
      <div className="ph-text">
        <div className="ph-eyebrow">✦ FIFA World Cup 2026™ · Los Angeles ✦</div>
        <h1 className="ph-headline">THE <em>BEAUTIFUL</em><br />GAME COMES TO<br /><span className="ph-outline">HOLLYWOOD</span></h1>
        <p className="ph-sub">June – July 2026 · SoFi Stadium · Inglewood, California</p>
        <div className="ph-steps">
          <button className="ph-step-btn" onClick={() => scrollToId("mount-matches")}>Pick your match</button>
          <span className="ph-steps-arrow">→</span>
          <button className="ph-step-btn" onClick={() => scrollToId("la-showcase")}>Explore the city</button>
          <span className="ph-steps-arrow">→</span>
          <button className="ph-step-btn" onClick={() => scrollToId("mount-itinerary")}>Generate your trip</button>
        </div>
      </div>
      <div className="ph-dots">
        {SLIDES.map((slide, i) => (
          <button key={slide} className={`ph-dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}
