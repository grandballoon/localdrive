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

const donateToggle = document.querySelector('#donate-toggle');
const donateForm = document.querySelector('#donate-form');

const panelToggle = document.querySelector('#how-it-works-toggle');
const panel = document.querySelector('#how-it-works');
const panelClose = document.querySelector('#how-it-works-close');

const isOpen = (trigger) => trigger.getAttribute('aria-expanded') === 'true';

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
