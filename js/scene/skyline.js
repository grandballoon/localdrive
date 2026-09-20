import { rect, px, dither } from '../lib/draw.js';
import { mulberry32, between } from '../lib/rng.js';

// Two silhouette layers behind the rowhouses. The farther layer is warmer and
// lighter (it sits deeper in the sunset haze); the nearer one is plum.
const LAYERS = [
  { seed: 301, color: '#9c3f4a', minH: 160, maxH: 200, windows: null, frost: null },
  { seed: 302, color: '#5e2440', minH: 138, maxH: 180, windows: '#f4a84a', frost: '#a9bfd6' },
];

export function drawSkyline(ctx, { W, groundY }) {
  for (const layer of LAYERS) drawLayer(ctx, W, groundY, layer);
}

function drawLayer(ctx, W, groundY, layer) {
  const rng = mulberry32(layer.seed);
  let x = -between(rng, 0, 12);
  while (x < W) {
    const w = between(rng, 20, 46);
    const h = between(rng, layer.minH, layer.maxH);
    const top = groundY - h;
    rect(ctx, x, top, w, h, layer.color);

    if (layer.frost) dither(ctx, x, top, w, 1, layer.frost, 0.5);
    if (layer.windows) drawLitWindows(ctx, x, top, w, rng, layer.windows);
    if (w >= 30 && rng() < 0.55) drawWaterTower(ctx, x + between(rng, 4, w - 14), top, layer);

    x += w;
  }
}

function drawLitWindows(ctx, x, top, w, rng, color) {
  const count = between(rng, 0, 4);
  for (let i = 0; i < count; i++) {
    const wx = x + 3 + between(rng, 0, Math.floor((w - 8) / 4)) * 4;
    const wy = top + 5 + between(rng, 0, 5) * 6;
    rect(ctx, wx, wy, 2, 3, color);
  }
}

// The rooftop water tank: nothing says "Brooklyn skyline" faster.
function drawWaterTower(ctx, x, roofY, layer) {
  const tankTop = roofY - 17;
  rect(ctx, x + 1, roofY - 7, 1, 7, layer.color);
  rect(ctx, x + 8, roofY - 7, 1, 7, layer.color);
  rect(ctx, x + 1, roofY - 4, 8, 1, layer.color);
  rect(ctx, x, tankTop + 3, 10, 8, layer.color);
  rect(ctx, x + 1, tankTop + 2, 8, 1, layer.color);
  rect(ctx, x + 2, tankTop + 1, 6, 1, layer.color);
  rect(ctx, x + 4, tankTop, 2, 1, layer.color);
  if (layer.frost) {
    px(ctx, x + 3, tankTop + 1, layer.frost);
    px(ctx, x + 2, tankTop + 2, layer.frost);
  }
}
