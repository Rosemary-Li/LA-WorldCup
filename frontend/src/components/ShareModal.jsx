import { useEffect, useMemo, useState } from "react";
import { saveJourneyShare } from "../api.js";

// Simple inline SVG icons — keeps the bundle clean (no icon library needed).
const SVG = (path) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">{path}</svg>
);

const ICONS = {
  link: SVG(<path d="M10.59 13.41a1 1 0 0 0 1.41 0l4-4a3 3 0 1 0-4.24-4.24l-1 1a1 1 0 1 0 1.41 1.41l1-1a1 1 0 1 1 1.41 1.41l-4 4a1 1 0 0 0 0 1.42zm2.82-2.82a1 1 0 0 0-1.41 0l-4 4a3 3 0 1 0 4.24 4.24l1-1a1 1 0 1 0-1.41-1.41l-1 1a1 1 0 1 1-1.41-1.41l4-4a1 1 0 0 0 0-1.42z" />),
  x: SVG(<path d="M18.244 2H21l-6.49 7.42L22 22h-6.16l-4.83-6.32L5.4 22H2.64l6.95-7.95L2 2h6.32l4.36 5.78L18.244 2zm-1.08 18h1.7L7 4h-1.8l11.964 16z" />),
  linkedin: SVG(<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.4H6.17V17h2.17zm-1.08-7.51a1.26 1.26 0 1 0 0-2.52 1.26 1.26 0 0 0 0 2.52zM18 17v-3.83c0-2.05-1.1-3-2.56-3a2.21 2.21 0 0 0-2 1.1V10.4h-2.16V17h2.16v-3.5a1.48 1.48 0 0 1 1.49-1.6c.79 0 1.07.6 1.07 1.6V17H18z" />),
  reddit: SVG(<path d="M22 12.07a2.07 2.07 0 0 0-3.5-1.5 10.43 10.43 0 0 0-5.5-1.7l1-4.6 3.2.7a1.45 1.45 0 1 0 .15-.97l-3.6-.78a.5.5 0 0 0-.59.38l-1.13 5.27a10.4 10.4 0 0 0-5.6 1.71 2.07 2.07 0 1 0-2.27 3.39 4.9 4.9 0 0 0-.06.71c0 3.37 3.79 6.1 8.45 6.1S20.95 18 20.95 14.6a4.9 4.9 0 0 0-.07-.74A2.07 2.07 0 0 0 22 12.07zm-14.6 1.43a1.4 1.4 0 1 1 1.4 1.4 1.4 1.4 0 0 1-1.4-1.4zm7.94 4.36a4.66 4.66 0 0 1-3.34 1.07 4.66 4.66 0 0 1-3.34-1.07.5.5 0 0 1 .68-.74 3.74 3.74 0 0 0 2.66.81 3.74 3.74 0 0 0 2.66-.81.5.5 0 0 1 .68.74zm-.34-2.96a1.4 1.4 0 1 1 1.4-1.4 1.4 1.4 0 0 1-1.4 1.4z" />),
  download: SVG(<path d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42L11 13.59V4a1 1 0 0 1 1-1zM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z" />),
  close: SVG(<path d="M6.7 5.3a1 1 0 0 0-1.4 1.4L10.6 12l-5.3 5.3a1 1 0 1 0 1.4 1.4L12 13.4l5.3 5.3a1 1 0 0 0 1.4-1.4L13.4 12l5.3-5.3a1 1 0 0 0-1.4-1.4L12 10.6 6.7 5.3z" />),
  share: SVG(<path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />),
  instagram: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13.67.65 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.73 2.13-1.38.65-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  ),
};

const SITE_URL = "https://la-world-cup-journey.vercel.app/";
const SITE_TEXT = "I just planned my LA × WC26 trip — check out the full guide:";

// Build the shareable URL once we have a save ID. Uses the same origin the
// modal is running in so dev/prod both work without env wiring.
function shareUrlFor(shareId) {
  if (typeof window === "undefined") {
    return shareId ? `${SITE_URL}?i=${shareId}` : SITE_URL;
  }
  const origin = window.location.origin + window.location.pathname.replace(/\/$/, "/");
  return shareId ? `${origin}?i=${shareId}` : (window.location.origin + "/");
}

export default function ShareModal({ open, onClose, onGeneratePng, data }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [blob, setBlob] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [shareId, setShareId] = useState("");
  const [savingShare, setSavingShare] = useState(false);

  const shareUrl = useMemo(() => shareUrlFor(shareId), [shareId]);

  // Generate the PNG once when the modal opens. Releases the object URL on
  // close so we don't leak memory across multiple share sessions.
  useEffect(() => {
    if (!open) return;
    let revoked = false;
    let createdUrl = "";

    (async () => {
      setGenerating(true);
      setError("");
      try {
        const generatedBlob = await onGeneratePng();
        if (revoked) return;
        createdUrl = URL.createObjectURL(generatedBlob);
        setBlob(generatedBlob);
        setPreviewUrl(createdUrl);
      } catch (err) {
        console.error("[share] preview generation failed:", err);
        if (!revoked) setError("Couldn't generate the preview — please try again.");
      } finally {
        if (!revoked) setGenerating(false);
      }
    })();

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setPreviewUrl("");
      setBlob(null);
      setGenerating(false);
      setError("");
    };
  }, [open, onGeneratePng]);

  // Persist the itinerary and get a short ID so links open the user's actual
  // plan, not just the homepage. Runs in parallel with PNG generation.
  useEffect(() => {
    if (!open) return;
    if (!data) return;
    let cancelled = false;
    setSavingShare(true);
    setShareId("");

    (async () => {
      try {
        const id = await saveJourneyShare(data);
        if (!cancelled) setShareId(id);
      } catch (err) {
        // Non-fatal: the link buttons fall back to the homepage URL.
        console.warn("[share] could not save shareable journey:", err);
      } finally {
        if (!cancelled) setSavingShare(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, data]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function showToast(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(shareId ? "Itinerary link copied" : "Site link copied (couldn't save share — try again)");
    } catch {
      showToast("Couldn't copy — please copy manually");
    }
  }

  function openIntent(url) {
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=540");
  }

  function handleDownload() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "la-wc26-journey.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast("Image downloaded — open Instagram and add it as a Story");
  }

  async function handleNativeShare() {
    if (!blob) return;
    const file = new File([blob], "la-wc26-journey.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: "My LA × WC26 Journey",
          text: SITE_TEXT,
          url: shareUrl,
        });
      } catch (err) {
        if (err && err.name !== "AbortError") console.warn("[share] native share failed:", err);
      }
    }
  }

  if (!open) return null;

  const hasNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    blob &&
    navigator.canShare?.({ files: [new File([blob], "x.png", { type: "image/png" })] });

  const matchTitle = data?.match?.label;
  const days = data?.days?.length;
  const headline = matchTitle ? `My LA × WC26 trip — ${matchTitle}` : "My LA × WC26 travel guide";
  const tweetText = matchTitle
    ? `${SITE_TEXT} ${matchTitle}, ${days || 0}-day plan → `
    : `${SITE_TEXT} `;

  const xUrl        = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const redditUrl   = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(headline)}`;

  return (
    <div className="sm-backdrop" onClick={onClose}>
      <div className="sm-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share">
        <header className="sm-head">
          <h2 className="sm-title">{headline}</h2>
          <div className="sm-head-actions">
            <button className="sm-icon-btn" onClick={onClose} title="Close" aria-label="Close">
              {ICONS.close}
            </button>
          </div>
        </header>

        {/* Mobile-only — opens the OS share sheet so the user can pick
            Instagram (Story / Feed / Direct) in one tap. Hidden on desktop
            where Web Share API typically can't reach IG. */}
        {hasNativeShare && (
          <button className="sm-ig-cta" onClick={handleNativeShare}>
            <span className="sm-ig-cta-icon">{ICONS.instagram}</span>
            <span className="sm-ig-cta-text">
              <strong>Share to Instagram</strong>
              <em>Story · Feed · Direct</em>
            </span>
            <span className="sm-ig-cta-chev">›</span>
          </button>
        )}

        <div className="sm-preview">
          {generating && <div className="sm-preview-loading">Crafting your card…</div>}
          {error && <div className="sm-preview-error">{error}</div>}
          {previewUrl && !error && (
            <img src={previewUrl} alt="Your itinerary share card" className="sm-preview-img" />
          )}
        </div>

        <div className="sm-actions">
          <button className="sm-action" onClick={handleCopyLink} title="Copy link">
            <span className="sm-action-bubble">{ICONS.link}</span>
            <span className="sm-action-label">Copy link</span>
          </button>
          <button className="sm-action" onClick={() => openIntent(xUrl)} title="Share on X">
            <span className="sm-action-bubble">{ICONS.x}</span>
            <span className="sm-action-label">X</span>
          </button>
          <button className="sm-action" onClick={() => openIntent(linkedinUrl)} title="Share on LinkedIn">
            <span className="sm-action-bubble">{ICONS.linkedin}</span>
            <span className="sm-action-label">LinkedIn</span>
          </button>
          <button className="sm-action" onClick={() => openIntent(redditUrl)} title="Share on Reddit">
            <span className="sm-action-bubble">{ICONS.reddit}</span>
            <span className="sm-action-label">Reddit</span>
          </button>
          <button className="sm-action" onClick={handleDownload} title="Download image" disabled={!blob}>
            <span className="sm-action-bubble">{ICONS.download}</span>
            <span className="sm-action-label">Download</span>
          </button>
        </div>

        {toast && <div className="sm-toast">{toast}</div>}
      </div>
    </div>
  );
}
