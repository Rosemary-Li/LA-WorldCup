import React, { useEffect, useState } from "react";
import { CATEGORY_COLORS } from "../constants/explore.js";

export default function ExCard({ item, category, selected, onToggle, index }) {
  const [imageSrc, setImageSrc] = useState(item.imageUrl);
  useEffect(() => { setImageSrc(item.imageUrl); }, [item.imageUrl]);

  const openOfficial = (e) => {
    e.stopPropagation();
    if (item.officialUrl) window.open(item.officialUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button className={`ex-card${selected ? " ex-card--on" : ""}`} type="button" onClick={() => onToggle(item.id)}>
      <span className="ex-card-index">{index}</span>
      <div
        className={`ex-card-thumb${item.officialUrl ? " ex-card-thumb--link" : ""}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.32)), url('${item.fallbackImage || "images/LA5.jpg"}')`,
          backgroundColor: CATEGORY_COLORS[category] || "#111",
        }}
        title={item.officialUrl ? "Open official website" : "Official website not available in the dataset"}
      >
        {imageSrc && imageSrc !== item.fallbackImage && (
          <img className="ex-card-img" src={imageSrc} alt="" loading="lazy" onError={() => setImageSrc(null)} />
        )}
        {selected && <span className="ex-card-check">✓</span>}
        {item.officialUrl && <span className="ex-card-site" onClick={openOfficial}>Official Site ↗</span>}
      </div>
      <div className="ex-card-body">
        <div className="ex-card-name">{item.name}</div>
        <div className="ex-card-detail">{item.detail}</div>
        <div className="ex-card-meta">
          {item.stars  && <span>{item.stars}</span>}
          {item.price  && <span>{item.price}</span>}
          {item.type   && <span>{item.type}</span>}
          {item.flavor && <span>{item.flavor}</span>}
        </div>
      </div>
    </button>
  );
}
