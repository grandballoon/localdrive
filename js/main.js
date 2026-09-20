import { computeLayout } from './layout.js';
import { createScene } from './scene/index.js';

// Owns the canvas: picks an integer pixel scale for the viewport, rebuilds the
// scene when the viewport changes, and runs the frame loop.

const TARGET_ROWS = 216; // fewest scene rows that still fit the whole brownstone
const FRAME_SECONDS = 1 / 20; // deliberately low, for a period-correct cadence

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let scene = null;
let lastFrame = 0;
let rebuildQueued = false;

function rebuild() {
  rebuildQueued = false;
  const scale = Math.max(1, Math.floor(window.innerHeight / TARGET_ROWS));
  const W = Math.ceil(window.innerWidth / scale);
  const H = Math.ceil(window.innerHeight / scale);

  canvas.width = W;
  canvas.height = H;
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
  root.style.setProperty('--u', `${scale}px`);

  const heroAnchor = parseFloat(getComputedStyle(root).getPropertyValue('--hero-anchor')) || 0.5;
  scene = createScene(computeLayout({ W, H }, heroAnchor));
  scene.draw(ctx);
}

function frame(now) {
  requestAnimationFrame(frame);
  if (reducedMotion.matches) return;
  if (now - lastFrame < FRAME_SECONDS * 1000) return;
  lastFrame = now;
  scene.update(FRAME_SECONDS);
  scene.draw(ctx);
}

window.addEventListener('resize', () => {
  if (rebuildQueued) return;
  rebuildQueued = true;
  requestAnimationFrame(rebuild);
});

rebuild();
requestAnimationFrame(frame);
