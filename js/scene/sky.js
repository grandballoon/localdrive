import { rect, px, ditherOn } from '../lib/draw.js';
import { mulberry32, between } from '../lib/rng.js';
import { SKY, ICE } from '../palette.js';

const CLOUD = { top: '#8d3a58', body: '#c65a52', belly: '#f59a6a' };
const DITHER_LEVELS = 4; // coarse steps between bands, for that 16-bit banding

// Gradient runs from the zenith down to `rooflineY`, so the gold end of the
// ramp sits right behind the rooftops and silhouettes them.
export function drawSky(ctx, { W, H, groundY, moon }) {
  const rooflineY = Math.max(24, groundY - 160);
  const bands = SKY.length - 1;

  for (let y = 0; y < H; y++) {
    const t = Math.min(y / rooflineY, 1) * bands;
    const band = Math.min(Math.floor(t), bands - 1);
    const blend = Math.round((t - band) * DITHER_LEVELS) / DITHER_LEVELS;
    rect(ctx, 0, y, W, 1, SKY[band]);
    if (blend === 0) continue;
    ctx.fillStyle = SKY[band + 1];
    for (let x = 0; x < W; x++) {
      if (ditherOn(x, y, blend)) ctx.fillRect(x, y, 1, 1);
    }
  }

  drawStars(ctx, W, rooflineY);
  drawMoon(ctx, moon.x, moon.y);
  drawClouds(ctx, W, rooflineY);
}

function drawStars(ctx, W, rooflineY) {
  const rng = mulberry32(11);
  const count = Math.round(W / 14);
  for (let i = 0; i < count; i++) {
    const x = between(rng, 0, W - 1);
    const y = between(rng, 0, Math.round(rooflineY * 0.4));
    px(ctx, x, y, rng() < 0.3 ? ICE.white : '#e9b9a8');
  }
}

// A thin, icy crescent: the first cold thing in an otherwise warm sky.
function drawMoon(ctx, cx, cy) {
  const r = 7;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const inMoon = dx * dx + dy * dy <= r * r;
      const inBite = (dx - 4) * (dx - 4) + (dy + 2) * (dy + 2) <= r * r;
      if (!inMoon || inBite) continue;
      px(ctx, cx + dx, cy + dy, dx < -4 ? ICE.white : ICE.light);
    }
  }
}

function drawClouds(ctx, W, rooflineY) {
  const rng = mulberry32(23);
  const count = Math.max(2, Math.round(W / 130));
  for (let i = 0; i < count; i++) {
    const w = between(rng, 34, 70);
    const x = Math.round((i + rng() * 0.8) * (W / count)) - 10;
    const y = between(rng, Math.round(rooflineY * 0.35), Math.round(rooflineY * 0.85));
    drawCloud(ctx, x, y, w, rng);
  }
}

// Long, flat stratus bars lit from below by the sunset.
function drawCloud(ctx, x, y, w, rng) {
  rect(ctx, x + between(rng, 6, 14), y - 2, Math.round(w * 0.4), 1, CLOUD.top);
  rect(ctx, x + 4, y - 1, w - between(rng, 10, 18), 1, CLOUD.top);
  rect(ctx, x, y, w, 2, CLOUD.body);
  rect(ctx, x + 3, y + 2, w - 8, 1, CLOUD.belly);
  rect(ctx, x + between(rng, 8, 16), y + 3, Math.round(w * 0.45), 1, CLOUD.belly);
}
