// Pixel-grid drawing primitives. Every coordinate is a whole scene pixel;
// nothing here anti-aliases.

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// True when the ordered-dither pattern at (x, y) is "on" for the given density (0..1).
export function ditherOn(x, y, density) {
  return BAYER4[y & 3][x & 3] < density * 16;
}

export function rect(ctx, x, y, w, h, color) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function px(ctx, x, y, color) {
  rect(ctx, x, y, 1, 1, color);
}

export function dither(ctx, x, y, w, h, color, density = 0.5) {
  ctx.fillStyle = color;
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (ditherOn(xx, yy, density)) ctx.fillRect(xx, yy, 1, 1);
    }
  }
}

export function line(ctx, x0, y0, x1, y1, color, thickness = 1) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  const offset = Math.floor(thickness / 2);
  let err = dx + dy;
  let x = x0;
  let y = y0;
  ctx.fillStyle = color;
  for (;;) {
    ctx.fillRect(x - offset, y - offset, thickness, thickness);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

// Calls visit(x, y) for every pixel of a filled disc.
function eachDiscPixel(cx, cy, r, visit) {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.5);
    for (let dx = -half; dx <= half; dx++) visit(cx + dx, cy + dy);
  }
}

export function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  eachDiscPixel(cx, cy, r, (x, y) => ctx.fillRect(x, y, 1, 1));
}

export function ditherDisc(ctx, cx, cy, r, color, density = 0.5) {
  ctx.fillStyle = color;
  eachDiscPixel(cx, cy, r, (x, y) => {
    if (ditherOn(x, y, density)) ctx.fillRect(x, y, 1, 1);
  });
}

// Sprites are arrays of equal-length strings; each character indexes `palette`,
// and "." is transparent. Baking to a canvas makes per-frame drawing one blit.
export function bakeSprite(rows, palette) {
  const width = rows[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = rows.length;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(`Sprite row ${y} is ${row.length} wide, expected ${width}`);
    }
    for (let x = 0; x < width; x++) {
      const key = row[x];
      if (key === '.') continue;
      const color = palette[key];
      if (!color) throw new Error(`Sprite row ${y} uses unknown palette key "${key}"`);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  return canvas;
}
