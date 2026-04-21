import React from "react";

export function Nearby({ name, sub, price }) {
  return (
    <div className="nearby-card">
      <div className="nearby-name">{name}</div>
      <div className="nearby-sub">{sub}</div>
      <div className="nearby-price">{price}</div>
    </div>
  );
}

export function TicketCard({ t }) {
  const statusColor = t.ticket_status === "Available" ? "#2d8a3e" : t.ticket_status === "Sold Out" ? "#c0392b" : "var(--silver)";
  const ticketCategory = (t.ticket_category || "").replace(/\s*\([^)]*[㐀-鿿][^)]*\)/g, "");
  return (
    <div className="nearby-card">
      <div className="nearby-name">{ticketCategory}</div>
      <div className="nearby-sub">{t.seating_section}{t.section_level ? ` · ${t.section_level}` : ""}{t.stage ? ` · ${t.stage}` : ""}</div>
      <div className="nearby-price" style={{ color: statusColor }}>${Number.parseFloat(t.price_usd).toFixed(0)} · {t.ticket_status}</div>
    </div>
  );
}
