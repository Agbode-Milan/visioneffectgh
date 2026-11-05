import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

gsap.registerPlugin(ScrollTrigger);
window.__motionReady = true;

const root = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const media = gsap.matchMedia();

// Wrap each word so it can be animated, keeping the text readable to everyone
function splitWords(el: HTMLElement) {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(' ');
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'word';
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.append(inner);
          frag.append(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  return [...el.querySelectorAll<HTMLElement>('.word > span')];
}

media.add('(prefers-reduced-motion: no-preference)', () => {
  // Page opening headline, line by line
  const lines = gsap.utils.toArray<HTMLElement>('[data-lines] .line > span');
  if (lines.length) {
    gsap.fromTo(lines, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  }
  gsap.to('[data-intro]', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
  gsap.to('[data-float]', { opacity: 1, scale: 1, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.25 });

  // Headings reveal word by word as they arrive
  gsap.utils.toArray<HTMLElement>('[data-words]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.035 }),
    });
  });

  // Statement fills with colour, tied to the scroll
  gsap.utils.toArray<HTMLElement>('[data-fill]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { opacity: 0.16 });
    gsap.to(words, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
    });
  });

  // General reveals
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }),
  });

  // Images ease out of a slight zoom as they pass
  gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 1.14 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  // Parallax, stronger on larger screens
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed ?? '0');
    gsap.to(el, {
      y: () => speed * window.innerHeight,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });

  // Footer call to action grows into place
  gsap.utils.toArray<HTMLElement>('[data-grow]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 0.86, transformOrigin: 'left bottom' },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 40%', scrub: true } },
    );
  });
});

// Desktop: the work showcase pins and travels sideways
media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
  const section = document.querySelector<HTMLElement>('.showcase');
  const track = section?.querySelector<HTMLElement>('.showcase-track');
  if (!section || !track) return;
  section.classList.add('is-pinned');
  // The track moves by transform, so load its images up front rather than as they arrive
  track.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  const distance = () => track.scrollWidth - window.innerWidth;
  const travel = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 0.8,
      end: () => `+=${distance()}`,
      invalidateOnRefresh: true,
    },
  });
  const progress = section.querySelector<HTMLElement>('.showcase-progress span');
  if (progress) {
    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true } });
  }
  // Each product drifts against the direction of travel, and its name the other way
  gsap.utils.toArray<HTMLElement>('.panel').forEach((panel) => {
    const product = panel.querySelector('.panel-product');
    const name = panel.querySelector('.panel-name');
    const shared = { ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true } };
    if (product) gsap.fromTo(product, { xPercent: 16, rotate: 4 }, { xPercent: -16, rotate: -4, ...shared });
    if (name) gsap.fromTo(name, { xPercent: -12 }, { xPercent: 12, ...shared });
  });
  return () => section.classList.remove('is-pinned');
});

// Mouse-driven touches, only where there is a mouse
if (fine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Hero products shift with the cursor
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    const items = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
      depth: parseFloat(el.dataset.depth ?? '0'),
    }));
    hero.addEventListener('pointermove', (event) => {
      const dx = event.clientX / window.innerWidth - 0.5;
      const dy = event.clientY / window.innerHeight - 0.5;
      items.forEach((item) => {
        item.x(dx * item.depth);
        item.y(dy * item.depth);
      });
    });
  }

  // Products lean towards the cursor inside their tiles
  document.querySelectorAll<HTMLElement>('[data-lean]').forEach((tile) => {
    const product = tile.querySelector<HTMLElement>('[data-lean-target]');
    if (!product) return;
    const x = gsap.quickTo(product, 'x', { duration: 0.8, ease: 'power3.out' });
    const y = gsap.quickTo(product, 'y', { duration: 0.8, ease: 'power3.out' });
    const r = gsap.quickTo(product, 'rotate', { duration: 0.8, ease: 'power3.out' });
    tile.addEventListener('pointermove', (event) => {
      const box = tile.getBoundingClientRect();
      const dx = (event.clientX - box.left) / box.width - 0.5;
      const dy = (event.clientY - box.top) / box.height - 0.5;
      x(dx * 32);
      y(dy * 32);
      r(dx * 5);
    });
    tile.addEventListener('pointerleave', () => {
      x(0);
      y(0);
      r(0);
    });
  });

  // Buttons pull gently towards the cursor
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (event) => {
      const box = el.getBoundingClientRect();
      x((event.clientX - box.left - box.width / 2) * 0.3);
      y((event.clientY - box.top - box.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });

  // A small "View" label follows the cursor over work
  const tag = document.createElement('div');
  tag.className = 'cursor-tag';
  tag.setAttribute('aria-hidden', 'true');
  tag.textContent = 'View';
  document.body.append(tag);
  const tagX = gsap.quickTo(tag, 'x', { duration: 0.35, ease: 'power3.out' });
  const tagY = gsap.quickTo(tag, 'y', { duration: 0.35, ease: 'power3.out' });
  window.addEventListener('pointermove', (event) => {
    tagX(event.clientX);
    tagY(event.clientY);
  });
  document.querySelectorAll('[data-viewer]').forEach((el) => {
    el.addEventListener('pointerenter', () => tag.classList.add('on'));
    el.addEventListener('pointerleave', () => tag.classList.remove('on'));
    el.addEventListener('click', () => tag.classList.remove('on'));
  });

  // Service rows show their picture beside the cursor
  const peek = document.querySelector<HTMLElement>('.service-peek');
  if (peek) {
    const peekX = gsap.quickTo(peek, 'x', { duration: 0.6, ease: 'power3.out' });
    const peekY = gsap.quickTo(peek, 'y', { duration: 0.6, ease: 'power3.out' });
    const pictures = [...peek.querySelectorAll<HTMLElement>('[data-peek]')];
    document.querySelectorAll<HTMLElement>('[data-peek-row]').forEach((row) => {
      row.addEventListener('pointerenter', () => {
        peek.classList.add('on');
        pictures.forEach((p) => p.classList.toggle('on', p.dataset.peek === row.dataset.peekRow));
      });
      row.addEventListener('pointerleave', () => peek.classList.remove('on'));
      row.addEventListener('pointermove', (event) => {
        peekX(event.clientX);
        peekY(event.clientY);
      });
    });
  }
}

// Layout can shift once images and fonts arrive
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
