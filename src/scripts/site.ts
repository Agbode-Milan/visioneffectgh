// Menu, header behaviour and swipe-row status. Runs for every visitor, with or without motion.
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.getElementById('site-nav');
const root = document.documentElement;

function setMenu(open: boolean) {
  menu?.classList.toggle('open', open);
  root.classList.toggle('menu-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  if (toggle) toggle.textContent = open ? 'Close' : 'Menu';
}
toggle?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

// Header: solid once scrolled, tucks away going down, returns going up
const header = document.querySelector<HTMLElement>('.site-header');
let lastY = window.scrollY;
window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    header?.classList.toggle('is-solid', y > 40);
    if (Math.abs(y - lastY) > 6) {
      header?.classList.toggle('is-tucked', y > lastY && y > 300 && !menu?.classList.contains('open'));
      lastY = y;
    }
  },
  { passive: true },
);

// Swipeable rows: show which item you are on
document.querySelectorAll<HTMLElement>('.swipe').forEach((row) => {
  const status = document.createElement('p');
  status.className = 'swipe-status';
  status.setAttribute('aria-hidden', 'true');
  row.after(status);
  const update = () => {
    const items = [...row.children].filter((c) => !(c as HTMLElement).hidden) as HTMLElement[];
    const start = row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft);
    let index = 0;
    let best = Infinity;
    items.forEach((item, i) => {
      const gap = Math.abs(item.getBoundingClientRect().left - start);
      if (gap < best) {
        best = gap;
        index = i;
      }
    });
    // At the far end the last item can't reach the start edge
    if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 2 && row.scrollLeft > 0) index = items.length - 1;
    status.textContent = `${index + 1} of ${items.length}. Swipe for more`;
  };
  let frame = 0;
  row.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  row.addEventListener('swipe:refresh', () => {
    row.scrollLeft = 0;
    update();
  });
  window.addEventListener('resize', update);
  update();
});
