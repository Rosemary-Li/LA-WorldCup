"""
LLM-generated match preview stories.

Calls Claude Opus 4.7 with structured outputs (Pydantic schema) to produce
a {title, desc, bullets} object per match. Caches the result in-memory by
match_number so repeated overlay opens don't burn API calls.

Falls back to a RuntimeError if ANTHROPIC_API_KEY is not configured — the
caller should catch and use the hardcoded matchMeta.story as fallback.
"""

import logging
import os
from typing import List

from anthropic import Anthropic
from pydantic import BaseModel

log = logging.getLogger(__name__)


class MatchStory(BaseModel):
    title: str
    desc: str
    bullets: List[str]


# match_number → cached dict
_STORY_CACHE: dict[str, dict] = {}
_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise RuntimeError("ANTHROPIC_API_KEY not configured in backend/.env")
        _client = Anthropic()
    return _client


_SYSTEM_PROMPT = """You are a sports journalist writing dramatic match preview stories for FIFA World Cup 2026 matches at SoFi Stadium in Los Angeles.

Output a JSON object with these fields:
- title: A dramatic, evocative 4–8 word headline (e.g. "A Battle of Style and Spirit", "Crescent and Stars Meet Stars and Stripes")
- desc: 2–3 sentences (max 60 words) describing the matchup, stakes, and tactical narrative
- bullets: Exactly 3 specific tactical or storyline observations (each ≤ 14 words)

Guidelines:
- Be specific to the actual teams. Reference real player styles, recent form, manager tactics, or known characteristics when possible
- Match the tone of premium sports media — confident, knowledgeable, evocative
- Avoid generic clichés like "everything to play for", "every game is a final", or "anything can happen"
- For TBD/Playoff matches: focus on the stage, stadium atmosphere, and what's at stake
"""


def generate_story(match_number: str, ctx: dict, force: bool = False) -> dict:
    """Generate or fetch cached match story.

    ctx keys: home_country, away_country, home_rank, away_rank, stage, date
    """
    if not force and match_number in _STORY_CACHE:
        return _STORY_CACHE[match_number]

    home       = ctx.get("home_country") or "TBD"
    away       = ctx.get("away_country") or "TBD"
    home_rank  = ctx.get("home_rank") or "—"
    away_rank  = ctx.get("away_rank") or "—"
    stage      = ctx.get("stage", "Group Stage")
    date       = ctx.get("date", "")

    user_msg = (
        f"Match: {home} vs {away}\n"
        f"Stage: {stage}\n"
        f"Date: {date}\n"
        f"Venue: SoFi Stadium, Los Angeles\n"
        f"FIFA Rankings: {home} (#{home_rank}), {away} (#{away_rank})\n\n"
        f"Generate the story."
    )

    client = _get_client()
    response = client.messages.parse(
        model="claude-opus-4-7",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
        output_format=MatchStory,
    )

    result = response.parsed_output.model_dump()
    _STORY_CACHE[match_number] = result
    log.info("Generated story for %s · %s vs %s", match_number, home, away)
    return result
