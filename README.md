# Local Drive

Prototype landing page for a donate-a-computer drive supporting free community computer labs.
One screen: a 16-bit pixel-art Brooklyn stoop at dusk in late autumn, with a handbill carrying the pitch.
The page itself never scrolls; the handbill is its own scroll box, so copy can outgrow the viewport without being clipped or hidden.

"Local Drive" and all copy are placeholders.
"Donate a computer" is a disclosure: it opens a panel directly beneath the button holding the donation form.
`#how-it-works` and the company link in the donate copy point at anchors that do not exist yet, and the form itself is a placeholder block.

## Run

```sh
npm start   # serves on http://localhost:5173 (ES modules need a server, not file://)
npm test    # renders the scene against a stub canvas; no browser needed
```

There are no dependencies and no build step.

## How it fits together

The page is two layers.
The handbill is HTML and CSS (`index.html`, `css/styles.css`), with one small script for the donate disclosure.
It is capped at a share of the viewport and scrolls internally, with the airmail stripe pinned to its top edge.
On narrow or portrait screens that cap is tighter, so the handbill keeps to the top of the screen and leaves the mailman and his stoop the bottom.
The scene is a low-resolution canvas drawn by `js/`, scaled up by a whole-number factor so pixels stay square and crisp.

Two CSS custom properties are the only contract between the layers.
`--u` is set by `js/main.js` to the on-screen size of one scene pixel, so the handbill's borders sit on the same grid as the art.
`--hero-anchor` is set by CSS breakpoints and read by `js/main.js`, so responsive layout decisions live in the stylesheet alone.

The scene never stretches or crops.
It is anchored to the ground: extra viewport height becomes sky, and extra width becomes more of the block.

| Path | Responsibility |
| --- | --- |
| `js/main.js` | Canvas sizing, resize handling, frame loop. |
| `js/handbill.js` | The donate disclosure: button state, panel visibility. |
| `js/layout.js` | Viewport in, positions of everything out. |
| `js/palette.js` | Every colour in the scene. |
| `js/lib/` | Pixel-grid drawing primitives and a seeded RNG. |
| `js/scene/index.js` | Composes static layers into a backdrop, then animated layers per frame. |
| `js/scene/*.js` | One file per subject: sky, skyline, rowhouse, block plan, street, props, tree, weather. |
| `js/actors/mailman.sprite.js` | The mailman as editable character grids plus his palette. |
| `js/actors/mailman.js` | His idle behaviour: breathing, waving, blinking, fogging the air. |

## Iterating on the art

To redraw the mailman, edit the grids in `js/actors/mailman.sprite.js`.
One character is one pixel, and the palette keys are documented at the top of that file.

To restyle buildings, edit `ROWHOUSE_STYLES` in `js/palette.js`, or the hero's window states in `js/scene/block.js`.
Everything procedural is seeded, so the scene is identical on every load.
