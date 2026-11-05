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

// Each product drifts against the direction of travel, and its name the other way
function panelDrift(travel: gsap.core.Tween) {
  gsap.utils.toArray<HTMLElement>('.panel').forEach((panel) => {
    const product = panel.querySelector('.panel-product');
    const name = panel.querySelector('.panel-name');
    const shared = { ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true } };
    if (product) gsap.fromTo(product, { xPercent: 16, rotate: 4 }, { xPercent: -16, rotate: -4, ...shared });
    if (name) gsap.fromTo(name, { xPercent: -12 }, { xPercent: 12, ...shared });
  });
}

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
  panelDrift(travel);
  return () => section.classList.remove('is-pinned');
});

// Phones and tablets: the same sideways travel, held in place with position: sticky,
// which stays steady while a phone's address bar comes and goes
media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const section = document.querySelector<HTMLElement>('.showcase');
  const track = section?.querySelector<HTMLElement>('.showcase-track');
  if (!section || !track) return;
  section.classList.add('is-travel');
  const count = track.children.length;
  const distance = () => (count - 1) * window.innerWidth;
  const setHeight = () => {
    section.style.height = `calc(100svh + ${distance()}px)`;
  };
  setHeight();
  ScrollTrigger.addEventListener('refreshInit', setHeight);
  // Load the pictures just before they are needed
  const loader = ScrollTrigger.create({
    trigger: section,
    start: 'top 200%',
    once: true,
    onEnter: () => track.querySelectorAll('img').forEach((img) => (img.loading = 'eager')),
  });
  const travel = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      invalidateOnRefresh: true,
      snap: { snapTo: 1 / (count - 1), inertia: false, duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: 'power2.out' },
    },
  });
  const progress = section.querySelector<HTMLElement>('.showcase-progress span');
  if (progress) {
    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true } });
  }
  panelDrift(travel);
  return () => {
    loader.kill();
    ScrollTrigger.removeEventListener('refreshInit', setHeight);
    section.classList.remove('is-travel');
    section.style.height = '';
  };
});

// Upright screens: the hero products turn on a ring. It moves by itself, and a finger can spin it
media.add('(max-aspect-ratio: 1/1) and (prefers-reduced-motion: no-preference)', () => {
  const box = document.querySelector<HTMLElement>('.hero-products');
  const row = box?.querySelector<HTMLElement>('.hero-row');
  if (!box || !row) return;
  const floats = gsap.utils.toArray<HTMLElement>('.float', row);
  const parts = floats.map((f) => f.querySelector<HTMLElement>('[data-depth]')!);
  const disc = row.querySelector<HTMLElement>('.hero-disc')!;
  const label = row.querySelector<HTMLElement>('.hero-ring-name')!;
  const count = floats.length;
  const wrapOffset = gsap.utils.wrap(-count / 2, count / 2);
  box.classList.add('is-ring');

  const state = { pos: Math.max(0, floats.findIndex((f) => 'start' in f.dataset)) };
  let width = row.clientWidth;
  let front = -1;

  const render = () => {
    const nearest = gsap.utils.wrap(0, count, Math.round(state.pos));
    floats.forEach((float, i) => {
      const angle = (wrapOffset(i - state.pos) * Math.PI * 2) / count;
      const facing = (Math.cos(angle) + 1) / 2;
      gsap.set(parts[i], {
        x: Math.sin(angle) * width * 0.43,
        scale: 0.34 + 0.66 * facing ** 1.6,
        rotation: Math.sin(angle) * 13,
        opacity: gsap.utils.clamp(0, 1, facing * 2.4 - 0.25),
      });
      float.style.zIndex = String(Math.round(facing * 30));
    });
    if (nearest !== front) {
      front = nearest;
      label.textContent = floats[front].dataset.name ?? '';
      gsap.to(disc, { backgroundColor: floats[front].dataset.disc, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      gsap.fromTo(disc, { scale: 0.9 }, { scale: 1, duration: 0.9, ease: 'expo.out', overwrite: false });
    }
  };
  render();

  let turning: gsap.core.Tween | null = null;
  const go = (to: number) => {
    turning?.kill();
    turning = gsap.to(state, { pos: to, duration: 1.05, ease: 'expo.inOut', onUpdate: render });
  };

  // Moves on by itself while it can be seen and no one is touching it
  let held = false;
  let visible = true;
  const tick = () => {
    if (!held && visible && !document.hidden) go(Math.round(state.pos) + 1);
    timer.restart(true);
  };
  const timer = gsap.delayedCall(2.8, tick);
  const seen = ScrollTrigger.create({
    trigger: box,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      visible = self.isActive;
    },
  });

  let startX = 0;
  let startPos = 0;
  let lastX = 0;
  let lastT = 0;
  let speed = 0;
  let moved = 0;
  const down = (event: PointerEvent) => {
    held = true;
    moved = 0;
    speed = 0;
    startX = lastX = event.clientX;
    lastT = event.timeStamp;
    startPos = state.pos;
    turning?.kill();
    box.setPointerCapture?.(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!held) return;
    const dt = Math.max(1, event.timeStamp - lastT);
    speed = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastT = event.timeStamp;
    moved = Math.max(moved, Math.abs(event.clientX - startX));
    state.pos = startPos - (event.clientX - startX) / (width * 0.5);
    render();
  };
  const release = (tap: boolean) => {
    if (!held) return;
    held = false;
    timer.restart(true);
    if (tap && moved < 8) go(Math.round(state.pos) + 1);
    else go(Math.round(state.pos - gsap.utils.clamp(-1, 1, speed * 0.6)));
  };
  const up = () => release(true);
  const cancel = () => release(false);
  const resize = () => {
    width = row.clientWidth;
    render();
  };
  box.addEventListener('pointerdown', down);
  box.addEventListener('pointermove', move);
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', cancel);
  window.addEventListener('resize', resize);

  return () => {
    timer.kill();
    turning?.kill();
    seen.kill();
    box.removeEventListener('pointerdown', down);
    box.removeEventListener('pointermove', move);
    box.removeEventListener('pointerup', up);
    box.removeEventListener('pointercancel', cancel);
    window.removeEventListener('resize', resize);
    box.classList.remove('is-ring');
    gsap.set(parts, { clearProps: 'all' });
    floats.forEach((f) => (f.style.zIndex = ''));
    gsap.set(disc, { clearProps: 'all' });
  };
});

// Mouse-driven touches, only where there is a mouse
if (fine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Hero products move, turn and lift with the cursor, the nearest one most of all
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    const upright = matchMedia('(max-aspect-ratio: 1/1)');
    const settle = { duration: 0.9, ease: 'power3.out' };
    const items = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth ?? '0'),
      x: gsap.quickTo(el, 'x', settle),
      y: gsap.quickTo(el, 'y', settle),
      turnY: gsap.quickTo(el, 'rotationY', settle),
      turnX: gsap.quickTo(el, 'rotationX', settle),
      lift: gsap.quickTo(el, 'scale', settle),
    }));
    if (!upright.matches) gsap.set(items.map((i) => i.el), { transformPerspective: 900 });
    hero.addEventListener('pointermove', (event) => {
      if (upright.matches) return;
      const box = hero.getBoundingClientRect();
      const dx = (event.clientX - box.left) / box.width - 0.5;
      const dy = (event.clientY - box.top) / box.height - 0.5;
      items.forEach((item) => {
        const rect = item.el.getBoundingClientRect();
        if (!rect.width) return;
        const toX = event.clientX - (rect.left + rect.width / 2);
        const toY = event.clientY - (rect.top + rect.height / 2);
        const near = Math.max(0, 1 - Math.hypot(toX, toY) / (box.width * 0.24));
        item.x(dx * item.depth * 1.6 + toX * near * 0.12);
        item.y(dy * item.depth * 1.1 + toY * near * 0.12);
        item.turnY(dx * 26);
        item.turnX(-dy * 20);
        item.lift(1 + near * 0.1);
      });
    });
    hero.addEventListener('pointerleave', () => {
      if (upright.matches) return;
      items.forEach((item) => {
        item.x(0);
        item.y(0);
        item.turnY(0);
        item.turnX(0);
        item.lift(1);
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
