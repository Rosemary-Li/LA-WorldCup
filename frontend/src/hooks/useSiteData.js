import { useEffect, useState } from "react";
import { loadSiteData } from "../api.js";

const EMPTY = {
  matches: [], players: [], hotels: [], restaurants: [],
  fanEvents: [], shows: [], allEvents: [], rankings: [], teams: [],
};

export function useSiteData() {
  const [data, setData]       = useState(EMPTY);
  const [apiReady, setReady]  = useState(false);
  const [apiError, setError]  = useState(null);

  useEffect(() => {
    loadSiteData()
      .then((loaded) => { setData(loaded); setReady(true); setError(null); })
      .catch((err)   => { setError(err);   setReady(false); });
  }, []);

  return { data, apiReady, apiError };
}
