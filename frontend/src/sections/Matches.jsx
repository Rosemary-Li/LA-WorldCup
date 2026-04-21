import React from "react";
import { matchRows } from "../constants/matches.js";

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Matches({ data, onOpenMatch }) {
  return (
    <section id="matches">
      <div className="ms-header">
        <div className="ms-eyebrow">✦ Eight Matches · One Venue ✦</div>
        <h1 className="ms-title">Los Angeles<br />Match Schedule</h1>
        <div className="ms-sub">SoFi Stadium · 1001 S. Stadium Drive, Inglewood, CA</div>
      </div>
      <div className="ms-list">
        {matchRows.map((row) => (
          <button className="ms-item" key={row.key} onClick={() => onOpenMatch(row.key)} style={{ "--accent": row.badge }}>
            <div className="ms-item-left">
              <div className="ms-item-key">{row.key}</div>
              <div className="ms-item-group">{row.group}</div>
            </div>
            <div className="ms-item-teams">
              {!row.homeTbd && <span className="ms-item-flag">{row.teams[0]}</span>}
              <span className="ms-item-name">{row.teams[1]}</span>
              <span className="ms-item-vs">vs</span>
              <span className="ms-item-name">{row.teams[2]}</span>
              {!row.awayTbd && <span className="ms-item-flag">{row.teams[3]}</span>}
            </div>
            <div className="ms-item-right">
              <div className="ms-item-date">{row.date}</div>
              <div className="ms-item-time">{row.sub}</div>
            </div>
            <div className="ms-item-arrow">›</div>
          </button>
        ))}
      </div>
      <div className="ms-footer-hint">Click any match to view details, tickets &amp; nearby picks</div>
      <button className="ms-nav-btn ms-home-btn" type="button" onClick={() => scrollToId("photo-hero")}>
        <span className="ms-nav-arrow">←</span>
        <span className="ms-nav-text">Home</span>
      </button>
      <button className="ms-nav-btn ms-explore-btn" type="button" onClick={() => scrollToId("la-showcase")}>
        <span className="ms-nav-text">Explore LA</span>
        <span className="ms-nav-arrow">→</span>
      </button>
    </section>
  );
}
