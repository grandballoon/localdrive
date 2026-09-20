import { test } from 'node:test';
import assert from 'node:assert/strict';

// Renders the whole scene against a recording stand-in for the 2D canvas API.
// Catches what a browser would only show as a blank or smeared canvas: ragged
// sprite grids, unknown palette keys, and NaN / fractional pixel coordinates.

function installFakeCanvas() {
  const calls = [];
  const makeCanvas = () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      fillStyle: '',
      fillRect: (...args) => calls.push(args),
      drawImage: (_image, ...args) => calls.push(args),
    }),
  });
  globalThis.document = { createElement: makeCanvas };
  return { calls, makeCanvas };
}

const VIEWPORTS = [
  { name: 'desktop', W: 480, H: 270, anchor: 0.7 },
  { name: 'short desktop', W: 683, H: 216, anchor: 0.7 },
  { name: 'phone', W: 130, H: 282, anchor: 0.5 },
];

for (const { name, W, H, anchor } of VIEWPORTS) {
  test(`scene renders on whole pixels: ${name}`, async () => {
    const { calls, makeCanvas } = installFakeCanvas();
    const { computeLayout } = await import('../js/layout.js');
    const { createScene } = await import('../js/scene/index.js');

    const scene = createScene(computeLayout({ W, H }, anchor));
    const ctx = makeCanvas().getContext();
    for (let i = 0; i < 200; i++) {
      scene.update(1 / 20);
      scene.draw(ctx);
    }

    assert.ok(calls.length > 1000, 'scene should paint something substantial');
    for (const args of calls) {
      for (const value of args) {
        assert.ok(Number.isInteger(value), `non-integer draw coordinate in (${args.join(', ')})`);
      }
    }
  });
}

test('hero brownstone stays fully on screen', async () => {
  const { computeLayout } = await import('../js/layout.js');
  for (const { W, H, anchor } of VIEWPORTS) {
    const { hero } = computeLayout({ W, H }, anchor);
    assert.ok(hero.x >= 0 && hero.x + hero.width <= W);
  }
});
