import { rect, px, disc, ditherDisc } from '../lib/draw.js';
import { mulberry32, pick } from '../lib/rng.js';
import { ICE, LEAVES } from '../palette.js';

// Everything that drifts: the last leaves coming down, the first flakes of the
// season, and chimney smoke. Positions are floats; drawing snaps to the grid.

export function createWeather({ W, H, groundY }) {
  const rng = mulberry32(77);

  const newLeaf = (anywhere) => ({
    x: rng() * W * 1.25,
    y: anywhere ? rng() * H : -4,
    vx: -(6 + rng() * 10),
    vy: 10 + rng() * 12,
    phase: rng() * Math.PI * 2,
    color: pick(rng, LEAVES),
    landY: groundY + 4 + rng() * 32,
  });

  const newFlake = (anywhere) => ({
    x: rng() * W * 1.1,
    y: anywhere ? rng() * H : -2,
    vx: -(1 + rng() * 3),
    vy: 5 + rng() * 6,
    phase: rng() * Math.PI * 2,
    color: rng() < 0.6 ? ICE.white : ICE.light,
  });

  const leaves = Array.from({ length: Math.max(6, Math.round(W / 30)) }, () => newLeaf(true));
  const flakes = Array.from({ length: Math.max(8, Math.round(W / 16)) }, () => newFlake(true));

  return {
    update(dt) {
      leaves.forEach((leaf, i) => {
        leaf.phase += dt * 3;
        leaf.x += (leaf.vx + Math.sin(leaf.phase) * 9) * dt;
        leaf.y += leaf.vy * dt;
        if (leaf.y > leaf.landY || leaf.x < -4) leaves[i] = newLeaf(false);
      });
      flakes.forEach((flake, i) => {
        flake.phase += dt * 1.5;
        flake.x += (flake.vx + Math.sin(flake.phase) * 3) * dt;
        flake.y += flake.vy * dt;
        if (flake.y > H || flake.x < -2) flakes[i] = newFlake(false);
      });
    },

    draw(ctx) {
      for (const flake of flakes) px(ctx, flake.x, flake.y, flake.color);
      for (const leaf of leaves) {
        // Cycle through three silhouettes so the leaf appears to tumble.
        const tumble = Math.floor(leaf.phase * 1.2) % 3;
        const w = tumble === 1 ? 1 : 2;
        const h = tumble === 0 ? 1 : 2;
        rect(ctx, leaf.x, leaf.y, w, h, leaf.color);
      }
    },
  };
}

const SMOKE = '#e2cfc9';
const PUFF_EVERY = 0.7;
const PUFF_LIFE = 4;

export function createSmoke({ x, y }) {
  // Start mid-plume so a static (reduced-motion) frame still shows smoke.
  const puffs = [0.4, 1.3, 2.2, 3.1].map((age) => ({ age }));
  let sinceLast = 0;

  return {
    update(dt) {
      sinceLast += dt;
      if (sinceLast >= PUFF_EVERY) {
        sinceLast = 0;
        puffs.push({ age: 0 });
      }
      for (const puff of puffs) puff.age += dt;
      while (puffs.length && puffs[0].age > PUFF_LIFE) puffs.shift();
    },

    draw(ctx) {
      for (const { age } of puffs) {
        const px0 = Math.round(x + age * age * 1.6);
        const py0 = Math.round(y - age * 6);
        // Solid while young, then a checkerboard as it thins: sparser dither
        // patterns read as loose dots rather than smoke.
        const r = Math.min(3, 1 + Math.floor(age));
        if (age < 1.5) disc(ctx, px0, py0, r, SMOKE);
        else ditherDisc(ctx, px0, py0, r, SMOKE, 0.5);
      }
    },
  };
}
