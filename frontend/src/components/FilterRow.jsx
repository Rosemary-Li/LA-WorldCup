import React from "react";

export default function FilterRow({ items, filterKey, label, activeValue, onSelect, select = false }) {
  const values = [...new Set(items.map((item) => item[filterKey]).filter(Boolean))].sort();
  if (values.length <= 1) return null;

  if (select) {
    return (
      <div className="lg-filter-row">
        <span className="lg-filter-label">{label}</span>
        <select className="lg-filter-select" value={activeValue || ""} onChange={(e) => onSelect(e.target.value || null)}>
          <option value="">All</option>
          {values.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="lg-filter-row">
      <span className="lg-filter-label">{label}</span>
      <div className="lg-filter-pills">
        <button className={`lg-filter-pill${!activeValue ? " active" : ""}`} type="button" onClick={() => onSelect(null)}>All</button>
        {values.map((v) => (
          <button key={v} className={`lg-filter-pill${activeValue === v ? " active" : ""}`} type="button" onClick={() => onSelect(v)}>{v}</button>
        ))}
      </div>
    </div>
  );
}
