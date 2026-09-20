import { bakeSprite, dither, ditherDisc, px } from '../lib/draw.js';
import { ICE, INK } from '../palette.js';
import { PALETTE, BODY, LEG_ROW, EYES, MOUTH, ARM } from './mailman.sprite.js';

const BREATHE_HZ = 1.2;
const WAVE_EVERY = 5; // seconds between bursts of waving
const WAVE_FOR = 2;
const WAVE_HZ = 4;
const BLINK_EVERY = 4;
const BLINK_FOR = 0.15;
const FOG_EVERY = 3.5;
const FOG_FOR = 1.4;

// Idle behaviour for the mailman: breathing, waving in bursts, blinking, and
// fogging the cold air. `x` is the sprite's left edge, `feetY` the ground line.
export function createMailman({ x, feetY }) {
  const upper = bakeSprite(BODY.slice(0, LEG_ROW), PALETTE);
  const legs = bakeSprite(BODY.slice(LEG_ROW), PALETTE);
  const armFrames = ARM.frames.map((rows) => bakeSprite(rows, PALETTE));
  const top = feetY - BODY.length;
  let t = 0;

  return {
    update(dt) {
      t += dt;
    },

    draw(ctx) {
      const bob = Math.floor(t * BREATHE_HZ) % 2;
      const waving = t % WAVE_EVERY < WAVE_FOR;
      const arm = armFrames[waving ? Math.floor(t * WAVE_HZ) % 2 : 0];

      dither(ctx, x + 3, feetY - 1, 20, 3, INK, 0.5);
      ctx.drawImage(legs, x, top + LEG_ROW);
      ctx.drawImage(upper, x, top + bob);
      ctx.drawImage(arm, x + ARM.dx, top + bob + ARM.dy);

      if (t % BLINK_EVERY < BLINK_FOR) {
        for (const [ex, ey] of EYES) px(ctx, x + ex, top + bob + ey, PALETTE.S);
      }

      const fog = (t % FOG_EVERY) / FOG_FOR;
      if (fog < 1) {
        const fx = Math.round(x + MOUTH.x + 3 + fog * 5);
        const fy = Math.round(top + MOUTH.y - 1 - fog * 5);
        ditherDisc(ctx, fx, fy, 1 + Math.floor(fog * 3), ICE.white, 0.75 - fog * 0.5);
      }
    },
  };
}
