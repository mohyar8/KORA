import * as THREE from "three";
import type { FacadeLine } from "@/lib/exhibition/museumFacade";

/**
 * Procedural textures, drawn once on 2D canvases. Everything here is
 * authored from the site photos / renders so the scene ships without
 * downloaded texture assets.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

/** Small deterministic PRNG so textures are identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function finish(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: boolean; aniso?: number } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = opts.aniso ?? 8;
  t.needsUpdate = true;
  return t;
}

function jitter(hex: string, r: () => number, amount: number) {
  const col = new THREE.Color(hex);
  const k = 1 + (r() - 0.5) * amount;
  col.multiplyScalar(k);
  return `#${col.getHexString()}`;
}

/**
 * KFUPM plaza paving (site photos): 12 m fields alternating terracotta and
 * sand, laid diagonally with dark inset borders, framed by grey bands of
 * square pavers. One texture covers a 24 m × 24 m module.
 */
export function plazaTexture(size: number) {
  const { c, ctx } = canvas(size, size);
  const r = rng(7);
  const px = size / 24; // pixels per metre
  const band = 1.2;
  const fieldColors = [
    ["#7a5249", "#714b42"],
    ["#9c8b72", "#928168"],
  ];
  ctx.fillStyle = "#6f7175";
  ctx.fillRect(0, 0, size, size);

  // Grey bands: square pavers, 0.3 m.
  const s = 0.3 * px;
  for (let y = 0; y < size; y += s)
    for (let x = 0; x < size; x += s) {
      ctx.fillStyle = jitter("#85847f", r, 0.12);
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
    }

  for (let fy = 0; fy < 2; fy++)
    for (let fx = 0; fx < 2; fx++) {
      const [base, alt] = fieldColors[(fx + fy) % 2];
      const x0 = (fx * 12 + band / 2) * px;
      const y0 = (fy * 12 + band / 2) * px;
      const w = (12 - band) * px;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, w, w);
      ctx.clip();
      ctx.fillStyle = "#3c3330";
      ctx.fillRect(x0, y0, w, w);
      // Diagonal pavers.
      ctx.translate(x0 + w / 2, y0 + w / 2);
      ctx.rotate(Math.PI / 4);
      const d = 0.28 * px;
      const half = w * 0.75;
      for (let y = -half; y < half; y += d)
        for (let x = -half; x < half; x += d) {
          ctx.fillStyle = jitter(r() > 0.85 ? alt : base, r, 0.14);
          ctx.fillRect(x + 0.8, y + 0.8, d - 1.6, d - 1.6);
        }
      ctx.restore();
      // Nested dark inset borders, as in the site photos.
      ctx.strokeStyle = "rgba(70, 70, 76, 0.6)";
      ctx.lineWidth = 0.1 * px;
      for (const inset of [0.7, 2.6]) {
        const i = inset * px;
        ctx.strokeRect(x0 + i, y0 + i, w - 2 * i, w - 2 * i);
      }
    }
  return finish(c, { repeat: true, aniso: 12 });
}

/** Museum forecourt: large satin grey stone tiles (exterior render), 12 m module. */
export function apronTexture(size: number) {
  const { c, ctx } = canvas(size, size);
  const r = rng(11);
  const px = size / 12;
  ctx.fillStyle = "#2b2928";
  ctx.fillRect(0, 0, size, size);
  const tw = 1.2 * px;
  const th = 0.6 * px;
  for (let y = 0; y < size; y += th)
    for (let x = 0; x < size; x += tw) {
      ctx.fillStyle = jitter("#4a4745", r, 0.08);
      ctx.fillRect(x + 1, y + 1, tw - 2, th - 2);
    }
  // Faint stone mottling.
  for (let i = 0; i < 2400; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},0.035)`;
    const x = r() * size;
    const y = r() * size;
    ctx.fillRect(x, y, 2 + r() * 6, 2 + r() * 6);
  }
  return finish(c, { repeat: true, aniso: 12 });
}

/** Weathered beige precast concrete (Building 57 photos). */
export function concreteTexture(size: number, tint = "#968a77") {
  const { c, ctx } = canvas(size, size);
  const r = rng(23);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 6; i++) {
    const a = r() * 0.06;
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(40,30,20,${a})`;
    const x = r() * size;
    const y = r() * size;
    const s = 1 + r() * 4;
    ctx.fillRect(x, y, s, s);
  }
  // Panel joints.
  ctx.strokeStyle = "rgba(60,50,40,0.35)";
  ctx.lineWidth = 2;
  for (let y = 0; y <= size; y += size / 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  return finish(c, { repeat: true });
}

/**
 * Window band for the academic buildings: dark glazing with a sparse,
 * irregular pattern of warm lit rooms. `cols × rows` bays.
 */
export function windowTexture(cols: number, rows: number, seed: number) {
  const bw = 32;
  const bh = 40;
  const { c, ctx } = canvas(cols * bw, rows * bh);
  const r = rng(seed);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const lit = r();
      if (lit > 0.78) {
        const warm = r() > 0.3;
        const b = 0.35 + r() * 0.65;
        ctx.fillStyle = warm
          ? `rgba(255, ${180 + r() * 40 | 0}, ${110 + r() * 40 | 0}, ${b})`
          : `rgba(200, 220, 255, ${b * 0.7})`;
        ctx.fillRect(x * bw + 3, y * bh + 6, bw - 6, bh - 12);
      }
    }
  const t = finish(c);
  t.magFilter = THREE.LinearFilter;
  return t;
}

/** Soft radial falloff used for faked light pools on the ground. */
export function radialTexture(inner = "rgba(255,255,255,1)") {
  const size = 128;
  const { c, ctx } = canvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return finish(c, { srgb: false });
}

/**
 * Emissive "wash" for a museum face: the coloured light that each line
 * throws onto the dark panels around it (what makes the render's facets read).
 */
export function facadeWashTexture(lines: readonly FacadeLine[], length: number, height: number, width: number) {
  const h = Math.round((width * height) / length);
  const { c, ctx } = canvas(width, h);
  const px = width / length;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, h);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const passes: [number, number][] = [
    [2.6, 0.1],
    [1.2, 0.16],
    [0.45, 0.3],
    [0.14, 0.5],
  ];
  for (const line of lines) {
    const first = line.points[0];
    const last = line.points[line.points.length - 1];
    const g = ctx.createLinearGradient(first[0] * px, h - first[1] * px, last[0] * px, h - last[1] * px);
    g.addColorStop(0, line.colors[0]);
    g.addColorStop(1, line.colors[1]);
    for (const [blurM, alpha] of passes) {
      ctx.save();
      ctx.filter = `blur(${Math.max(1, blurM * px * 0.5)}px)`;
      ctx.globalAlpha = alpha * (line.intensity ?? 1);
      ctx.strokeStyle = g;
      ctx.lineWidth = blurM * px;
      ctx.beginPath();
      line.points.forEach(([u, v], i) => (i ? ctx.lineTo(u * px, h - v * px) : ctx.moveTo(u * px, h - v * px)));
      ctx.stroke();
      ctx.restore();
    }
  }
  // Warm base strip glow along the foot of the facade.
  ctx.globalAlpha = 1;
  const base = ctx.createLinearGradient(0, h, 0, h - 0.9 * px);
  base.addColorStop(0, "rgba(255,150,70,0.55)");
  base.addColorStop(1, "rgba(255,150,70,0)");
  ctx.fillStyle = base;
  ctx.fillRect(0, h - 0.9 * px, width, 0.9 * px);
  return finish(c, { aniso: 8 });
}

/** Palm frond with leaflets, drawn as an alpha card. */
export function frondTexture() {
  const w = 256;
  const h = 64;
  const { c, ctx } = canvas(w, h);
  const r = rng(5);
  ctx.strokeStyle = "#3e4a2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, h / 2);
  ctx.lineTo(w - 4, h / 2);
  ctx.stroke();
  for (let x = 14; x < w - 8; x += 5) {
    const t = x / w;
    const len = (1 - Math.abs(t - 0.45) * 1.6) * (h / 2 - 2);
    for (const dir of [-1, 1]) {
      ctx.strokeStyle = jitter("#4b5e30", r, 0.35);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, h / 2);
      ctx.lineTo(x + 10 + r() * 4, h / 2 + dir * Math.max(4, len));
      ctx.stroke();
    }
  }
  return finish(c);
}

let cachedFamily: string | null = null;
/** The site's brand typeface (Alexandria via next/font). */
export function brandFontFamily() {
  if (cachedFamily) return cachedFamily;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-brand-sans").trim();
  cachedFamily = v || "Alexandria, 'Segoe UI', sans-serif";
  return cachedFamily;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Backlit "ball + KORA" sign over the museum entrance, composed from the
 * official lockup files in /public/assets/brand (not redrawn).
 */
export async function museumSignTexture() {
  const [ball, word] = await Promise.all([
    loadImage("/assets/brand/kora-lockup-ball.png"),
    loadImage("/assets/brand/kora-lockup-en.png"),
  ]);
  const h = 256;
  const { c, ctx } = canvas(1024, h);
  const bh = 120;
  const bw = (ball.width / ball.height) * bh;
  const wh = 104;
  const ww = (word.width / word.height) * wh;
  const gap = 36;
  const total = bw + gap + ww;
  const x0 = (c.width - total) / 2;
  ctx.globalAlpha = 0.92;
  ctx.drawImage(ball, x0, (h - bh) / 2 - 4, bw, bh);
  ctx.globalAlpha = 1;
  ctx.drawImage(word, x0 + bw + gap, (h - wh) / 2, ww, wh);
  // Tint the ball mark towards the render's soft lilac.
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(205, 180, 255, 0.35)";
  ctx.fillRect(x0, 0, bw, h);
  return finish(c);
}

/** Bilingual wayfinding sign ("المدخل / Entrance →"), set in the brand typeface. */
export async function wayfindingTexture(ar: string, en: string) {
  const family = brandFontFamily();
  try {
    await document.fonts.load(`600 72px ${family}`, ar);
  } catch {
    /* fall back to whatever is available */
  }
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.font = `500 92px ${family}`;
  ctx.fillText(ar, 256, 150);
  ctx.direction = "ltr";
  ctx.font = `400 64px ${family}`;
  ctx.fillText(en, 256, 250);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(150, 360);
  ctx.lineTo(362, 360);
  ctx.moveTo(330, 334);
  ctx.lineTo(362, 360);
  ctx.lineTo(330, 386);
  ctx.stroke();
  return finish(c);
}

/** Navy directional sign "إلى الساحة الترفيهية" (masterplan, passage mouth). */
export async function passageSignTexture() {
  const family = brandFontFamily();
  try {
    await document.fonts.load(`600 72px ${family}`, "إلى الساحة الترفيهية");
  } catch {
    /* fall back */
  }
  const { c, ctx } = canvas(1024, 448);
  ctx.fillStyle = "#1c2552";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(236,239,245,0.35)";
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, c.width - 28, c.height - 28);
  ctx.fillStyle = "#eceff5";
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.font = `600 92px ${family}`;
  ctx.fillText("إلى الساحة الترفيهية", 512, 170);
  ctx.direction = "ltr";
  ctx.font = `400 58px ${family}`;
  ctx.fillText("To Entertainment Area", 512, 270);
  // Arrow pointing ahead (up).
  ctx.strokeStyle = "#f26557";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(512, 400);
  ctx.lineTo(512, 318);
  ctx.moveTo(478, 350);
  ctx.lineTo(512, 316);
  ctx.lineTo(546, 350);
  ctx.stroke();
  return finish(c);
}
