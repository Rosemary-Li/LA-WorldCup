-- ─────────────────────────────────────────────────────────────────
-- 001_journey_share — table for persisted shareable Journey itineraries
--
-- A user clicks "Share" on a generated itinerary; the frontend POSTs the
-- full payload here and gets back a short 8-char ID. The shareable URL
-- (https://la-world-cup-journey.vercel.app/?i=<id>) loads the same
-- itinerary for any visitor.
--
-- Apply once with:
--   psql "$DATABASE_URL" -f database/migrations/001_journey_share.sql
-- (or run backend/scripts/init_share_table.py which wraps the same SQL)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journey_share (
    id          TEXT        PRIMARY KEY,
    payload     JSONB       NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count  INTEGER     NOT NULL DEFAULT 0
);

-- Allow purging old shares later without re-scanning the whole table.
CREATE INDEX IF NOT EXISTS idx_journey_share_created_at
    ON journey_share (created_at DESC);
