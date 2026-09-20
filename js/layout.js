// Turns a viewport (in scene pixels) into where everything stands.
// The scene is anchored to the ground, so extra height becomes sky and extra
// width becomes more of the block; nothing is ever scaled or cropped to fit.

export const GROUND_H = 40; // sidewalk + curb + street
export const SIDEWALK_H = 24;
export const CURB_H = 4;

export const HERO = { width: 116, floors: [48, 42, 38] };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// heroAnchor: 0..1, the horizontal centre of the hero brownstone.
export function computeLayout({ W, H }, heroAnchor) {
  const groundY = H - GROUND_H;
  const heroX = Math.round(
    clamp(W * heroAnchor - HERO.width / 2, 4, Math.max(4, W - HERO.width - 4)),
  );

  return {
    W,
    H,
    groundY,
    curbY: groundY + SIDEWALK_H,
    hero: { x: heroX, ...HERO },
    mailman: { x: heroX + 42, feetY: groundY + 10 },
    crate: { x: heroX + 76, baseY: groundY + 8 },
    lamppost: { x: heroX - 40, baseY: groundY + 21 },
    hydrant: { x: heroX + 106, baseY: groundY + 22 },
    tree: { x: heroX + HERO.width + 26, baseY: groundY + 20 },
    puddle: { x: heroX + 58, y: groundY + SIDEWALK_H + CURB_H + 5 },
    moon: { x: W - 28, y: 16 },
  };
}
