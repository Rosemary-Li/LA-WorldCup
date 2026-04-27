import { useEffect, useId, useRef } from "react";

const DEFAULT_CENTER = [33.9534, -118.3391];

const MARKER_COLOR = { stadium: "#f4d35e", hotel: "#9fd3ff", restaurant: "#f7a072", event: "#c2f970", attraction: "#ff8ac6" };

function makeIcon(L, type, active = false) {
  const isStadium = type === "stadium";
  const size = isStadium ? 18 : active ? 16 : 11;
  const border = active ? "3px solid #fff" : "2px solid #fff";
  const shadow = active
    ? "0 0 22px rgba(255,255,255,.9)"
    : isStadium
    ? "0 0 18px rgba(244,211,94,.95)"
    : "0 0 10px rgba(255,255,255,.35)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${MARKER_COLOR[type] || "#ddd"};border:${border};box-shadow:${shadow};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function SyncMap({ mode, places = [], highlight = null }) {
  const rawId  = useId();
  const mapId  = `map-${rawId.replace(/:/g, "")}`;
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = window.L.map(mapId, { center: DEFAULT_CENTER, zoom: 13, zoomControl: false, attributionControl: false });
    mapRef.current = map;
    layerRef.current = window.L.layerGroup().addTo(map);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OSM © CARTO", subdomains: "abcd", maxZoom: 19,
    }).addTo(map);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, [mapId]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !layerRef.current) return;
    const stadium = { markerType: "stadium", name: "SoFi Stadium", lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], detail: "World Cup venue · Inglewood" };
    layerRef.current.clearLayers();
    markersRef.current = [stadium, ...places].map((p) => {
      const mt = p.markerType || "event";
      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(L, mt) })
        .bindPopup(
          `<div class="lf-popup"><div class="lf-popup-type">${mt}</div><div class="lf-popup-name">${p.name}</div><div class="lf-popup-detail">${p.detail}</div></div>`,
          { className: "lf-popup-wrap", closeButton: false }
        );
      marker.addTo(layerRef.current);
      if (mt === "stadium") marker.openPopup();
      marker._placeData = p;
      return marker;
    });
    if (places.length === 0) {
      mapRef.current.flyTo(DEFAULT_CENTER, 13, { duration: 0.8 });
    } else {
      mapRef.current.fitBounds(L.featureGroup(markersRef.current).getBounds().pad(0.25), { maxZoom: 13, animate: true });
    }
  }, [mode, places]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;
    // Two-pass matching:
    //   Pass 1: prefer marker whose name === highlight.name (most precise).
    //   Pass 2: if no name match (the activity's marker may have been deduped out
    //           because another place shares its coords), fall back to coord match.
    let matchedMarker = null;
    if (highlight) {
      if (highlight.name) {
        matchedMarker = markersRef.current.find(
          (m) => m._placeData && m._placeData.name === highlight.name
        );
      }
      if (!matchedMarker && Number.isFinite(highlight.lat) && Number.isFinite(highlight.lng)) {
        matchedMarker = markersRef.current.find((m) => {
          const p = m._placeData;
          return p
            && Math.abs(p.lat - highlight.lat) < 0.0001
            && Math.abs(p.lng - highlight.lng) < 0.0001;
        });
      }
    }
    markersRef.current.forEach((marker) => {
      const p = marker._placeData;
      if (!p) return;
      const isMatch = marker === matchedMarker;
      marker.setIcon(makeIcon(L, p.markerType || "event", isMatch));
      if (isMatch) {
        mapRef.current.panTo([p.lat, p.lng], { animate: true, duration: 0.4 });
        marker.openPopup();
      }
    });
  }, [highlight]);

  return <div id={mapId} className="showcase-map" />;
}
