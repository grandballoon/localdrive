/*
 * The handbill puts two layers over its page: the donate form, a disclosure
 * that drops out of the primary button, and "How it works", a panel that
 * slides in from the right across the whole page.
 *
 * Each layer has exactly one setter, and that setter is the only place its
 * attributes are written, so the trigger's `aria-expanded` can never drift
 * from what is on screen. Escape is shared because only the topmost open
 * layer should answer it.
 */

const page = document.querySelector('#handbill-page');
const scrollHint = document.querySelector('#scroll-hint');

const donateToggle = document.querySelector('#donate-toggle');
const donateForm = document.querySelector('#donate-form');

const panelToggle = document.querySelector('#how-it-works-toggle');
const panel = document.querySelector('#how-it-works');
const panelClose = document.querySelector('#how-it-works-close');

const isOpen = (trigger) => trigger.getAttribute('aria-expanded') === 'true';

/*
 * The caret is a statement about the scroller, so it is derived from the
 * scroller and never set by hand: it shows only while the page has copy left
 * below the fold. Sub-pixel rounding in scrollHeight can leave a fraction of a
 * pixel at the very bottom, hence the slop.
 */
const SCROLL_END_SLOP = 2;

function updateScrollHint() {
  const remaining = page.scrollHeight - page.clientHeight - page.scrollTop;
  scrollHint.dataset.visible = String(remaining > SCROLL_END_SLOP);
}

page.addEventListener('scroll', updateScrollHint, { passive: true });

/*
 * Observing the scroller catches the viewport resizing; observing its children
 * catches the copy growing, which is what opening the donate form does (a
 * hidden child measures 0x0, so revealing it resizes it).
 */
const contentObserver = new ResizeObserver(updateScrollHint);
contentObserver.observe(page);
for (const child of page.children) contentObserver.observe(child);

function setDonateOpen(open) {
  donateToggle.setAttribute('aria-expanded', String(open));
  donateForm.hidden = !open;
  // The handbill is a scroll box, so opening also brings the form into view.
  if (open) donateForm.scrollIntoView({ block: 'nearest' });
}

function setPanelOpen(open) {
  panelToggle.setAttribute('aria-expanded', String(open));
  panel.dataset.open = String(open);
  // Whichever layer is underneath stops taking focus and clicks entirely.
  panel.inert = !open;
  page.inert = open;
  (open ? panelClose : panelToggle).focus();
}

donateToggle.addEventListener('click', () => setDonateOpen(!isOpen(donateToggle)));
panelToggle.addEventListener('click', () => setPanelOpen(true));
panelClose.addEventListener('click', () => setPanelOpen(false));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (isOpen(panelToggle)) {
    setPanelOpen(false);
  } else if (isOpen(donateToggle)) {
    setDonateOpen(false);
    donateToggle.focus();
  }
});
