import React from "react";

export default function DataNotice({ title, detail }) {
  return (
    <div className="rec-card" style={{ gridColumn: "1 / -1", minHeight: 180, display: "flex", alignItems: "center" }}>
      <div className="rec-card-body">
        <div className="rec-card-tag">Database Connection</div>
        <div className="rec-card-name">{title}</div>
        <div className="rec-card-sub">{detail}</div>
      </div>
    </div>
  );
}
