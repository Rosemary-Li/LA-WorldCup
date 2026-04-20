// ═══════════════════════════════════════════════════
//  SECTION: OVERLAY
// ═══════════════════════════════════════════════════

document.getElementById('mount-overlay').innerHTML = `
    <!-- MATCH DETAIL OVERLAY -->
    <div id="matchOverlay">
      <div class="overlay-inner" id="overlayContent"></div>
      <button class="overlay-close" onclick="closeMatch()">✕</button>
    </div>

    <!-- EVENT DETAIL OVERLAY -->
    <div id="eventOverlay" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,10,10,0.88);z-index:300;overflow-y:auto;">
      <div id="eventOverlayContent" style="max-width:640px;margin:5rem auto 4rem;padding:2.5rem;background:var(--paper);position:relative;"></div>
      <button onclick="closeEventDetail()" style="position:fixed;top:1.5rem;right:2rem;background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--paper);font-family:'DM Mono',monospace;z-index:301;">✕</button>
    </div>
`;
