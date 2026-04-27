import React, { useState } from "react";
import { matchRows } from "../constants/matches.js";

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Matches({ data, onOpenMatch, onPlanJourney }) {
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  const toggle = (key) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  function handlePlan() {
    const keys = matchRows.filter((r) => selectedKeys.has(r.key)).map((r) => r.key);
    onPlanJourney(keys.length ? keys : null);
    scrollToId("mount-itinerary");
  }

  return (
    <section id="matches">
      <div className="ms-header">
        <h1 className="ms-title">Los Angeles<br />Match Schedule</h1>
      </div>

      <div className="ms-list">
        {matchRows.map((row) => {
          const on = selectedKeys.has(row.key);
          return (
            <div className={`ms-item-wrap${on ? " ms-item-wrap--on" : ""}`} key={row.key} style={{ "--accent": row.badge }}>
              {/* Checkbox */}
              <button
                className={`ms-check${on ? " ms-check--on" : ""}`}
                type="button"
                aria-label={`${on ? "Deselect" : "Select"} ${row.key}`}
                onClick={() => toggle(row.key)}
              >
                <span className="ms-check-ring">{on ? "✓" : ""}</span>
              </button>

              {/* Match row — opens overlay */}
              <button className="ms-item" onClick={() => onOpenMatch(row.key)}>
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
            </div>
          );
        })}
      </div>

      <div className="ms-footer-hint" aria-hidden={selectedKeys.size === 0}>
        {selectedKeys.size > 0
          ? `${selectedKeys.size} match${selectedKeys.size > 1 ? "es" : ""} selected — press Plan Your Journey →`
          : " "}
      </div>

      <button className="ms-nav-btn ms-home-btn" type="button" onClick={() => scrollToId("photo-hero")}>
        <span className="ms-nav-arrow">←</span>
        <span className="ms-nav-text">Home</span>
      </button>
      <button className="ms-nav-btn ms-explore-btn" type="button" onClick={handlePlan}>
        <span className="ms-nav-text">Plan Your Journey</span>
        <span className="ms-nav-arrow">→</span>
      </button>
    </section>
  );
}
