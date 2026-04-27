import React from "react";

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
        <li><a href="#la-showcase">Explore LA</a></li>
        <li><a href="#about">About Us</a></li>
      </ul>
    </nav>
  );
}
