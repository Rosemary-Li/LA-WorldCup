// ─────────────────────────────────────────────────────────────────
// Calendar export helpers
//
// Two outputs:
//   1) buildIcsBlob(data) — full multi-event .ics file for one-click batch
//      import into Google / Apple / Outlook Calendar.
//   2) googleCalendarUrl(act, date) — per-activity URL that opens Google
//      Calendar's "create event" form pre-filled.
//
// Date math: the backend pins the chosen match to Day 3 of the itinerary,
// so every day's calendar date is derived as (match_date + day_num - 3).
// ─────────────────────────────────────────────────────────────────

const TZID  = "America/Los_Angeles";
const YEAR  = 2026;                              // World Cup '26 — always

// Default activity duration in minutes, picked so kickoff doesn't overlap
// with dinner and museums get a believable visit window.
const DURATION_MIN = {
  match:        180,
  restaurant:    75,
  default:       90,
};

const MONTHS = {
  january:   0, february:  1, march:     2, april:     3,
  may:       4, june:      5, july:      6, august:    7,
  september: 8, october:   9, november: 10, december: 11,
};

// Parses "June 12" / "Jun 12" / "june12" into a Date for noon (kept neutral —
// the per-activity time gets layered on top).
export function parseMatchDate(str, year = YEAR) {
  if (!str) return null;
  const m = String(str).trim().toLowerCase()
    .match(/^([a-z]+)\.?\s*(\d{1,2})/);
  if (!m) return null;
  const month = MONTHS[m[1]] ?? MONTHS[m[1].slice(0, 3) + "uary"];
  const monthIdx = MONTHS[m[1]] ?? Object.entries(MONTHS).find(([k]) => k.startsWith(m[1]))?.[1];
  if (monthIdx == null) return null;
  return new Date(year, monthIdx, parseInt(m[2], 10), 12, 0, 0);
}

// dayNum is 1-based; match is day 3 by convention.
export function dateForDay(matchDate, dayNum) {
  if (!matchDate) return null;
  const d = new Date(matchDate);
  d.setDate(d.getDate() + (dayNum - 3));
  return d;
}

function durationFor(act) {
  return DURATION_MIN[act?.source] || DURATION_MIN.default;
}

function applyTime(date, timeStr) {
  if (!date) return null;
  const out = new Date(date);
  const [h, m] = String(timeStr || "12:00").split(":").map((n) => parseInt(n, 10) || 0);
  out.setHours(h, m, 0, 0);
  return out;
}

// "20260612T093000" — used by both ICS (as floating local time + TZID) and
// Google Calendar (as naive local time + ctz= param).
function formatLocalDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

// Newlines + commas + semicolons must be escaped in ICS values.
function escapeIcs(s = "") {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// 75-char folding for ICS lines (RFC 5545). Most calendars are forgiving but
// Outlook chokes on long unfolded lines.
function foldLine(line) {
  if (line.length <= 75) return line;
  const parts = [];
  let i = 0;
  while (i < line.length) {
    parts.push((i === 0 ? "" : " ") + line.slice(i, i + 73));
    i += 73;
  }
  return parts.join("\r\n");
}

function activityLocation(act) {
  if (act?.source === "match") return "SoFi Stadium, 1001 S Stadium Dr, Inglewood, CA 90301";
  // Many activities only carry a `desc` like "Downtown LA · South American · $20-30".
  // Take the first segment as a rough location hint.
  const parts = String(act?.desc || "").split("·").map((s) => s.trim()).filter(Boolean);
  return parts[0] || "Los Angeles, CA";
}

function buildEvents(data) {
  const matchDate = parseMatchDate(data?.match?.date);
  const events = [];

  (data?.days || []).forEach((day, dayIdx) => {
    const dayDate = dateForDay(matchDate, day.day_num ?? dayIdx + 1);
    (day.activities || []).forEach((act, actIdx) => {
      const start = applyTime(dayDate, act.time);
      if (!start) return;
      const end = new Date(start.getTime() + durationFor(act) * 60_000);
      events.push({
        uid: `${data?.match?.id || data?.match?.label || "trip"}-${day.day_num || dayIdx}-${actIdx}@la-wc26`.replace(/\s+/g, "-").toLowerCase(),
        start,
        end,
        title: act.title || "LA × WC26 activity",
        description: act.desc || "",
        location: activityLocation(act),
      });
    });
  });

  return events;
}

export function buildIcsBlob(data) {
  const events = buildEvents(data);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LA × WC26//Journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine("X-WR-CALNAME:" + escapeIcs("LA × WC26 Journey")),
    foldLine("X-WR-TIMEZONE:" + TZID),
  ];

  events.forEach((ev) => {
    lines.push(
      "BEGIN:VEVENT",
      foldLine("UID:" + ev.uid),
      foldLine("DTSTAMP:" + formatLocalDateTime(new Date()) + "Z"),
      foldLine(`DTSTART;TZID=${TZID}:` + formatLocalDateTime(ev.start)),
      foldLine(`DTEND;TZID=${TZID}:`   + formatLocalDateTime(ev.end)),
      foldLine("SUMMARY:"     + escapeIcs(ev.title)),
      foldLine("LOCATION:"    + escapeIcs(ev.location)),
      foldLine("DESCRIPTION:" + escapeIcs(ev.description)),
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  // CRLF line endings — RFC 5545 is strict about this.
  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
}

export function googleCalendarUrl(act, dayDate) {
  const start = applyTime(dayDate, act.time);
  if (!start) return null;
  const end = new Date(start.getTime() + durationFor(act) * 60_000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: act.title || "LA × WC26 activity",
    dates: `${formatLocalDateTime(start)}/${formatLocalDateTime(end)}`,
    details: act.desc || "",
    location: activityLocation(act),
    ctz: TZID,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
