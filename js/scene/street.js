import { rect, px, dither } from '../lib/draw.js';
import { mulberry32, pick, between } from '../lib/rng.js';
import { ICE, LEAVES, STREET } from '../palette.js';
import { SIDEWALK_H, CURB_H } from '../layout.js';

const SLAB_W = 26;

export function drawStreet(ctx, { W, H, groundY, curbY, hero, puddle }) {
  const rng = mulberry32(51);
  const streetY = curbY + CURB_H;

  // Sidewalk.
  rect(ctx, 0, groundY, W, SIDEWALK_H, STREET.sidewalk);
  dither(ctx, 0, groundY, W, 2, STREET.contactShadow, 0.5);
  for (let x = (hero.x % SLAB_W) - SLAB_W; x < W; x += SLAB_W) {
    rect(ctx, x, groundY + 2, 1, SIDEWALK_H - 2, STREET.sidewalkJoint);
  }
  rect(ctx, 0, groundY + 13, W, 1, STREET.sidewalkJoint);
  for (let i = 0; i < W / 3; i++) {
    px(ctx, between(rng, 0, W - 1), between(rng, groundY + 3, curbY - 1), STREET.sidewalkLight);
  }

  // Curb and street.
  rect(ctx, 0, curbY, W, 2, STREET.curbTop);
  rect(ctx, 0, curbY + 2, W, CURB_H - 2, STREET.curbFace);
  rect(ctx, 0, streetY, W, H - streetY, STREET.asphalt);
  for (let i = 0; i < W / 2; i++) {
    px(ctx, between(rng, 0, W - 1), between(rng, streetY, H - 1), STREET.asphaltSpeck);
  }

  drawFrozenPuddle(ctx, puddle.x, puddle.y);

  // Old snow hangs on along the wall and the curb; leaves collect everywhere.
  for (let x = between(rng, 0, 30); x < W; x += between(rng, 28, 64)) {
    drawSnowDrift(ctx, x, groundY + 1, between(rng, 6, 14));
  }
  for (let x = between(rng, 0, 40); x < W; x += between(rng, 40, 90)) {
    drawSnowDrift(ctx, x, curbY, between(rng, 8, 18));
  }
  for (let x = between(rng, 0, 20); x < W; x += between(rng, 18, 46)) {
    drawLeafPile(ctx, x, streetY + 2, between(rng, 5, 12), rng);
  }
  for (let i = 0; i < W / 9; i++) {
    const x = between(rng, 0, W - 2);
    const y = between(rng, groundY + 3, curbY - 2);
    rect(ctx, x, y, rng() < 0.5 ? 2 : 1, 1, pick(rng, LEAVES));
  }
  drawLeafPile(ctx, hero.x + 3, groundY + 2, 9, rng);
  drawLeafPile(ctx, hero.x + hero.width - 12, groundY + 2, 10, rng);
}

function drawSnowDrift(ctx, x, baseY, w) {
  rect(ctx, x, baseY - 1, w, 1, ICE.light);
  rect(ctx, x + 2, baseY - 2, w - 5, 1, ICE.white);
  rect(ctx, x + w - 3, baseY - 1, 3, 1, ICE.mid);
}

function drawLeafPile(ctx, x, baseY, w, rng) {
  for (let i = 0; i < w * 2; i++) {
    const dx = between(rng, 0, w - 1);
    const maxUp = Math.round(2 * (1 - Math.abs(dx - w / 2) / (w / 2)));
    px(ctx, x + dx, baseY - between(rng, 0, maxUp), pick(rng, LEAVES));
  }
}

function drawFrozenPuddle(ctx, x, y) {
  rect(ctx, x + 3, y - 1, 16, 1, ICE.shade);
  rect(ctx, x, y, 24, 2, ICE.shade);
  rect(ctx, x + 4, y + 2, 17, 1, ICE.shade);
  rect(ctx, x + 3, y, 9, 1, ICE.mid);
  rect(ctx, x + 14, y + 1, 5, 1, ICE.light);
  px(ctx, x + 5, y, ICE.white);
  px(ctx, x + 6, y, ICE.white);
}
