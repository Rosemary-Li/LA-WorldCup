import React from "react";

export default function Nav() {
  return (
    <nav>
      <div className="nav-masthead">
        <div className="nav-title">A cinematic journey through football, glamour &amp; the City of Angels — where the silver screen meets the beautiful game.</div>
        <div className="nav-logo">LA × WC26</div>
      </div>
      <div className="nav-bar">
        <div className="nav-rule">Est. June 11, 2026</div>
        <ul className="nav-links">
          <li><a href="#matches">Matches</a></li>
          <li><a href="#la-showcase">Explore LA</a></li>
          <li><a href="#mount-itinerary">Journey</a></li>
          <li><a href="#about">About Us</a></li>
        </ul>
        <div className="nav-rule">SoFi Stadium · Inglewood</div>
      </div>
    </nav>
  );
}
