import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../css/styles.css";
import Nav from "./components/Nav.jsx";
import { useSiteData } from "./hooks/useSiteData.js";
import About from "./sections/About.jsx";
import ExploreLA from "./sections/ExploreLA.jsx";
import Journey from "./sections/Journey.jsx";
import MatchOverlay from "./sections/MatchOverlay.jsx";
import Matches from "./sections/Matches.jsx";
import PhotoHero from "./sections/PhotoHero.jsx";
import { EXPLORE_PICKS_KEY } from "./constants/explore.js";

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function App() {
  const { data, apiReady, apiError } = useSiteData();
  const [matchNumber, setMatchNumber]   = useState(null);
  const [explorePicks, setExplorePicks] = useState([]);

  return (
    <>
      <Nav />
      <div id="mount-photohero"><PhotoHero /></div>
      <div id="mount-matches"><Matches data={data} onOpenMatch={setMatchNumber} /></div>
      <div id="mount-showcase">
        <ExploreLA
          data={data}
          apiReady={apiReady}
          apiError={apiError}
          onGoJourney={() => scrollToId("mount-itinerary")}
          onPicksChange={setExplorePicks}
        />
      </div>
      <div id="mount-itinerary"><Journey explorePicks={explorePicks} /></div>
      <div id="mount-about"><About /></div>
      <MatchOverlay
        matchNumber={matchNumber}
        data={data}
        onClose={() => setMatchNumber(null)}
        onExplore={() => scrollToId("la-showcase")}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
