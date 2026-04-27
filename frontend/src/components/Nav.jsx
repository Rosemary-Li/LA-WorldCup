import React from "react";

// #mount-journey-result is NOT a snap target, so the body's mandatory scroll-snap
// will snap back to the nearest snap section after the smooth scroll lands.
// Temporarily disable snap during the manual scroll, then restore.
function goToItinerary(e) {
  e.preventDefault();
  const target = document.getElementById("mount-journey-result");
  if (!target) return;
  const prev = document.body.style.scrollSnapType;
  document.body.style.scrollSnapType = "none";
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => { document.body.style.scrollSnapType = prev; }, 800);
}

export default function Nav() {
  return (
    <nav>
      <div className="nav-bar">
        <div className="nav-rule">Est. June 11, 2026</div>
        <div className="nav-logo">
          <span className="nav-logo-la">LA</span> × WC26
        </div>
        <div className="nav-rule">SoFi Stadium · Inglewood</div>
      </div>
      <ul className="nav-links">
        <li><a href="#matches">Matches</a></li>
        <li><a href="#mount-itinerary">Journey</a></li>
        <li><a href="#mount-showcase">Explore LA</a></li>
        <li><a href="#mount-journey-result" onClick={goToItinerary}>Itinerary</a></li>
        <li><a href="#about">About Us</a></li>
      </ul>
    </nav>
  );
}
