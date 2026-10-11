// api/splash.js
// Returns a random Minecraft-style "splash text" as an animated SVG image.
// Embed it in a README with: ![splash](https://your-deployment.vercel.app/api/splash)

import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// CONFIG — tweak everything here. No other part of the file needs to change.
// ---------------------------------------------------------------------------
const CONFIG = {
  // Pool of splash texts. One is picked at random on every request.
  splashes: [
    "Also visit tomandesMSH!",
    "Also visit dan-cech",
    "Slop wizardry!",
    "minceraft",
    "To je co?",
    "Bylo to hryznuti rocniku 87?",
    "claude jak se to dela",
    "hello",
  ],

  // Canvas size in pixels. Fixed so the embedded image doesn't jump around
  // between reloads; long splashes shrink their font instead of growing the canvas.
  width: 420,
  height: 150,

  // Safety margin (px) kept clear on every side so the tilted, pulsing text
  // never clips at the image edges.
  padding: 20,

  // Typography
  // Drop a .ttf file at fonts/splash.ttf (repo root) to use a custom font.
  // It's embedded into the SVG itself, so it still works when GitHub loads
  // this as a plain <img>. If the file isn't there, this falls back to
  // fontFamily below with no errors.
  customFontPath: "fonts/splash.ttf", // relative to the project root
  customFontName: "SplashFont",
  fontFamily: "'Courier New', Courier, monospace", // fallback stack
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
  rotateDeg: -10,

  // Pulse animation: scale 1 -> pulseMaxScale -> 1, looping forever.
  pulseMaxScale: 1.05,
  pulseDurationSec: 0.8,
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

// Load the custom .ttf (if present) once, as a base64 data URI, so it can be
// inlined into the SVG's @font-face — GitHub renders this as a plain <img>,
// which can't fetch a separate linked font file, so embedding is required.
// Runs once at cold start, not per-request.
function loadCustomFontDataUri(cfg) {
  try {
    const fontPath = join(process.cwd(), cfg.customFontPath);
    const fontBuffer = readFileSync(fontPath);
    return `data:font/ttf;base64,${fontBuffer.toString("base64")}`;
  } catch {
    return null; // no font file yet — fall back to cfg.fontFamily
  }
}

const CUSTOM_FONT_DATA_URI = loadCustomFontDataUri(CONFIG);

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

  // Only emit @font-face when a custom font was actually found on disk.
  const fontFaceBlock = CUSTOM_FONT_DATA_URI
    ? `@font-face {
      font-family: '${cfg.customFontName}';
      src: url(${CUSTOM_FONT_DATA_URI}) format('truetype');
    }`
    : "";
  const fontFamilyCss = CUSTOM_FONT_DATA_URI
    ? `'${cfg.customFontName}', ${cfg.fontFamily}`
    : cfg.fontFamily;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cfg.width} ${cfg.height}" width="${cfg.width}" height="${cfg.height}">
  <style>
    ${fontFaceBlock}
    @keyframes splash-pulse {
      0%, 100% { transform: rotate(${cfg.rotateDeg}deg) scale(1); }
      50%      { transform: rotate(${cfg.rotateDeg}deg) scale(${cfg.pulseMaxScale}); }
    }
    .splash-group {
      transform-origin: ${cx}px ${cy}px;
      animation: splash-pulse ${cfg.pulseDurationSec}s ease-in-out infinite;
    }
    .splash-text {
      font-family: ${fontFamilyCss};
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
