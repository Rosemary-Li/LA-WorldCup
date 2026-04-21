import React, { useState } from "react";
import { loadPlayersByTeam, loadTickets } from "../api.js";
import DataNotice from "../components/DataNotice.jsx";
import { Nearby, TicketCard } from "../components/Nearby.jsx";
import { matchMeta } from "../constants/matches.js";

const countryAliases = { "united states": "usa", "us": "usa", "u.s.": "usa", "ir iran": "iran" };

function countryKey(value = "") {
  const key = String(value).trim().toLowerCase();
  return countryAliases[key] || key;
}

function findTeamInfo(teams, metaTeam, dbName) {
  const keys = [dbName, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return teams.find((team) => keys.includes(countryKey(team.country))) || null;
}

function findRankingInfo(rankings, metaTeam, teamInfo) {
  const keys = [teamInfo?.country, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return rankings.find((ranking) => keys.includes(countryKey(ranking.country))) || null;
}

function TeamPanel({ side, metaTeam, teamInfo, ranking }) {
  return (
    <div className={`mo-team mo-team--${side}`}>
      <div className="mo-team-flag">{metaTeam.flag}</div>
      <div className="mo-team-name">{metaTeam.name}</div>
      <div className="mo-team-country">{teamInfo?.country || metaTeam.country}</div>
      <div className="mo-team-rank">
        {ranking ? <><strong>#{ranking.rank}</strong><span>FIFA</span></> : <span>Rank TBD</span>}
      </div>
      {ranking && <div className="mo-team-pts">{Number.parseFloat(ranking.total_points).toFixed(0)} pts</div>}
    </div>
  );
}

export default function MatchOverlay({ matchNumber, data, onClose, onExplore }) {
  const [panel, setPanel] = useState("tickets");
  const [tickets, setTickets] = useState(null);
  const [squad, setSquad]     = useState(null);

  if (!matchNumber) return null;

  const dbMatch     = data.matches.find((m) => m.match_number === matchNumber) || {};
  const meta        = matchMeta[matchNumber] || matchMeta.M4;
  const homeTeam    = findTeamInfo(data.teams, meta.home, dbMatch.team1);
  const awayTeam    = findTeamInfo(data.teams, meta.away, dbMatch.team2);
  const homeRanking = findRankingInfo(data.rankings, meta.home, homeTeam);
  const awayRanking = findRankingInfo(data.rankings, meta.away, awayTeam);

  async function openTickets() {
    setPanel("tickets");
    if (!tickets && dbMatch.match_number) setTickets(await loadTickets(dbMatch.match_number).catch(() => []));
  }

  async function openSquad() {
    setPanel("squad");
    if (!squad) {
      const teamNames = [homeTeam?.country, awayTeam?.country].filter(
        (n) => n && countryKey(n) !== "to be determined" && !countryKey(n).includes("playoff")
      );
      const rows = await Promise.all(teamNames.map((n) => loadPlayersByTeam(n).catch(() => [])));
      setSquad(rows.flat());
    }
  }

  return (
    <div id="matchOverlay" className="overlay" style={{ display: "block" }}>
      <button className="overlay-close" onClick={onClose}>×</button>
      <div className="overlay-inner">
        <div id="overlayContent">
          <div className="mo-header">
            <span className="mo-stage">{dbMatch.stage || meta.round} · {matchNumber}</span>
            <span className="mo-date">{dbMatch.date || ""}{dbMatch.time_pt ? ` · ${dbMatch.time_pt} PT` : ""}</span>
          </div>

          <div className="mo-matchup">
            <TeamPanel side="home" metaTeam={meta.home} teamInfo={homeTeam} ranking={homeRanking} />
            <div className="mo-vs-col">
              <div className="mo-vs">VS</div>
              <div className="mo-venue">{dbMatch.venue || "SoFi Stadium"}</div>
              <div className="mo-venue-addr">{dbMatch.venue_address || "Inglewood, CA"}</div>
            </div>
            <TeamPanel side="away" metaTeam={meta.away} teamInfo={awayTeam} ranking={awayRanking} />
          </div>

          {meta.highlight && (
            <div className="mo-storyline">
              <div className="mo-section-label">Match Storyline</div>
              <p className="mo-storyline-text">{meta.highlight}</p>
            </div>
          )}

          <div className="mo-h2h">
            <div className="mo-h2h-stat"><strong>{meta.h2h.total}</strong><span>Meetings</span></div>
            <div className="mo-h2h-stat"><strong>{meta.h2h.team1wins}</strong><span>{meta.home.name} Wins</span></div>
            <div className="mo-h2h-stat"><strong>{meta.h2h.draws}</strong><span>Draws</span></div>
            <div className="mo-h2h-stat"><strong>{meta.h2h.team2wins ?? (meta.h2h.total - meta.h2h.team1wins - meta.h2h.draws)}</strong><span>{meta.away.name} Wins</span></div>
          </div>

          <div className="nearby-tabs">
            <button className={`nearby-tab${panel === "tickets"     ? " active" : ""}`} onClick={openTickets}>Tickets</button>
            <button className={`nearby-tab${panel === "hotels"      ? " active" : ""}`} onClick={() => setPanel("hotels")}>Hotels</button>
            <button className={`nearby-tab${panel === "restaurants" ? " active" : ""}`} onClick={() => setPanel("restaurants")}>Restaurants</button>
            <button className={`nearby-tab${panel === "events"      ? " active" : ""}`} onClick={() => setPanel("events")}>Fan Events</button>
            <button className={`nearby-tab${panel === "squad"       ? " active" : ""}`} onClick={openSquad}>Squad</button>
          </div>

          <div className="nearby-grid">
            {panel === "tickets" && (
              tickets
                ? tickets.length === 0
                  ? <DataNotice title="No ticket data" detail="Ticket information is not available for this match." />
                  : tickets.map((t) => <TicketCard key={t.ticket_id} t={t} />)
                : <DataNotice title="Loading tickets…" detail="Please wait." />
            )}
            {panel === "hotels"      && data.hotels.slice(0, 6).map((h) => <Nearby key={h.name} name={h.name} sub={h.region} price={`${"★".repeat(h.stars)} · ${h.price}`} />)}
            {panel === "restaurants" && data.restaurants.slice(0, 6).map((r) => <Nearby key={r.name} name={r.name} sub={`${r.flavor} · ${r.region}`} price={`${r.price} · ★ ${r.score}`} />)}
            {panel === "events"      && data.fanEvents.slice(0, 6).map((e) => <Nearby key={e.id} name={e.name} sub={e.area || e.venue} price={e.date || "See details"} />)}
            {panel === "squad" && (
              squad
                ? squad.map((p) => <Nearby key={p.player_id} name={`${p.player_name}${p.is_star ? " ★" : ""}`} sub={`${p.position} · ${p.club}`} price={`${p.caps} caps · ${p.goals} goals`} />)
                : <DataNotice title="Loading squad…" detail="Please wait." />
            )}
          </div>

          <div className="mo-explore-cta">
            <button className="mo-explore-btn" onClick={() => { onClose(); onExplore(); }}>
              Explore LA Hotels, Restaurants &amp; Events →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
