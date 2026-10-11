// api/splash.js
// Returns a random Minecraft-style "splash text" as an animated SVG image.
// Embed it in a README with: ![splash](https://your-deployment.vercel.app/api/splash)

// ---------------------------------------------------------------------------
// CONFIG — tweak everything here. No other part of the file needs to change.
// ---------------------------------------------------------------------------
const CONFIG = {
  // Pool of splash texts. One is picked at random on every request.
  splashes: [
    "Also try Hungry mode!",
    "100% pure splash text!",
    "Now with extra pixels!",
    "Powered by vibes!",
    "Still compiling...",
    "May contain bugs!",
    "Over 9000 commits!",
    "Now in 3D!",
  ],

  // Canvas size in pixels. Fixed so the embedded image doesn't jump around
  // between reloads; long splashes shrink their font instead of growing the canvas.
  width: 420,
  height: 150,

  // Safety margin (px) kept clear on every side so the tilted, pulsing text
  // never clips at the image edges.
  padding: 20,

  // Typography
  fontFamily: "'Courier New', Courier, monospace",
  fontWeight: "bold",
  baseFontSize: 32, // starting font size, shrinks automatically for long splashes
  minFontSize: 14, // never shrink smaller than this
  // Rough width of one monospace character as a multiple of the font size.
  // Used only to estimate whether text fits — doesn't need to be exact.
  charWidthFactor: 0.62,

  // Colors
  textColor: "#FFFF00",
  shadowColor: "#3F3F00",
  shadowOffsetX: 3,
  shadowOffsetY: 3,

  // Tilt, applied to the whole text (shadow + main) as one rigid group.
  rotateDeg: -20,

  // Pulse animation: scale 1 -> pulseMaxScale -> 1, looping forever.
  pulseMaxScale: 1.1,
  pulseDurationSec: 0.5,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Escape XML special characters so any splash text is safe to embed.
function escapeXml(text) {
  return text.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
    }
  });
}

// Pick the largest font size (down to minFontSize) whose estimated,
// rotated+pulsed bounding box still fits inside the padded canvas.
function fitFontSize(text, cfg) {
  const theta = (Math.abs(cfg.rotateDeg) * Math.PI) / 180;
  const maxW = cfg.width - cfg.padding * 2;
  const maxH = cfg.height - cfg.padding * 2;

  for (let size = cfg.baseFontSize; size > cfg.minFontSize; size--) {
    const textWidth = text.length * size * cfg.charWidthFactor;
    const textHeight = size * 1.2; // approx line height

    // Bounding box of a w x h rectangle rotated by theta, then scaled up by
    // the pulse's largest size so the animation never pokes past the edges.
    const bboxW =
      (textWidth * Math.cos(theta) + textHeight * Math.sin(theta)) *
      cfg.pulseMaxScale;
    const bboxH =
      (textWidth * Math.sin(theta) + textHeight * Math.cos(theta)) *
      cfg.pulseMaxScale;

    if (bboxW <= maxW && bboxH <= maxH) return size;
  }
  return cfg.minFontSize;
}

function buildSvg(splash, cfg) {
  const text = escapeXml(splash);
  const fontSize = fitFontSize(splash, cfg);

  const cx = cfg.width / 2;
  const cy = cfg.height / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cfg.width} ${cfg.height}" width="${cfg.width}" height="${cfg.height}">
  <style>
    @keyframes splash-pulse {
      0%, 100% { transform: rotate(${cfg.rotateDeg}deg) scale(1); }
      50%      { transform: rotate(${cfg.rotateDeg}deg) scale(${cfg.pulseMaxScale}); }
    }
    .splash-group {
      transform-origin: ${cx}px ${cy}px;
      animation: splash-pulse ${cfg.pulseDurationSec}s ease-in-out infinite;
    }
    .splash-text {
      font-family: ${cfg.fontFamily};
      font-weight: ${cfg.fontWeight};
      font-size: ${fontSize}px;
      text-anchor: middle;
      dominant-baseline: middle;
    }
  </style>
  <g class="splash-group">
    <text class="splash-text" x="${cx + cfg.shadowOffsetX}" y="${cy + cfg.shadowOffsetY}" fill="${cfg.shadowColor}">${text}</text>
    <text class="splash-text" x="${cx}" y="${cy}" fill="${cfg.textColor}">${text}</text>
  </g>
</svg>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default function handler(req, res) {
  const splash =
    CONFIG.splashes[Math.floor(Math.random() * CONFIG.splashes.length)];

  const svg = buildSvg(splash, CONFIG);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(200).send(svg);
}
