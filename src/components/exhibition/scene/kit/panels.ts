import type * as THREE from "three";
import { brandFontFamily, canvas, finish, loadImage, rng } from "../textures";

/**
 * Graphic panels for booths and the entertainment zone — our own drawings
 * that echo the content of the preliminary renders (dashboards, maps,
 * funnels, infographics, playfields). No third-party marks, footage or
 * invented claims; text is limited to captions visible in the renders.
 */

const NAVY = "#17204a";
const INK = "#0d1330";
const CORAL = "#f26557";
const GREEN = "#4ea649";
const FUCHSIA = "#944399";
const PAPER = "#eceff5";

async function fonts(sample: string) {
  try {
    await document.fonts.load(`600 48px ${brandFontFamily()}`, sample);
  } catch {
    /* fall back */
  }
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size: number,
  opts: { weight?: number; color?: string; align?: CanvasTextAlign; dir?: CanvasDirection } = {},
) {
  ctx.font = `${opts.weight ?? 600} ${size}px ${brandFontFamily()}`;
  ctx.fillStyle = opts.color ?? PAPER;
  ctx.textAlign = opts.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.direction = opts.dir ?? "rtl";
  ctx.fillText(s, x, y);
}

/** Navy header fascia: centred bilingual title with the official KORA lockup at both ends. */
export async function fasciaTexture(title: string, subtitle?: string) {
  await fonts(title);
  const { c, ctx } = canvas(2048, 256);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, c.width, c.height);
  text(ctx, title, c.width / 2, subtitle ? 100 : 128, 92, { weight: 700 });
  if (subtitle) text(ctx, subtitle, c.width / 2, 192, 50, { weight: 500, dir: "ltr", color: "rgba(236,239,245,0.8)" });
  const en = await loadImage("/assets/brand/kora-lockup-en.png");
  const h = 70;
  const w = (en.width / en.height) * h;
  ctx.drawImage(en, 70, (c.height - h) / 2, w, h);
  ctx.drawImage(en, c.width - 70 - w, (c.height - h) / 2, w, h);
  ctx.fillStyle = CORAL;
  ctx.fillRect(70 + w + 6, (c.height - h) / 2 - 6, 14, 14);
  ctx.fillRect(c.width - 70 + 6, (c.height - h) / 2 - 6, 14, 14);
  return finish(c);
}

/** Wall panel: heading + body lines, optional accent bar. */
export async function infoPanelTexture(heading: string, lines: string[], opts: { accent?: string; width?: number; height?: number; bg?: string } = {}) {
  await fonts(heading + lines.join(" "));
  const { width = 512, height = 768, accent = CORAL, bg = NAVY } = opts;
  const { c, ctx } = canvas(width, height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = accent;
  ctx.fillRect(width - 14, 0, 14, height);
  text(ctx, heading, width - 40, 70, 44, { weight: 700, align: "right" });
  lines.forEach((l, i) => text(ctx, l, width - 40, 140 + i * 40, 24, { weight: 400, align: "right", color: "rgba(236,239,245,0.75)" }));
  return { c, ctx, tex: finish(c) };
}

/** Stadium operations dashboard (tech / economy back screens). */
export function dashboardTexture(seed: number) {
  const { c, ctx } = canvas(1024, 512);
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, 1024, 512);
  g.addColorStop(0, "#0b1f3e");
  g.addColorStop(1, "#06122a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  // Central stadium (aerial ellipse).
  ctx.save();
  ctx.translate(512, 270);
  ctx.fillStyle = "#c9ccd4";
  ctx.beginPath();
  ctx.ellipse(0, 0, 230, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8f95a3";
  ctx.beginPath();
  ctx.ellipse(0, 0, 190, 118, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d8f45";
  ctx.fillRect(-120, -70, 240, 140);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-110, -62, 220, 124);
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(0, 62);
  ctx.stroke();
  ctx.restore();
  // Side widgets.
  for (const x of [30, 820]) {
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = "rgba(90,140,255,0.12)";
      ctx.fillRect(x, 40 + k * 150, 174, 130);
      ctx.strokeStyle = "rgba(120,170,255,0.5)";
      ctx.strokeRect(x, 40 + k * 150, 174, 130);
      ctx.strokeStyle = k === 1 ? "#4ea649" : "#5aa7ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const px = x + 12 + i * 16;
        const py = 40 + k * 150 + 100 - r() * 60;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  return finish(c);
}

/** Simplified world map with highlighted markers (investors panel). */
export function worldMapTexture() {
  const { c, ctx } = canvas(512, 300);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, 512, 300);
  ctx.fillStyle = "#c8b25a";
  const blobs: [number, number, number, number][] = [
    [110, 100, 70, 45],
    [140, 190, 35, 55],
    [260, 95, 45, 35],
    [270, 175, 40, 55],
    [360, 110, 85, 45],
    [420, 210, 35, 22],
  ];
  for (const [x, y, rx, ry] of blobs) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = GREEN;
  for (const [x, y] of [
    [300, 140],
    [120, 90],
    [370, 105],
  ])
    ctx.fillRect(x - 6, y - 6, 12, 12);
  return finish(c);
}

/** Funnel infographic "A → B" (entrepreneurship). */
export async function funnelTexture(from: string, to: string, steps: string[]) {
  await fonts(steps.join(" "));
  const { c, ctx } = canvas(512, 768);
  ctx.fillStyle = "#1d2236";
  ctx.fillRect(0, 0, 512, 768);
  text(ctx, from, 130, 80, 46, { weight: 700, dir: "ltr" });
  text(ctx, "→", 256, 80, 46, { dir: "ltr" });
  text(ctx, to, 382, 80, 46, { weight: 700, dir: "ltr" });
  steps.forEach((s, i) => {
    const w = 380 - i * 60;
    ctx.strokeStyle = "rgba(236,239,245,0.7)";
    ctx.lineWidth = 3;
    ctx.strokeRect(256 - w / 2, 170 + i * 110, w, 80);
    text(ctx, s, 256, 210 + i * 110, 36, { dir: "ltr" });
  });
  return finish(c);
}

/** Pinned idea cards (entrepreneurship left wall). */
export function cardsWallTexture() {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#1d2236";
  ctx.fillRect(0, 0, 512, 512);
  const tops = [FUCHSIA, CORAL, GREEN, NAVY, CORAL, GREEN];
  for (let i = 0; i < 6; i++) {
    const x = 30 + (i % 3) * 160;
    const y = 40 + Math.floor(i / 3) * 230;
    ctx.fillStyle = "#f2f2f5";
    ctx.fillRect(x, y, 140, 190);
    ctx.fillStyle = tops[i];
    ctx.fillRect(x, y, 140, 22);
    ctx.fillStyle = "rgba(20,25,50,0.45)";
    for (let k = 0; k < 6; k++) ctx.fillRect(x + 14, y + 44 + k * 22, 112 - (k % 3) * 18, 7);
  }
  return finish(c);
}

/** Medical infographic screen (health corner). */
export function infographicTexture() {
  const { c, ctx } = canvas(512, 300);
  ctx.fillStyle = "#0d2a44";
  ctx.fillRect(0, 0, 512, 300);
  const bars = [60, 110, 150, 90, 130];
  bars.forEach((h, i) => {
    ctx.fillStyle = i % 2 ? "#4fd6e8" : "#2a8fb8";
    ctx.fillRect(40 + i * 34, 250 - h, 22, h);
  });
  ctx.lineWidth = 26;
  const arcs = ["#4fd6e8", "#2a8fb8", "#eceff5"];
  let a = -Math.PI / 2;
  [0.45, 0.35, 0.2].forEach((f, i) => {
    ctx.strokeStyle = arcs[i];
    ctx.beginPath();
    ctx.arc(380, 150, 70, a, a + f * Math.PI * 2);
    ctx.stroke();
    a += f * Math.PI * 2;
  });
  return finish(c);
}

/** A row of lit display niches with small objects (health kit wall). */
export function nichesTexture() {
  const { c, ctx } = canvas(512, 256);
  ctx.fillStyle = "#0b1118";
  ctx.fillRect(0, 0, 512, 256);
  const items = ["#d24b3c", "#2c2c2c", "#e7e7e7", "#3a6fc4", "#e3a53b", "#2c2c2c", "#e7e7e7", "#c93b3b"];
  for (let i = 0; i < 8; i++) {
    const x = 18 + (i % 4) * 124;
    const y = 18 + Math.floor(i / 4) * 120;
    const g = ctx.createLinearGradient(x, y, x, y + 104);
    g.addColorStop(0, "#f4fbff");
    g.addColorStop(1, "#b9d4e2");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, 104, 104);
    ctx.fillStyle = items[i];
    ctx.fillRect(x + 32, y + 30, 40, 50);
  }
  return finish(c);
}

/** Generic stylised football match frame for big screens (no game/brand marks). */
export function matchScreenTexture(seed: number) {
  const { c, ctx } = canvas(1024, 576);
  const r = rng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, "#0e1838");
  sky.addColorStop(1, "#2c3e78");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 220);
  // Stands.
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `hsl(${220 + r() * 30}, 30%, ${20 + r() * 30}%)`;
    ctx.fillRect(r() * 1024, 120 + r() * 110, 6, 5);
  }
  // Pitch in perspective.
  ctx.fillStyle = "#2f8a3f";
  ctx.beginPath();
  ctx.moveTo(140, 230);
  ctx.lineTo(884, 230);
  ctx.lineTo(1024, 576);
  ctx.lineTo(0, 576);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(512, 230);
  ctx.lineTo(512, 576);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(512, 380, 120, 50, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#f2f2f2" : "#22357a";
    const x = 160 + r() * 700;
    const y = 280 + r() * 240;
    ctx.fillRect(x, y - 26, 10, 26);
  }
  return finish(c);
}

/** Air-hockey / foosball / table-tennis style playfield. */
export function playfieldTexture(kind: "hockey" | "foosball" | "tennis" | "pitch") {
  const { c, ctx } = canvas(512, 256);
  const fill = { hockey: "#e9f2ff", foosball: "#2f8a3f", tennis: "#1f4f8f", pitch: "#3a9a48" }[kind];
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = kind === "hockey" ? "#d24b3c" : "rgba(255,255,255,0.85)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.beginPath();
  ctx.moveTo(256, 10);
  ctx.lineTo(256, 246);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(256, 128, kind === "tennis" ? 0.1 : 46, 0, Math.PI * 2);
  ctx.stroke();
  if (kind === "pitch") {
    ctx.strokeRect(10, 70, 70, 116);
    ctx.strokeRect(432, 70, 70, 116);
  }
  return finish(c);
}

/** Entertainment arch sign: title + strapline from the render. */
export async function entertainmentSignTexture() {
  const title = "ركن الترفيه";
  const sub = "اختبر مهاراتك وتحدَّ أصدقاءك في كرة القدم";
  await fonts(title + sub);
  const { c, ctx } = canvas(1024, 320);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(8, 8, 1008, 304, 60);
  ctx.fill();
  ctx.strokeStyle = "#7fd0ff";
  ctx.lineWidth = 8;
  ctx.stroke();
  text(ctx, title, 512, 130, 104, { weight: 800 });
  text(ctx, sub, 512, 240, 44, { weight: 500, color: "rgba(236,239,245,0.85)" });
  return finish(c);
}

/** Entrance arch face: navy field, pentagon motif, brand-coloured sweep, official wordmark + tagline. */
export async function archFaceTexture(tagline: string) {
  await fonts(tagline);
  const { c, ctx } = canvas(1024, 1024);
  ctx.fillStyle = "#1f2c6e";
  ctx.fillRect(0, 0, 1024, 1024);
  // Brand-colour sweep around the rim.
  const sweep = ctx.createLinearGradient(0, 300, 1024, 0);
  sweep.addColorStop(0, "rgba(242,101,87,0)");
  sweep.addColorStop(0.55, "rgba(148,67,153,0.55)");
  sweep.addColorStop(0.75, "rgba(242,101,87,0.75)");
  sweep.addColorStop(0.9, "rgba(78,166,73,0.8)");
  sweep.addColorStop(1, "rgba(78,166,73,0)");
  ctx.strokeStyle = sweep;
  ctx.lineWidth = 120;
  ctx.beginPath();
  ctx.arc(512, 512, 450, Math.PI, Math.PI * 2);
  ctx.stroke();
  // Pentagon panels (football motif), lower left.
  const r = rng(3);
  for (let i = 0; i < 9; i++) {
    // Lower-left part of the visible band (radius ≈ 361–512 px).
    const x = 40 + r() * 90;
    const y = 300 + r() * 190;
    const s = 26 + r() * 30;
    ctx.fillStyle = `rgba(${90 + r() * 60}, ${140 + r() * 60}, 255, ${0.35 + r() * 0.3})`;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const px = x + Math.cos(a) * s;
      const py = y + Math.sin(a) * s;
      if (k) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  const ar = await loadImage("/assets/brand/kora-lockup-ar.png");
  // Wordmark + tagline sit in the top of the band (y ≈ 0–150 px at the crown).
  const h = 74;
  const w = (ar.width / ar.height) * h;
  ctx.drawImage(ar, 512 - w / 2, 18, w, h);
  text(ctx, tagline, 512, 122, 34, { weight: 500 });
  return finish(c);
}

/** Photo-booth / press-wall skin: navy with soft pentagon pattern and the official ball mark. */
export async function patternSkinTexture(caption?: string) {
  if (caption) await fonts(caption);
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#26357a";
  ctx.fillRect(0, 0, 512, 512);
  const r = rng(12);
  for (let i = 0; i < 18; i++) {
    const x = r() * 512;
    const y = r() * 512;
    const s = 20 + r() * 40;
    ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.08})`;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      if (k) ctx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
      else ctx.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
    }
    ctx.closePath();
    ctx.fill();
  }
  const ball = await loadImage("/assets/brand/kora-lockup-ball.png");
  const bw = 150;
  const bh = (ball.height / ball.width) * bw;
  ctx.drawImage(ball, 256 - bw / 2, 90, bw, bh);
  if (caption) text(ctx, caption, 256, 90 + bh + 50, 48, { weight: 700 });
  return finish(c, { repeat: true });
}

/** Repeating tile grid of partner placeholders (press wall) — neutral, no third-party marks. */
export function partnerGridTexture() {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#26357a";
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = "rgba(236,239,245,0.9)";
      ctx.fillRect(20 + x * 124, 20 + y * 62, 104, 42);
      ctx.fillStyle = "rgba(38,53,122,0.35)";
      ctx.fillRect(44 + x * 124, 36 + y * 62, 56, 10);
    }
  return finish(c, { repeat: true });
}

export const MATERIAL_HINT = { NAVY, INK, CORAL, GREEN, FUCHSIA, PAPER } as const;
export type PanelTexture = THREE.Texture;
