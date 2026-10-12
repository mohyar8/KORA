import * as THREE from "three";
import type { FacadeLine } from "@/lib/exhibition/museumFacade";

/**
 * Procedural textures, drawn once on 2D canvases. Everything here is
 * authored from the site photos / renders so the scene ships without
 * downloaded texture assets.
 */

export function canvas(w: number, h: number) {
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

export function finish(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: boolean; aniso?: number } = {}) {
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

export function loadImage(src: string) {
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

/** Deep navy LED field with diagonal light rays (stage screens in the render). */
export function drawRays(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, strength = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0b1438");
  g.addColorStop(1, "#060b22");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  ctx.globalCompositeOperation = "lighter";
  const tints = ["120,160,255", "200,220,255", "230,190,120"];
  for (let i = 0; i < 26; i++) {
    const x = r() * w * 1.2 - w * 0.1;
    const lean = (r() - 0.5) * w * 0.5;
    const width = 2 + r() * w * 0.012;
    const a = (0.05 + r() * 0.18) * strength;
    const grad = ctx.createLinearGradient(x, h, x + lean, 0);
    const tint = tints[i % 3 === 2 && r() > 0.5 ? 2 : r() > 0.4 ? 0 : 1];
    grad.addColorStop(0, `rgba(${tint},0)`);
    grad.addColorStop(0.5, `rgba(${tint},${a})`);
    grad.addColorStop(1, `rgba(${tint},0)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + lean, 0);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

/** Composes the official bilingual lockup: "KORA" · ball · "كورة" (render layout). */
export async function drawLockup(ctx: CanvasRenderingContext2D, cx: number, cy: number, height: number, stacked = false) {
  const [ball, en, ar] = await Promise.all([
    loadImage("/assets/brand/kora-lockup-ball.png"),
    loadImage("/assets/brand/kora-lockup-en.png"),
    loadImage("/assets/brand/kora-lockup-ar.png"),
  ]);
  const enH = height * 0.55;
  const enW = (en.width / en.height) * enH;
  const arH = height * 0.8;
  const arW = (ar.width / ar.height) * arH;
  const bH = height * 0.8;
  const bW = (ball.width / ball.height) * bH;
  if (stacked) {
    const y0 = cy - height * 1.3;
    ctx.drawImage(en, cx - enW / 2, y0, enW, enH);
    ctx.drawImage(ball, cx - bW / 2, y0 + enH + height * 0.15, bW, bH);
    ctx.drawImage(ar, cx - arW / 2, y0 + enH + bH + height * 0.3, arW, arH);
    return;
  }
  const gap = height * 0.25;
  const total = enW + gap + bW + gap + arW;
  let x = cx - total / 2;
  ctx.drawImage(en, x, cy - enH / 2, enW, enH);
  x += enW + gap;
  ctx.drawImage(ball, x, cy - bH / 2, bW, bH);
  x += bW + gap;
  ctx.drawImage(ar, x, cy - arH / 2 - height * 0.05, arW, arH);
}

/** Main stage LED wall: rays + centred official lockup. */
export async function stageScreenTexture() {
  const { c, ctx } = canvas(2048, 960);
  drawRays(ctx, c.width, c.height, 31);
  await drawLockup(ctx, c.width / 2, c.height * 0.47, 165);
  return finish(c);
}

/** Inner side screens: rays only. */
export function raysTexture(seed: number) {
  const { c, ctx } = canvas(512, 960);
  drawRays(ctx, c.width, c.height, seed, 1.2);
  return finish(c);
}

/** Portrait LED panel with the stacked lockup (outer stage panels, lectern). */
export async function portraitLogoTexture() {
  const { c, ctx } = canvas(512, 900);
  drawRays(ctx, c.width, c.height, 47, 0.6);
  await drawLockup(ctx, c.width / 2, c.height * 0.4, 110, true);
  return finish(c);
}

/** Glowing title letters (booth crowns) on transparent background. */
export async function glowTitleTexture(text: string, color: string, width = 1024, height = 256) {
  const family = brandFontFamily();
  try {
    await document.fonts.load(`700 120px ${family}`, text);
  } catch {
    /* fall back */
  }
  const { c, ctx } = canvas(width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.font = `800 ${Math.round(height * 0.62)}px ${family}`;
  ctx.shadowColor = color;
  ctx.shadowBlur = height * 0.12;
  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff4fb";
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, width / 2, height / 2);
  return finish(c);
}

/** Dark sign plate with a light caption (booth headers and hanging section signs). */
export async function plateTexture(lines: { text: string; size: number; dir?: CanvasDirection }[], opts: { width?: number; height?: number; bg?: string; fg?: string; number?: string } = {}) {
  const family = brandFontFamily();
  const { width = 1024, height = 256, bg = "#2b2330", fg = "#f2e9f2" } = opts;
  try {
    await document.fonts.load(`600 80px ${family}`, lines.map((l) => l.text).join(" "));
  } catch {
    /* fall back */
  }
  const { c, ctx } = canvas(width, height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  const n = lines.length;
  lines.forEach((l, i) => {
    ctx.font = `600 ${l.size}px ${family}`;
    ctx.direction = l.dir ?? "rtl";
    ctx.textAlign = "center";
    ctx.fillText(l.text, opts.number ? width * 0.45 : width / 2, (height * (i + 1)) / (n + 1));
  });
  if (opts.number) {
    ctx.direction = "ltr";
    ctx.textAlign = "center";
    ctx.font = `300 ${Math.round(height * 0.42)}px ${family}`;
    ctx.fillText(opts.number, width * 0.88, height / 2);
  }
  return finish(c);
}

/**
 * Stylised match broadcast frame for booth screens: our own pitch graphic,
 * no third-party footage, players or broadcaster marks.
 */
export function broadcastTexture(seed: number, split = false) {
  const { c, ctx } = canvas(512, 288);
  const r = rng(seed);
  const pitch = (x: number, y: number, w: number, h: number) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "#2f7a3a" : "#368544";
      ctx.fillRect(x + (w / 8) * i, y, w / 8 + 1, h);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = Math.max(1, w / 220);
    ctx.strokeRect(x + w * 0.04, y + h * 0.08, w * 0.92, h * 0.84);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.08);
    ctx.lineTo(x + w / 2, y + h * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, h * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? "#f0f0f0" : "#1f2f6b";
      ctx.beginPath();
      ctx.arc(x + w * (0.2 + r() * 0.6), y + h * (0.25 + r() * 0.5), Math.max(2, h * 0.025), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  if (split) {
    pitch(0, 0, 255, 143);
    pitch(257, 0, 255, 143);
    pitch(0, 145, 255, 143);
    pitch(257, 145, 255, 143);
  } else pitch(0, 0, 512, 288);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 262, 512, 26);
  return finish(c);
}
