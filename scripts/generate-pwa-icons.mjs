/**
 * Generates HomelyBlock PWA icons from the brand mark (evergreen house).
 * Pure Node (zlib only) — no extra dependencies.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "icons");

const FOREST = [0x24, 0x4c, 0x3a, 0xff];
const IVORY = [0xf7, 0xf6, 0xf0, 0xff];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function fillRect(rgba, size, x0, y0, x1, y1, color) {
  const left = Math.max(0, Math.floor(x0));
  const top = Math.max(0, Math.floor(y0));
  const right = Math.min(size, Math.ceil(x1));
  const bottom = Math.min(size, Math.ceil(y1));
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = color[3];
    }
  }
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function fillPolygon(rgba, size, poly, color) {
  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of poly) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const left = Math.max(0, Math.floor(minX));
  const top = Math.max(0, Math.floor(minY));
  const right = Math.min(size, Math.ceil(maxX));
  const bottom = Math.min(size, Math.ceil(maxY));
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, poly)) {
        const i = (y * size + x) * 4;
        rgba[i] = color[0];
        rgba[i + 1] = color[1];
        rgba[i + 2] = color[2];
        rgba[i + 3] = color[3];
      }
    }
  }
}

/** Brand mark path scaled into a content box (viewBox 0 0 24 24). */
function drawHouse(rgba, size, box, color) {
  const [bx, by, bw, bh] = box;
  const sx = (u) => bx + (u / 24) * bw;
  const sy = (v) => by + (v / 24) * bh;
  // Roof + walls outer silhouette matching logo path
  const outer = [
    [sx(4), sy(10.5)],
    [sx(12), sy(4)],
    [sx(20), sy(10.5)],
    [sx(20), sy(20)],
    [sx(19), sy(21)],
    [sx(14), sy(21)],
    [sx(14), sy(15)],
    [sx(10), sy(15)],
    [sx(10), sy(21)],
    [sx(5), sy(21)],
    [sx(4), sy(20)],
  ];
  fillPolygon(rgba, size, outer, color);
}

function roundedBackground(rgba, size, radius, color) {
  const r = radius;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = true;
      if (x < r && y < r) {
        const dx = x + 0.5 - r;
        const dy = y + 0.5 - r;
        inside = dx * dx + dy * dy <= r * r;
      } else if (x >= size - r && y < r) {
        const dx = x + 0.5 - (size - r);
        const dy = y + 0.5 - r;
        inside = dx * dx + dy * dy <= r * r;
      } else if (x < r && y >= size - r) {
        const dx = x + 0.5 - r;
        const dy = y + 0.5 - (size - r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (x >= size - r && y >= size - r) {
        const dx = x + 0.5 - (size - r);
        const dy = y + 0.5 - (size - r);
        inside = dx * dx + dy * dy <= r * r;
      }
      if (!inside) continue;
      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = color[3];
    }
  }
}

function makeIcon(size, { maskable = false, rounded = true } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  if (maskable) {
    fillRect(rgba, size, 0, 0, size, size, FOREST);
    const inset = size * 0.18;
    const box = [inset, inset, size - inset * 2, size - inset * 2];
    drawHouse(rgba, size, box, IVORY);
  } else {
    const radius = rounded ? size * 0.18 : 0;
    if (radius > 0) roundedBackground(rgba, size, radius, FOREST);
    else fillRect(rgba, size, 0, 0, size, size, FOREST);
    const pad = size * 0.18;
    drawHouse(rgba, size, [pad, pad, size - pad * 2, size - pad * 2], IVORY);
  }
  return encodePng(size, size, rgba);
}

function write(name, buffer) {
  const path = join(OUT, name);
  mkdirSync(dirname(path), { recursive: true });
  createWriteStream(path).end(buffer);
  console.log(`wrote ${name} (${buffer.length} bytes)`);
}

write("icon-192.png", makeIcon(192));
write("icon-512.png", makeIcon(512));
write("icon-maskable-512.png", makeIcon(512, { maskable: true, rounded: false }));
write("apple-touch-icon.png", makeIcon(180, { rounded: false }));
write("favicon-32.png", makeIcon(32));
write("favicon-16.png", makeIcon(16));
