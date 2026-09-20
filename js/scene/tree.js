import { rect, px } from '../lib/draw.js';
import { mulberry32, pick, between } from '../lib/rng.js';
import { ICE, LEAVES, TREE } from '../palette.js';

// A late-November street tree: mostly bare, a few stubborn clusters of leaves,
// snow settled on the flatter boughs.
export function drawTree(ctx, { x, baseY, height = 128, seed = 91 }) {
  const rng = mulberry32(seed);
  const tips = [];

  rect(ctx, x - 8, baseY - 1, 18, 3, TREE.soil);

  function bough(x0, y0, angle, length, thickness, depth) {
    const steps = Math.ceil(length);
    const half = Math.floor(thickness / 2);
    const flat = Math.abs(Math.sin(angle)) < 0.8;
    let bx = x0;
    let by = y0;
    for (let s = 0; s <= steps; s++) {
      bx = Math.round(x0 + Math.cos(angle) * s);
      by = Math.round(y0 - Math.sin(angle) * s);
      rect(ctx, bx - half, by - half, thickness, thickness, TREE.bark);
      if (thickness >= 3) px(ctx, bx - half, by - half, TREE.barkLight);
      if (flat && thickness >= 2 && rng() < 0.45) px(ctx, bx, by - half - 1, ICE.white);
    }

    if (depth === 0) {
      tips.push([bx, by]);
      return;
    }
    const forks = rng() < 0.35 ? 3 : 2;
    for (let i = 0; i < forks; i++) {
      const spread = (i - (forks - 1) / 2) * 0.75 + (rng() - 0.5) * 0.5;
      bough(bx, by, angle + spread, length * (0.6 + rng() * 0.2), Math.max(1, thickness - 1), depth - 1);
    }
  }

  bough(x, baseY, Math.PI / 2, height * 0.36, 4, 4);

  for (const [tx, ty] of tips) {
    if (rng() < 0.3) continue;
    const count = between(rng, 4, 9);
    for (let i = 0; i < count; i++) {
      rect(ctx, tx + between(rng, -4, 4), ty + between(rng, -3, 3), rng() < 0.4 ? 2 : 1, 1, pick(rng, LEAVES));
    }
  }
}
