import { drawSky } from './sky.js';
import { drawSkyline } from './skyline.js';
import { planBlock } from './block.js';
import { drawRowhouse } from './rowhouse.js';
import { drawStreet } from './street.js';
import { drawLamppost, drawHydrant, drawDonationCrate } from './props.js';
import { drawTree } from './tree.js';
import { createWeather, createSmoke } from './weather.js';
import { createMailman } from '../actors/mailman.js';

// Composes the scene for one layout. Everything that never moves is painted
// once into a backdrop; each frame is that backdrop plus the animated layers.
export function createScene(layout) {
  const backdrop = document.createElement('canvas');
  backdrop.width = layout.W;
  backdrop.height = layout.H;
  const bctx = backdrop.getContext('2d');

  drawSky(bctx, layout);
  drawSkyline(bctx, layout);

  let heroChimney = null;
  for (const spec of planBlock(layout)) {
    const { chimney } = drawRowhouse(bctx, spec);
    if (spec.isHero) heroChimney = chimney;
  }

  drawStreet(bctx, layout);
  drawDonationCrate(bctx, layout.crate);
  drawTree(bctx, layout.tree);
  drawLamppost(bctx, layout.lamppost);
  drawHydrant(bctx, layout.hydrant);

  // Back to front.
  const animated = [createSmoke(heroChimney), createMailman(layout.mailman), createWeather(layout)];

  return {
    update(dt) {
      for (const layer of animated) layer.update(dt);
    },
    draw(ctx) {
      ctx.drawImage(backdrop, 0, 0);
      for (const layer of animated) layer.draw(ctx);
    },
  };
}
