import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../css/styles.css";
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
  const { data, apiReady, apiError } = useSiteData();
  const [matchNumber,     setMatchNumber]     = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [explorePicks,    setExplorePicks]    = useState([]);
  const [journeyPrefs,    setJourneyPrefs]    = useState(null);
  const [journey,         setJourney]         = useState(null);
  const [journeyLoading,  setJourneyLoading]  = useState(false);
  const [journeyError,    setJourneyError]    = useState("");
  const journeyRef = useRef(null);

  // Per-traveler hero background image (colors stay universal)
  useEffect(() => {
    const theme = TRAVELER_THEMES[journeyPrefs?.type] || TRAVELER_THEMES.solo;
    document.documentElement.style.setProperty("--jt-image", `url("${theme.image}")`);
  }, [journeyPrefs]);

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
          setJourney={setJourney}
          setLoading={setJourneyLoading}
          setError={setJourneyError}
        />
      </div>
      <div id="mount-showcase">
        <ExploreLA
          data={data}
          apiReady={apiReady}
          apiError={apiError}
          onGoJourney={() => journeyRef.current?.submit()}
          onPicksChange={setExplorePicks}
        />
      </div>
      <div
        id="mount-journey-result"
        className={`itinerary-result ${journeyLoading || journey || journeyError ? "visible" : ""}`}
      >
        {journeyLoading && (
          <div className="journey-loading">
            <div className="loading-bar" />
            <span>Crafting your journey...</span>
          </div>
        )}
        {journeyError && <p className="journey-error">{journeyError}</p>}
        {journey && <JourneyResult data={journey} />}
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
