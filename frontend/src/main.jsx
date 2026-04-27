import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../css/styles.css";
import { loadJourneyShare } from "./api.js";
import Nav from "./components/Nav.jsx";
import { useSiteData } from "./hooks/useSiteData.js";
import About from "./sections/About.jsx";
import ExploreLA from "./sections/ExploreLA.jsx";
import Journey, { JourneyResult } from "./sections/Journey.jsx";
import MatchOverlay from "./sections/MatchOverlay.jsx";
import Matches from "./sections/Matches.jsx";
import PhotoHero from "./sections/PhotoHero.jsx";
import { EXPLORE_PICKS_KEY } from "./constants/explore.js";
import { TRAVELER_THEMES } from "./constants/journey.js";

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function App() {
  const { data, apiReady, apiError, refetch } = useSiteData();
  const [matchNumber,     setMatchNumber]     = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [explorePicks,    setExplorePicks]    = useState([]);
  const [journeyPrefs,    setJourneyPrefs]    = useState(null);
  const [journey,         setJourney]         = useState(null);
  const [journeyLoading,  setJourneyLoading]  = useState(false);
  const [journeyError,    setJourneyError]    = useState("");
  const journeyRef = useRef(null);
  const exploreRef = useRef(null);

  function goExplore() {
    exploreRef.current?.resetToEntry();   // back to magazine view
    scrollToId("mount-showcase");
  }

  // Per-traveler hero background image (colors stay universal)
  useEffect(() => {
    const theme = TRAVELER_THEMES[journeyPrefs?.type] || TRAVELER_THEMES.solo;
    document.documentElement.style.setProperty("--jt-image", `url("${theme.image}")`);
  }, [journeyPrefs]);

  // ── Shared-link entry: ?i=<id> → fetch the saved itinerary, render it
  // straight into the result section, and scrub the param from the URL so
  // refresh doesn't re-trigger.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("i");
    if (!id) return;

    setJourneyLoading(true);
    setJourneyError("");
    loadJourneyShare(id)
      .then((shared) => {
        setJourney(shared);
        setTimeout(() => scrollToId("mount-journey-result"), 250);
      })
      .catch((err) => {
        console.error("[journey-share] load failed:", err);
        setJourneyError("Couldn't load that shared itinerary — the link may have expired.");
      })
      .finally(() => {
        setJourneyLoading(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("i");
        window.history.replaceState({}, "", url);
      });
  }, []);

  function handlePlanJourney(keys) {
    if (keys && keys.length) setSelectedMatches(keys);
    scrollToId("mount-itinerary");
  }

  return (
    <>
      <Nav />
      <div id="mount-photohero"><PhotoHero /></div>
      <div id="mount-matches">
        <Matches data={data} onOpenMatch={setMatchNumber} onPlanJourney={handlePlanJourney} />
      </div>
      <div id="mount-itinerary">
        <Journey
          ref={journeyRef}
          explorePicks={explorePicks}
          selectedMatches={selectedMatches}
          onClearMatches={() => setSelectedMatches([])}
          onPrefsChange={setJourneyPrefs}
          onGoExplore={goExplore}
          setJourney={setJourney}
          setLoading={setJourneyLoading}
          setError={setJourneyError}
        />
      </div>
      <div id="mount-showcase">
        <ExploreLA
          ref={exploreRef}
          data={data}
          apiReady={apiReady}
          apiError={apiError}
          onRetry={refetch}
          journeyLoading={journeyLoading}
          onGoJourney={() => {
            if (!journeyRef.current) {
              console.error("[journey] onGoJourney fired but journeyRef.current is null — Journey hasn't mounted?");
              return;
            }
            console.info("[journey] onGoJourney → calling Journey.submit()");
            journeyRef.current.submit();
          }}
          onPicksChange={setExplorePicks}
        />
      </div>
      <div id="mount-journey-result" className="itinerary-result visible">
        {journeyLoading && (
          <div className="journey-loading">
            <div className="loading-bar" />
            <span>Crafting your journey...</span>
          </div>
        )}
        {journeyError && <p className="journey-error">{journeyError}</p>}
        {journey && <JourneyResult data={journey} />}
        {!journeyLoading && !journeyError && !journey && (
          <div className="journey-empty">
            <h2>Your itinerary will appear here</h2>
            <p>Pick your matches in <strong>Plan Your Journey</strong>, then choose your stays / dining / events in <strong>Explore LA</strong> and hit <strong>Build My Journey →</strong>.</p>
          </div>
        )}
      </div>
      <div id="mount-about"><About /></div>
      <MatchOverlay
        matchNumber={matchNumber}
        data={data}
        onClose={() => setMatchNumber(null)}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
