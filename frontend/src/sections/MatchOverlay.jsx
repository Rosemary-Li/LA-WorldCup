import { useEffect, useState } from "react";
import { loadMatchStats, loadMatchStory } from "../api.js";
import { matchMeta } from "../constants/matches.js";

const countryAliases = {
  "united states": "usa", "us": "usa", "u.s.": "usa",
  "ir iran": "iran",
  "türkiye": "turkey",                      // DB stores "Turkey"
  "bosnia and herzegovina": "bih",
  "bosnia & herzegovina": "bih",
  "bosnia-herzegovina": "bih",
};
function countryKey(v = "") { const k = String(v).trim().toLowerCase(); return countryAliases[k] || k; }
function findTeamInfo(teams, metaTeam, dbName) {
  const keys = [dbName, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return teams.find((t) => keys.includes(countryKey(t.country))) || null;
}
function findRankingInfo(rankings, metaTeam, teamInfo, fallback = null) {
  const keys = [teamInfo?.country, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return rankings.find((r) => keys.includes(countryKey(r.country))) || fallback;
}

// Session-level circuit breaker: once the AI story endpoint fails (e.g.
// Anthropic credit exhausted), stop calling it for the rest of the session.
// Hardcoded matchMeta.story still renders — no UI degradation.
let storyApiDown = false;

// ── Form pill (W / D / L) ─────────────────────────────────────────────────
function FormPill({ result }) {
  const col = result === "W" ? "#4caf50" : result === "L" ? "#e53935" : "#888";
  return <span style={{ width: 22, height: 22, borderRadius: "50%", background: col, color: "#fff", fontSize: "0.55rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: '"Playfair Display", serif' }}>{result}</span>;
}

export default function MatchOverlay({ matchNumber, data, onClose }) {
  const [story, setStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    if (!matchNumber) { setStory(null); setApiStats(null); return; }
    setStory(null);
    setApiStats(null);
    let cancelled = false;

    // AI story — skip if endpoint is known-down for this session (saves a 500 round trip)
    if (storyApiDown) {
      setStoryLoading(false);
    } else {
      setStoryLoading(true);
      loadMatchStory(matchNumber)
        .then((data) => { if (!cancelled) { setStory(data); setStoryLoading(false); } })
        .catch(() => {
          storyApiDown = true;             // trip the breaker for the rest of the session
          if (!cancelled) { setStory(null); setStoryLoading(false); }
        });
    }

    loadMatchStats(matchNumber)
      .then((data) => { if (!cancelled) setApiStats(data); })
      .catch(() => { if (!cancelled) setApiStats(null); });
    return () => { cancelled = true; };
  }, [matchNumber]);

  if (!matchNumber) return null;

  const dbMatch     = data.matches.find((m) => m.match_number === matchNumber) || {};
  const meta        = matchMeta[matchNumber] || matchMeta.M4;
  const homeTeam    = findTeamInfo(data.teams, meta.home, dbMatch.team1);
  const awayTeam    = findTeamInfo(data.teams, meta.away, dbMatch.team2);
  const homeRanking = findRankingInfo(data.rankings, meta.home, homeTeam, meta.rankings?.home ?? null);
  const awayRanking = findRankingInfo(data.rankings, meta.away, awayTeam, meta.rankings?.away ?? null);

  // Merge API data with hardcoded fallback.
  // Per-team stats (home/away) fall back independently — API may have one team but not the other.
  // H2H / lastMeeting / allTime fall back as a UNIT (treat the H2H section atomically) to
  // avoid contradictions like "0 meetings" + "last meeting in 2014".
  const metaStats   = meta.stats || {};
  const useApiH2h   = !!apiStats?.h2h;
  const s = {
    home:        apiStats?.home || metaStats.home,
    away:        apiStats?.away || metaStats.away,
    allTime:     useApiH2h ? apiStats.allTime     : metaStats.allTime,
    lastMeeting: useApiH2h ? apiStats.lastMeeting : metaStats.lastMeeting,
  };
  const h2h = useApiH2h ? apiStats.h2h : meta.h2h;
  const team2wins  = h2h.team2wins ?? (h2h.total - h2h.team1wins - h2h.draws);
  const allStars   = meta.stars || [];
  const isApiData  = !!apiStats?.home;

  return (
    <div id="matchOverlay" className="overlay" style={{ display: "block" }}>
      <button className="overlay-close" onClick={onClose} style={{ zIndex: 300 }}>×</button>
      <div className="mo2-page">

        {/* ══ HERO ══ */}
        <div className="mo2-hero">
          <div className="mo2-hero-bg" />
          <div className="mo2-hero-content">
            <div className="mo2-hero-meta">{dbMatch.stage || meta.round || "Group Stage"} · {dbMatch.date || ""} · SoFi Stadium, Inglewood, CA</div>
            <div className="mo2-hero-matchup">
              <div className="mo2-hero-team">
                <span className="mo2-hero-flag">{meta.home.flag}</span>
                <span className="mo2-hero-name">{meta.home.name}</span>
              </div>
              <div className="mo2-hero-vs">
                <span>VS</span>
              </div>
              <div className="mo2-hero-team mo2-hero-team--away">
                <span className="mo2-hero-name">{meta.away.name}</span>
                <span className="mo2-hero-flag">{meta.away.flag}</span>
              </div>
            </div>
            <div className="mo2-hero-rankings">
              <div className="mo2-hero-rank">
                {homeRanking ? <><strong>#{homeRanking.rank}</strong><span>FIFA Ranking</span></> : <span>Rank TBD</span>}
              </div>
              <div className="mo2-hero-rank mo2-hero-rank--right">
                {awayRanking ? <><strong>#{awayRanking.rank}</strong><span>FIFA Ranking</span></> : <span>Rank TBD</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mo2-content">

          {/* ══ STORY + COMPARISON ══ */}
          <div className="mo2-row">
            {/* Match Story */}
            <div className="mo2-card mo2-card--dark mo2-story">
              <div className="mo2-label">
                Match Story
                {story && <span className="mo2-story-ai-tag" title="Generated by Claude">✦ AI</span>}
                {storyLoading && <span className="mo2-story-loading">crafting…</span>}
              </div>
              {(() => {
                const s = story || meta.story;
                return (
                  <>
                    <h2 className="mo2-story-title">{s?.title || "Match Preview"}</h2>
                    <p className="mo2-story-desc">{s?.desc || meta.highlight}</p>
                    {s?.bullets?.length > 0 && (
                      <ul className="mo2-story-bullets">
                        {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Team Comparison */}
            <div className="mo2-card mo2-comparison">
              <div className="mo2-label">
                Team Comparison
                {isApiData && <span className="mo2-live-tag" title="Live data from API-Football">✦ Live</span>}
              </div>
              <div className="mo2-cmp-header">
                <span>{meta.home.flag} {meta.home.name}</span>
                <span />
                <span className="mo2-cmp-right">{meta.away.name} {meta.away.flag}</span>
              </div>
              {[
                { label: "FIFA Ranking",        home: homeRanking ? `#${homeRanking.rank}` : "—",       away: awayRanking ? `#${awayRanking.rank}` : "—" },
                { label: "Win Rate",            home: s?.home?.winRate ? `${s.home.winRate}%` : "—",    away: s?.away?.winRate ? `${s.away.winRate}%` : "—" },
                { label: "Goals Per Game",      home: s?.home?.goalsPerGame ?? "—",                     away: s?.away?.goalsPerGame ?? "—" },
                { label: "Form (Last 5)",       home: s?.home?.form,                                    away: s?.away?.form, isForm: true },
                { label: "Goals Conceded/Game", home: s?.home?.goalsConceded ?? "—",                    away: s?.away?.goalsConceded ?? "—" },
              ].map(({ label, home, away, isForm }) => (
                <div className="mo2-cmp-row" key={label}>
                  <span className="mo2-cmp-val">
                    {isForm && Array.isArray(home) ? <div className="mo2-form-pills">{home.map((r,i) => <FormPill key={i} result={r} />)}</div> : home}
                  </span>
                  <span className="mo2-cmp-label">{label}</span>
                  <span className="mo2-cmp-val mo2-cmp-val--right">
                    {isForm && Array.isArray(away) ? <div className="mo2-form-pills mo2-form-pills--right">{away.map((r,i) => <FormPill key={i} result={r} />)}</div> : away}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ H2H + PLAYERS TO WATCH ══ */}
          <div className="mo2-row">
            {/* Head to Head */}
            <div className="mo2-card mo2-h2h">
              <div className="mo2-label">
                Head to Head
                {apiStats?.h2h && <span className="mo2-live-tag" title="Live H2H from API-Football">✦ Live</span>}
              </div>
              <div className="mo2-h2h-nums">
                <div className="mo2-h2h-block">
                  <strong className="mo2-h2h-big" style={{ color: "#4a9eff" }}>{h2h.team1wins}</strong>
                  <span>Wins</span>
                </div>
                <div className="mo2-h2h-block">
                  <strong className="mo2-h2h-big">{h2h.draws}</strong>
                  <span>Draws</span>
                </div>
                <div className="mo2-h2h-block">
                  <strong className="mo2-h2h-big" style={{ color: "#e53935" }}>{team2wins}</strong>
                  <span>Win</span>
                </div>
              </div>
              {s?.lastMeeting && (
                <div className="mo2-last-meeting">
                  <div className="mo2-label" style={{ marginBottom: "0.4rem" }}>Last Meeting</div>
                  <div className="mo2-lm-row">
                    <span>{meta.home.flag}</span>
                    <span className="mo2-lm-score">{s.lastMeeting.homeScore} – {s.lastMeeting.awayScore}</span>
                    <span>{meta.away.flag}</span>
                  </div>
                  <div className="mo2-lm-meta">{s.lastMeeting.date} · {s.lastMeeting.type}</div>
                </div>
              )}
            </div>

            {/* Players to Watch */}
            <div className="mo2-card mo2-players">
              <div className="mo2-label">Players to Watch</div>
              {allStars.length === 0 ? (
                <p className="mo2-loading">Player data coming soon.</p>
              ) : (
                <div className="mo2-players-scroll">
                  {allStars.map((p) => {
                    const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(p.name + " footballer")}`;
                    return (
                      <a
                        className="mo2-player-card"
                        key={p.name}
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="mo2-player-avatar">
                          {p.img ? (
                            <img className="mo2-player-photo" src={p.img} alt={p.name} loading="lazy" />
                          ) : (
                            <span className="mo2-player-initials">{initials}</span>
                          )}
                          <span className="mo2-player-av-flag">{p.flag}</span>
                        </div>
                        <div className="mo2-player-team">{p.team}</div>
                        <div className="mo2-player-name">{p.name}</div>
                        <div className="mo2-player-pos">{p.pos} · {p.club}</div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>{/* /mo2-content */}
      </div>{/* /mo2-page */}
    </div>
  );
}
