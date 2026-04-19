// ═══════════════════════════════════════════════════
//  SECTION: OVERLAY
// ═══════════════════════════════════════════════════

document.getElementById('mount-overlay').innerHTML = `
    <!-- MATCH DETAIL OVERLAY -->
    <div id="matchOverlay">
      <div class="overlay-inner" id="overlayContent"></div>
      <button class="overlay-close" onclick="closeMatch()">✕</button>
    </div>
`;
