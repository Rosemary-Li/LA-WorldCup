import React from "react";

export default function Select({ icon, label, value, onChange, options, wide }) {
  return (
    <div className={`control-group${wide ? " control-group--wide" : ""}`}>
      <div className="control-icon">{icon}</div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
