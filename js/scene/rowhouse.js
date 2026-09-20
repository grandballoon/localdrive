import { rect, px, line, dither } from '../lib/draw.js';
import { mulberry32, pick, between } from '../lib/rng.js';
import { ICE, INK, IRON, WINDOW } from '../palette.js';

// One parametric rowhouse, seen head-on. From the sidewalk up:
//   garden level (BASEMENT_H) → floors[0] (parlor, entered via the stoop)
//   → floors[1..] → cornice.
// The same function draws the hero brownstone and every neighbour; only the
// spec differs.

const BASEMENT_H = 18;
const CORNICE_H = 14;
const STEP_H = 2;
const WINDOW_W = 14;
const SIDE_MARGIN = 6;

const sum = (values) => values.reduce((total, value) => total + value, 0);

export function rowhouseHeight(floors) {
  return BASEMENT_H + sum(floors) + CORNICE_H;
}

/**
 * spec: {
 *   x, groundY, width, floors: number[], style, seed,
 *   doorBay: index of the bay holding the stoop and door,
 *   windowAt?: (floor, bay) => 'lit' | 'dark' | 'cat'   (defaults to seeded random),
 *   festive?: boolean  (wreaths and extra icicles),
 * }
 * Returns { chimney: {x, y} } so the scene can attach smoke.
 */
export function drawRowhouse(ctx, spec) {
  const { x, groundY, width, floors, style, seed, doorBay, festive = false } = spec;
  const rng = mulberry32(seed);
  const windowAt = spec.windowAt ?? (() => (rng() < 0.4 ? 'lit' : 'dark'));

  const bodyH = BASEMENT_H + sum(floors);
  const top = groundY - bodyH;
  const bayCount = width >= 100 ? 3 : 2;
  const bayW = (width - SIDE_MARGIN * 2) / bayCount;
  const bays = Array.from({ length: bayCount }, (_, i) =>
    Math.round(x + SIDE_MARGIN + bayW * (i + 0.5)),
  );
  const doorX = bays[doorBay];

  const chimney = drawChimney(ctx, x + width - 26, top - CORNICE_H, style);
  drawWall(ctx, x, top, width, bodyH, groundY, style, rng);

  let floorBottom = groundY - BASEMENT_H;
  floors.forEach((floorH, floor) => {
    const floorTop = floorBottom - floorH;
    bays.forEach((cx, bay) => {
      if (floor === 0 && bay === doorBay) return;
      drawWindow(ctx, cx, floorTop + 8, floorH - 18, style, windowAt(floor, bay), rng);
    });
    floorBottom = floorTop;
  });

  bays.forEach((cx, bay) => {
    if (bay !== doorBay) drawGardenWindow(ctx, cx, groundY - BASEMENT_H + 5, style);
  });
  rect(ctx, x, groundY - BASEMENT_H - 1, width, 2, style.trim);
  rect(ctx, x, groundY - BASEMENT_H - 1, width, 1, style.trimLight);

  drawAreaFence(ctx, x + 2, x + width - 2, doorX, groundY);
  drawDoor(ctx, doorX, groundY - BASEMENT_H, style, festive);
  drawStoop(ctx, doorX, groundY, style, rng);
  drawCornice(ctx, x, top, width, style, rng, festive);

  return { chimney };
}

function drawWall(ctx, x, top, width, bodyH, groundY, style, rng) {
  rect(ctx, x, top, width, bodyH, style.wall);

  if (style.texture === 'brick') {
    for (let y = top + 3; y < groundY; y += 4) dither(ctx, x, y, width, 1, style.wallDark, 0.5);
    const bricks = Math.round((width * bodyH) / 70);
    for (let i = 0; i < bricks; i++) {
      const bx = x + between(rng, 2, width - 8);
      const by = top + between(rng, 0, Math.floor(bodyH / 4) - 1) * 4;
      rect(ctx, bx, by, 5, 3, rng() < 0.5 ? style.wallLight : style.wallDark);
    }
  } else {
    // Rusticated coursing on the lower storeys, plain weathered stone above.
    const rusticTop = groundY - BASEMENT_H - 48;
    for (let y = groundY - 6; y > rusticTop; y -= 6) dither(ctx, x, y, width, 1, style.wallDark, 0.75);
    const specks = Math.round((width * bodyH) / 45);
    for (let i = 0; i < specks; i++) {
      const sx = x + between(rng, 2, width - 4);
      const sy = top + between(rng, 2, bodyH - 3);
      rect(ctx, sx, sy, between(rng, 1, 3), 1, rng() < 0.5 ? style.wallLight : style.wallDark);
    }
  }

  // Low sun from the left: lit edge, shadowed party wall.
  rect(ctx, x, top, 2, bodyH, style.wallLight);
  rect(ctx, x + width - 2, top, 2, bodyH, style.wallDark);
}

function drawWindow(ctx, cx, top, h, style, state, rng) {
  const gx = cx - WINDOW_W / 2;
  const lit = state !== 'dark';

  // Lintel and sill.
  rect(ctx, gx - 2, top - 4, WINDOW_W + 4, 4, style.trim);
  rect(ctx, gx - 2, top - 4, WINDOW_W + 4, 1, style.trimLight);
  rect(ctx, gx - 2, top + h, WINDOW_W + 4, 2, style.trimLight);
  rect(ctx, gx - 1, top + h + 2, WINDOW_W + 2, 1, style.wallDark);

  // Sash.
  rect(ctx, gx, top, WINDOW_W, h, WINDOW.frame);
  const paneX = gx + 1;
  const paneW = WINDOW_W - 2;
  const railY = top + Math.floor(h / 2);
  if (lit) {
    rect(ctx, paneX, top + 1, paneW, railY - top - 1, WINDOW.litUpper);
    rect(ctx, paneX, railY + 1, paneW, top + h - railY - 2, WINDOW.litLower);
    const curtain = pick(rng, WINDOW.curtains);
    rect(ctx, paneX, top + 1, 3, h - 2, curtain);
    rect(ctx, paneX + paneW - 3, top + 1, 3, h - 2, curtain);
    rect(ctx, paneX, top + 1, paneW, 2, curtain);
    rect(ctx, paneX, railY, paneW, 1, WINDOW.frame);
    if (state === 'cat') drawCat(ctx, cx - 2, top + h - 1);
  } else {
    rect(ctx, paneX, top + 1, paneW, h - 2, WINDOW.dark);
    line(ctx, paneX + 2, top + 7, paneX + 6, top + 3, WINDOW.glint);
    line(ctx, paneX + 4, top + 9, paneX + 9, top + 4, WINDOW.glint);
    rect(ctx, paneX, railY, paneW, 1, WINDOW.frame);
    // Frost creeping in from the bottom corners of cold, dark panes.
    const by = top + h - 2;
    rect(ctx, paneX, by, 3, 1, ICE.mid);
    px(ctx, paneX, by - 1, ICE.mid);
    rect(ctx, paneX + paneW - 3, by, 3, 1, ICE.mid);
    px(ctx, paneX + paneW - 1, by - 1, ICE.mid);
  }

  // A dusting of snow on the sill.
  rect(ctx, gx - 1, top + h - 1, between(rng, 5, 9), 1, ICE.white);
  rect(ctx, gx + WINDOW_W - between(rng, 3, 6), top + h - 1, 4, 1, ICE.light);
}

function drawCat(ctx, x, sillY) {
  rect(ctx, x, sillY - 3, 6, 3, INK);
  rect(ctx, x, sillY - 6, 4, 3, INK);
  px(ctx, x, sillY - 7, INK);
  px(ctx, x + 3, sillY - 7, INK);
  px(ctx, x + 6, sillY - 1, INK);
}

function drawGardenWindow(ctx, cx, top, style) {
  rect(ctx, cx - 7, top - 1, 14, 1, style.trim);
  rect(ctx, cx - 6, top, 12, 8, WINDOW.dark);
  for (let bx = cx - 4; bx < cx + 6; bx += 3) rect(ctx, bx, top, 1, 8, IRON);
  rect(ctx, cx - 7, top + 8, 14, 1, style.trimLight);
}

// Low iron fence along the areaway, broken where the stoop comes down.
function drawAreaFence(ctx, x0, x1, doorX, groundY) {
  const gapL = doorX - 19;
  const gapR = doorX + 19;
  for (let fx = x0; fx <= x1; fx += 3) {
    if (fx > gapL && fx < gapR) continue;
    rect(ctx, fx, groundY - 10, 1, 10, IRON);
  }
  if (gapL > x0) rect(ctx, x0, groundY - 8, gapL - x0 + 1, 1, IRON);
  if (x1 > gapR) rect(ctx, gapR, groundY - 8, x1 - gapR + 1, 1, IRON);
}

function drawDoor(ctx, cx, sillY, style, festive) {
  const leafH = 34;
  const doorTop = sillY - leafH;

  // Surround: pilasters, transom, bracketed hood.
  rect(ctx, cx - 13, sillY - 42, 26, 42, style.trim);
  rect(ctx, cx - 13, sillY - 42, 1, 42, style.trimLight);
  rect(ctx, cx - 15, sillY - 47, 30, 5, style.trimLight);
  rect(ctx, cx - 15, sillY - 43, 30, 1, style.trimDark);
  rect(ctx, cx - 14, sillY - 42, 3, 4, style.trimDark);
  rect(ctx, cx + 11, sillY - 42, 3, 4, style.trimDark);
  rect(ctx, cx - 14, sillY - 48, 12, 1, ICE.white);
  rect(ctx, cx + 3, sillY - 48, 9, 1, ICE.light);

  rect(ctx, cx - 10, sillY - 41, 20, 6, WINDOW.frame);
  rect(ctx, cx - 9, sillY - 40, 18, 4, WINDOW.litLower);
  rect(ctx, cx, sillY - 40, 1, 4, WINDOW.frame);

  // Double doors with a lit pane over a recessed panel on each leaf.
  rect(ctx, cx - 10, doorTop, 20, leafH, style.doorDark);
  for (const leafX of [cx - 9, cx + 1]) {
    rect(ctx, leafX, doorTop + 1, 8, leafH - 1, style.door);
    rect(ctx, leafX + 1, doorTop + 3, 6, 12, WINDOW.litUpper);
    rect(ctx, leafX + 1, doorTop + 3, 6, 1, WINDOW.frame);
    rect(ctx, leafX + 1, doorTop + 19, 6, 11, style.doorDark);
    rect(ctx, leafX + 2, doorTop + 20, 4, 9, style.door);
  }
  px(ctx, cx - 2, doorTop + 18, '#f2b33d');
  px(ctx, cx + 1, doorTop + 18, '#f2b33d');

  if (festive) {
    drawWreath(ctx, cx - 5, doorTop + 9);
    drawWreath(ctx, cx + 5, doorTop + 9);
  }
}

function drawWreath(ctx, cx, cy) {
  const green = '#2f6b3f';
  const greenDark = '#1d4529';
  rect(ctx, cx - 2, cy - 3, 5, 7, greenDark);
  rect(ctx, cx - 3, cy - 2, 7, 5, greenDark);
  rect(ctx, cx - 2, cy - 3, 4, 1, green);
  rect(ctx, cx - 3, cy - 2, 1, 4, green);
  rect(ctx, cx - 1, cy - 1, 3, 3, WINDOW.litUpper);
  px(ctx, cx - 2, cy + 1, '#d9402f');
  px(ctx, cx + 2, cy - 2, '#d9402f');
  px(ctx, cx + 3, cy + 1, '#d9402f');
  rect(ctx, cx - 1, cy + 3, 3, 1, '#b8342f');
  px(ctx, cx, cy + 4, '#b8342f');
  rect(ctx, cx - 1, cy - 4, 3, 1, ICE.white);
}

function drawStoop(ctx, cx, groundY, style, rng) {
  const steps = BASEMENT_H / STEP_H;
  const halfAt = (i) => 15 - Math.floor(i / 3);

  // Cheek walls first, tallest at the back, so the treads overlap them.
  for (let i = steps - 1; i >= 0; i--) {
    const half = halfAt(i);
    const h = STEP_H * (i + 1);
    rect(ctx, cx - half - 3, groundY - h, 3, h, style.trim);
    rect(ctx, cx - half - 3, groundY - h, 1, h, style.trimLight);
    rect(ctx, cx + half, groundY - h, 3, h, style.trim);
    rect(ctx, cx + half + 2, groundY - h, 1, h, style.trimDark);
  }

  for (let i = 0; i < steps; i++) {
    const half = halfAt(i);
    const y = groundY - STEP_H * (i + 1);
    rect(ctx, cx - half, y, half * 2, 1, style.trimLight);
    rect(ctx, cx - half, y + 1, half * 2, 1, style.trimDark);
    // Snow collects in the corners where nobody steps.
    if (rng() < 0.7) rect(ctx, cx - half, y, between(rng, 2, 5), 1, ICE.light);
    if (rng() < 0.5) rect(ctx, cx + half - 3, y, 3, 1, ICE.white);
  }

  for (const side of [-1, 1]) {
    const newelX = cx + side * 17;
    const topX = cx + side * 12;
    const railBottomY = groundY - 15;
    const railTopY = groundY - BASEMENT_H - 13;
    line(ctx, newelX, railBottomY, topX, railTopY, IRON);
    for (let i = 1; i < steps; i += 2) {
      const bx = cx + side * (halfAt(i) + 1);
      const t = (newelX - bx) / (newelX - topX);
      const railY = Math.round(railBottomY + (railTopY - railBottomY) * t);
      rect(ctx, bx, railY, 1, groundY - STEP_H * (i + 1) - railY, IRON);
    }
    rect(ctx, newelX - (side < 0 ? 1 : 0), groundY - 17, 2, 17, IRON);
    rect(ctx, newelX - (side < 0 ? 1 : 0), groundY - 18, 2, 1, ICE.white);
  }
}

function drawChimney(ctx, x, roofY, style) {
  rect(ctx, x, roofY - 10, 10, 10, style.wallDark);
  rect(ctx, x, roofY - 10, 2, 10, style.wall);
  rect(ctx, x - 1, roofY - 12, 12, 2, style.trimDark);
  rect(ctx, x - 1, roofY - 13, 8, 1, ICE.white);
  return { x: x + 5, y: roofY - 14 };
}

function drawCornice(ctx, x, wallTop, width, style, rng, festive) {
  const y = wallTop - CORNICE_H;
  const left = x - 3;
  const w = width + 6;

  dither(ctx, x, wallTop, width, 3, style.wallDark, 0.5);

  rect(ctx, left, y, w, CORNICE_H, style.trimDark);
  rect(ctx, left, y, w, 2, style.trimLight);
  rect(ctx, left + 1, y + 2, w - 2, 3, style.trim);
  for (let bx = x + 3; bx < x + width - 5; bx += 10) {
    rect(ctx, bx, y + 6, 4, 7, style.trim);
    rect(ctx, bx, y + 6, 1, 7, style.trimLight);
  }
  rect(ctx, left, y + CORNICE_H - 1, w, 1, INK);

  // Thin snow cap with a few deeper drifts.
  rect(ctx, left, y - 1, w, 1, ICE.white);
  rect(ctx, left + w - 12, y - 1, 12, 1, ICE.mid);
  const drifts = between(rng, 2, 4);
  for (let i = 0; i < drifts; i++) {
    rect(ctx, left + between(rng, 2, w - 14), y - 2, between(rng, 5, 11), 1, ICE.white);
  }

  const icicles = festive ? Math.round(width / 9) : between(rng, 2, 5);
  for (let i = 0; i < icicles; i++) {
    const ix = left + between(rng, 1, w - 2);
    const len = between(rng, 2, 5);
    rect(ctx, ix, y + CORNICE_H, 1, len, ICE.light);
    px(ctx, ix, y + CORNICE_H + len - 1, ICE.white);
  }
}
