import { mulberry32, pick } from '../lib/rng.js';
import { ROWHOUSE_STYLES } from '../palette.js';

// Plans the row of houses: the hero brownstone plus as many neighbours as it
// takes to run off both edges of the screen. Returns rowhouse specs in paint
// order (neighbours first, so the hero's cornice overlaps theirs).

const NEIGHBOUR_STYLES = [
  ROWHOUSE_STYLES.redBrick,
  ROWHOUSE_STYLES.plumStone,
  ROWHOUSE_STYLES.ochreBrick,
];
const NEIGHBOUR_WIDTHS = [92, 104, 96];
const NEIGHBOUR_FLOORS = [[44, 40, 34], [46, 40, 36], [44, 38]];

// Hero windows, by floor then bay. Bay 0 on the parlor floor is the door.
const HERO_WINDOWS = [
  ['dark', 'lit', 'lit'],
  ['cat', 'dark', 'lit'],
  ['dark', 'lit', 'dark'],
];

export function planBlock({ W, groundY, hero }) {
  const specs = [];

  const neighbour = (seed, x, width) => {
    const rng = mulberry32(seed);
    return {
      x,
      groundY,
      width,
      floors: pick(rng, NEIGHBOUR_FLOORS),
      style: NEIGHBOUR_STYLES[seed % NEIGHBOUR_STYLES.length],
      seed,
      doorBay: rng() < 0.5 ? 0 : width >= 100 ? 2 : 1,
    };
  };

  let x = hero.x;
  for (let i = 1; x > 0; i++) {
    const width = NEIGHBOUR_WIDTHS[i % NEIGHBOUR_WIDTHS.length];
    x -= width;
    specs.push(neighbour(1000 + i, x, width));
  }

  x = hero.x + hero.width;
  for (let i = 1; x < W; i++) {
    const width = NEIGHBOUR_WIDTHS[(i + 1) % NEIGHBOUR_WIDTHS.length];
    specs.push(neighbour(2000 + i, x, width));
    x += width;
  }

  specs.push({
    x: hero.x,
    groundY,
    width: hero.width,
    floors: hero.floors,
    style: ROWHOUSE_STYLES.brownstone,
    seed: 7,
    doorBay: 0,
    windowAt: (floor, bay) => HERO_WINDOWS[floor][bay],
    festive: true,
    isHero: true,
  });

  return specs;
}
