import { useCallback, useEffect, useState } from "react";
import { loadSiteData } from "../api.js";

const EMPTY = {
  matches: [], players: [], hotels: [], restaurants: [],
  fanEvents: [], shows: [], allEvents: [], rankings: [], teams: [],
};

export function useSiteData() {
  const [data, setData]       = useState(EMPTY);
  const [apiReady, setReady]  = useState(false);
  const [apiError, setError]  = useState(null);

  const refetch = useCallback(() => {
    setError(null);
    return loadSiteData()
      .then((loaded) => { setData(loaded); setReady(true); setError(null); })
      .catch((err)   => { console.error("[useSiteData] load failed:", err); setError(err); setReady(false); });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function tryLoad() {
      while (!cancelled && attempt < 4) {
        attempt += 1;
        try {
          const loaded = await loadSiteData();
          if (cancelled) return;
          setData(loaded); setReady(true); setError(null);
          return;
        } catch (err) {
          console.warn(`[useSiteData] attempt ${attempt} failed:`, err.message);
          if (cancelled) return;
          setError(err); setReady(false);
          if (attempt >= 4) return;
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    tryLoad();
    return () => { cancelled = true; };
  }, []);

  return { data, apiReady, apiError, refetch };
}
