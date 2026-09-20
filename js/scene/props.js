import { rect, px, line, ditherDisc } from '../lib/draw.js';
import { ICE, INK, IRON } from '../palette.js';

// Street furniture. Each prop is positioned by its base (where it meets the ground).

const LAMP_GLOW = '#f8cd6a';

// Bishop's-crook lamppost, the classic NYC cast-iron pattern.
export function drawLamppost(ctx, { x, baseY }) {
  const poleTop = baseY - 96;
  const post = '#22302c';
  const postLight = '#3d5048';

  rect(ctx, x - 3, baseY - 3, 8, 3, post);
  rect(ctx, x - 2, baseY - 9, 6, 6, post);
  rect(ctx, x - 1, baseY - 12, 4, 3, post);
  rect(ctx, x, poleTop, 2, 96 - 12, post);
  rect(ctx, x, poleTop, 1, 96 - 12, postLight);

  // The crook, then the lantern hanging from its tip.
  const crook = [[0, 0], [1, -5], [4, -9], [9, -10], [13, -8], [15, -4]];
  for (let i = 1; i < crook.length; i++) {
    const [ax, ay] = crook[i - 1];
    const [bx, by] = crook[i];
    line(ctx, x + ax, poleTop + ay, x + bx, poleTop + by, post, 2);
  }
  line(ctx, x + 2, poleTop - 1, x + 7, poleTop - 5, post);

  const lx = x + 15;
  const ly = poleTop - 3;
  ditherDisc(ctx, lx, ly + 5, 15, LAMP_GLOW, 0.25);
  ditherDisc(ctx, lx, ly + 5, 8, LAMP_GLOW, 0.5);
  rect(ctx, lx - 3, ly, 7, 2, post);
  rect(ctx, lx - 2, ly + 2, 5, 6, '#fff1b8');
  rect(ctx, lx - 2, ly + 2, 1, 6, LAMP_GLOW);
  rect(ctx, lx + 2, ly + 2, 1, 6, LAMP_GLOW);
  rect(ctx, lx - 1, ly + 8, 3, 1, post);
  rect(ctx, lx - 3, ly - 1, 5, 1, ICE.white);
}

export function drawHydrant(ctx, { x, baseY }) {
  const red = '#b8342f';
  const redDark = '#7f1f22';
  const redLight = '#de5a45';
  rect(ctx, x - 1, baseY - 2, 8, 2, redDark);
  rect(ctx, x, baseY - 10, 6, 8, red);
  rect(ctx, x, baseY - 10, 1, 8, redLight);
  rect(ctx, x + 5, baseY - 10, 1, 8, redDark);
  rect(ctx, x - 2, baseY - 8, 2, 3, red);
  rect(ctx, x + 6, baseY - 8, 2, 3, redDark);
  rect(ctx, x - 1, baseY - 11, 8, 1, redDark);
  rect(ctx, x + 1, baseY - 13, 4, 2, red);
  rect(ctx, x + 2, baseY - 14, 2, 1, redDark);
  rect(ctx, x + 1, baseY - 14, 3, 1, ICE.white);
  px(ctx, x - 1, baseY - 12, ICE.light);
}

// The donation crate: what the whole page is about, sitting on the sidewalk.
export function drawDonationCrate(ctx, { x, baseY }) {
  const wood = '#a5713d';
  const woodLight = '#c48f52';
  const woodDark = '#6f4524';
  const beige = '#d9cdb0';
  const beigeDark = '#a89a7c';

  // A beige CRT and a closed laptop poking out of the top.
  rect(ctx, x + 3, baseY - 27, 14, 13, beige);
  rect(ctx, x + 3, baseY - 27, 14, 1, '#efe6cf');
  rect(ctx, x + 16, baseY - 27, 1, 13, beigeDark);
  rect(ctx, x + 5, baseY - 25, 10, 8, INK);
  rect(ctx, x + 6, baseY - 24, 8, 6, '#1f4a44');
  rect(ctx, x + 7, baseY - 23, 3, 1, '#7fd6a8');
  rect(ctx, x + 7, baseY - 21, 5, 1, '#3f8f78');
  px(ctx, x + 14, baseY - 16, '#d9402f');

  line(ctx, x + 19, baseY - 14, x + 24, baseY - 24, '#4a4652', 2);
  line(ctx, x + 18, baseY - 14, x + 23, baseY - 24, '#8d8a96');

  rect(ctx, x + 4, baseY - 28, 9, 1, ICE.white);

  // Slatted crate with a heart stencilled on the front.
  rect(ctx, x, baseY - 15, 28, 15, woodDark);
  for (let i = 0; i < 3; i++) {
    rect(ctx, x + 1, baseY - 14 + i * 5, 26, 4, wood);
    rect(ctx, x + 1, baseY - 14 + i * 5, 26, 1, woodLight);
  }
  rect(ctx, x, baseY - 15, 2, 15, woodDark);
  rect(ctx, x + 26, baseY - 15, 2, 15, woodDark);

  const hx = x + 11;
  const hy = baseY - 11;
  const heart = '#8f2327';
  rect(ctx, hx, hy, 2, 2, heart);
  rect(ctx, hx + 3, hy, 2, 2, heart);
  rect(ctx, hx, hy + 1, 5, 2, heart);
  rect(ctx, hx + 1, hy + 3, 3, 1, heart);
  px(ctx, hx + 2, hy + 4, heart);

  rect(ctx, x, baseY - 16, 6, 1, ICE.white);
  rect(ctx, x + 21, baseY - 16, 7, 1, ICE.light);
  rect(ctx, x + 2, baseY, 25, 1, IRON);
}
