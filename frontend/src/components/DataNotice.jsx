import React from "react";

export default function DataNotice({ title, detail, onRetry }) {
  return (
    <div className="rec-card" style={{ gridColumn: "1 / -1", minHeight: 180, display: "flex", alignItems: "center" }}>
      <div className="rec-card-body">
        <div className="rec-card-tag">Database Connection</div>
        <div className="rec-card-name">{title}</div>
        <div className="rec-card-sub">{detail}</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              marginTop: "0.85rem",
              appearance: "none",
              border: "1px solid currentColor",
              background: "transparent",
              padding: "0.5rem 1.1rem",
              fontFamily: '"Playfair Display", serif',
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
