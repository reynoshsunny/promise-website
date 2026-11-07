import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
if (reduce) root.classList.add('no-motion');

let lenis = null;
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- Image fallback: if a photo fails, the frame shows built-in gold artwork ---------- */
function initImages() {
  $$('.frame img').forEach((img) => {
    const frame = img.closest('.frame');
    const fail = () => frame.classList.add('missing');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc !== '') fail();
  });
}

/* ---------- Smooth scroll ---------- */
function initScroll() {
  if (!reduce && fine) {
    // Smooth-scroll only with a mouse/trackpad; touch devices keep native scrolling (faster, more natural).
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -50, duration: 1.7 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------- Nav, menu, progress ---------- */
const nav = $('.nav');
const burger = $('.burger');
const menu = $('.menu');
function closeMenu() {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('inert', '');
  lenis && lenis.start();
}
function initNav() {
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  const bar = $('.progress i');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle('solid', y > 40);
      nav.classList.toggle('hide', self.direction === 1 && y > 600 && !menu.classList.contains('open'));
      bar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

/* ---------- Preloader (CSS-driven; JS only cleans up) ---------- */
function initPreloader() {
  const pre = $('.preloader');
  if (!pre) return;
  setTimeout(() => { pre.remove(); ScrollTrigger.refresh(); }, reduce ? 0 : 2300);
}

/* ---------- Hero: dust canvas, gem, parallax ---------- */
function initHero() {
  const hero = $('.hero');
  const cv = $('#dust');
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], visible = true;
  const mouse = { x: -999, y: -999 };

  function size() {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = clamp(Math.round((w * h) / 22000), 18, 70);
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * 0.25 + 0.05), vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.008,
    }));
  }
  size();
  window.addEventListener('resize', size);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => (mouse.x = mouse.y = -999));

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sg = sprite.getContext('2d');
  const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,236,170,1)');
  grad.addColorStop(0.4, 'rgba(240,200,110,0.45)');
  grad.addColorStop(1, 'rgba(230,185,88,0)');
  sg.fillStyle = grad; sg.fillRect(0, 0, 32, 32);

  function draw() {
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.a += p.s;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { const f = (1 - d2 / 14000) * 1.6, d = Math.sqrt(d2 + 1); p.x += (dx / d) * f; p.y += (dy / d) * f; }
      if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
      if (p.x < -5) p.x = w + 5;
      else if (p.x > w + 5) p.x = -5;
      ctx.globalAlpha = 0.25 + Math.sin(p.a) * 0.25 + 0.25;
      const sz = p.r * 8;
      ctx.drawImage(sprite, p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }
  let frame = 0;
  if (!reduce) gsap.ticker.add(() => { if (++frame % 2 === 0) draw(); }); else draw();

  if (reduce) return;
  // gem facets twinkle + light sweep
  gsap.to('.facet', {
    opacity: () => gsap.utils.random(0.55, 1), duration: () => gsap.utils.random(0.9, 1.9),
    repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.18, from: 'random' },
  });
  gsap.set('.sweep', { opacity: 0.55, attr: { x: -150 } });
  gsap.timeline({ repeat: -1, repeatDelay: 2.4 }).to('.sweep', { attr: { x: 480 }, duration: 1.5, ease: 'power2.inOut' }).set('.sweep', { attr: { x: -150 } });

  // pointer parallax (desktop only; uses CSS `translate`, so it never fights the CSS keyframe animations)
  const layers = fine ? $$('.hero-art [data-depth]').map((el) => ({ el, d: parseFloat(el.dataset.depth), x: 0, y: 0 })) : [];
  let tx = 0, ty = 0;
  hero.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
  });
  hero.addEventListener('pointerleave', () => (tx = ty = 0));
  if (layers.length) gsap.ticker.add(() => {
    if (!visible) return;
    for (const l of layers) {
      l.x = lerp(l.x, tx * l.d, 0.06); l.y = lerp(l.y, ty * l.d, 0.06);
      l.el.style.translate = `${l.x.toFixed(2)}px ${l.y.toFixed(2)}px`;
    }
  });
  // headline drifts away on scroll
  gsap.to('.hero-copy', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-art', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------- Generic scroll reveals + parallax ---------- */
function initReveals() {
  if (reduce) return;
  $$('[data-reveal]').forEach((el) => {
    const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
    const delay = (sibs.indexOf(el) % 4) * 0.08;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, delay, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('.frame').forEach((f) => {
    gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: f, start: 'top 90%', once: true },
    });
    const img = $('img', f);
    if (img) gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------- Craftsmanship steps + spine ---------- */
function initCraft() {
  const steps = $$('.step');
  const spine = $('.spine');
  const wrap = $('.steps');
  if (!steps.length) return;
  function placeSpine() {
    if (!spine || !wrap) return;
    const last = steps[steps.length - 1];
    spine.style.height = Math.max(0, last.offsetTop - steps[0].offsetTop) + 'px';
  }
  placeSpine();
  window.addEventListener('resize', placeSpine);
  ScrollTrigger.addEventListener('refreshInit', placeSpine);
  if (reduce) { steps.forEach((s) => s.classList.add('on')); $('.spine i') && ($('.spine i').style.transform = 'scaleY(1)'); return; }
  steps.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 38%', toggleClass: { targets: s, className: 'on' } }));
  gsap.to('.spine i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top 62%', end: 'bottom 55%', scrub: true } });
}

/* ---------- Statement: words light up with scroll ---------- */
function initStatement() {
  const p = $('#statement');
  if (!p) return;
  function split(node) {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  }
  split(p);
  if (reduce) return;
  gsap.fromTo($$('.w', p), { opacity: 0.5 }, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 50%', scrub: true } });
}

/* ---------- Laser engraving demo ---------- */
function initEngrave() {
  const stage = $('.plate-stage');
  if (!stage) return;
  const plate = $('.plate', stage), textEl = $('.plate-text', stage), head = $('.laser-head', stage);
  const beam = $('.beam', stage), hit = $('.hit', stage), cv = $('.sparks', stage), ctx = cv.getContext('2d');
  const input = $('#engrave-text'), count = $('#ecount'), go = $('#engrave-go');
  const ENG_COLOR = 'rgba(78, 45, 6, 0.9)';
  const ENG_SHADOW = '0 1px 0 rgba(255,240,180,0.8), 0 -1px 0 rgba(60,30,0,0.45)';
  const BURN_SHADOW = '0 0 18px #ffd36b, 0 0 4px #fff';
  let tl = null, sparks = [], emitting = false, bx = 0, by = 0, ticking = false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas() {
    cv.width = stage.clientWidth * dpr; cv.height = stage.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function fit() {
    textEl.style.fontSize = '100px';
    const tw = textEl.getBoundingClientRect().width;
    const round = stage.dataset.shape === 'round';
    const targetW = plate.clientWidth * (round ? 0.66 : 0.8);
    let s = (100 * targetW) / Math.max(tw, 1);
    s = Math.min(s, plate.clientHeight * (round ? 0.3 : 0.44));
    textEl.style.fontSize = Math.max(16, s) + 'px';
  }
  function setText() {
    const v = (input.value.trim() || 'Promise').slice(0, 18);
    textEl.textContent = v;
    count.textContent = input.value.length;
    fit();
  }
  function tick(_, dt) {
    const step = Math.min(dt, 50) / 16.67;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (emitting) {
      for (let i = 0; i < 3; i++) {
        sparks.push({ x: bx + gsap.utils.random(-3, 3), y: by + gsap.utils.random(-5, 5), vx: gsap.utils.random(-3, 3), vy: gsap.utils.random(-5, -0.5), life: 1, r: gsap.utils.random(0.8, 2.2) });
      }
    }
    sparks = sparks.filter((p) => p.life > 0);
    for (const p of sparks) {
      p.x += p.vx * step; p.y += p.vy * step; p.vy += 0.22 * step; p.life -= 0.026 * step;
      ctx.fillStyle = `rgba(255,${Math.round(150 + p.life * 90)},${Math.round(40 + p.life * 100)},${Math.max(p.life, 0)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!emitting && !sparks.length) { gsap.ticker.remove(tick); ticking = false; }
  }
  function startSparks() { if (!ticking) { ticking = true; gsap.ticker.add(tick); } }

  function showFinal() {
    tl && tl.kill();
    emitting = false;
    gsap.set([head, beam, hit], { opacity: 0 });
    gsap.set(textEl, { clipPath: 'none', color: ENG_COLOR, textShadow: ENG_SHADOW });
  }

  function engrave() {
    setText();
    showFinal();
    if (reduce) return;
    sizeCanvas();
    const sr = stage.getBoundingClientRect(), tr = textEl.getBoundingClientRect();
    const tLeft = tr.left - sr.left, x0 = tLeft - 4, x1 = tr.right - sr.left + 4;
    by = tr.top - sr.top + tr.height / 2;
    const beamTop = head.offsetTop + head.offsetHeight - 2;
    gsap.set(beam, { height: Math.max(10, by - beamTop), top: beamTop });
    gsap.set(hit, { x: x0, y: by });
    gsap.set(textEl, { clipPath: 'inset(-30% 100% -30% 0%)', color: '#fff3b8', textShadow: BURN_SHADOW });
    const prog = { v: 0 };
    const dur = 1.3 + textEl.textContent.length * 0.13;
    tl = gsap.timeline();
    tl.set(head, { x: sr.width / 2 - 31, opacity: 0 })
      .to(head, { opacity: 1, duration: 0.3 })
      .to(head, { x: x0 - 31, duration: 0.6, ease: 'power3.inOut' })
      .set([beam, hit], { opacity: 1 })
      .add(() => { emitting = true; startSparks(); })
      .to(prog, {
        v: 1, duration: dur, ease: 'power1.inOut',
        onUpdate() {
          bx = x0 + prog.v * (x1 - x0);
          const frac = clamp((bx - tLeft) / tr.width, 0, 1);
          gsap.set(textEl, { clipPath: `inset(-30% ${(1 - frac) * 100}% -30% 0%)` });
          gsap.set(head, { x: bx - 31 });
          gsap.set(beam, { x: bx });
          gsap.set(hit, { x: bx, scale: 0.8 + Math.random() * 0.5 });
        },
      })
      .add(() => { emitting = false; })
      .to([beam, hit], { opacity: 0, duration: 0.25 })
      .to(head, { x: sr.width / 2 - 31, opacity: 0, duration: 0.6, ease: 'power2.inOut' })
      .to(textEl, { color: ENG_COLOR, textShadow: ENG_SHADOW, duration: 1.3, ease: 'power2.out' }, '<0.1')
      .set(textEl, { clipPath: 'none' });
  }

  input.addEventListener('input', () => { showFinal(); setText(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); engrave(); } });
  go.addEventListener('click', engrave);
  $$('button[data-style]').forEach((b) => b.addEventListener('click', () => {
    $$('button[data-style]').forEach((x) => x.classList.toggle('on', x === b));
    plate.dataset.style = b.dataset.style;
    if (b.dataset.style === 'arabic' && /^[\x00-\x7F]*$/.test(input.value) && /^(promise)?$/i.test(input.value.trim())) {
      input.value = 'وعد'; // sample Arabic word ("promise") so the style is visible immediately
    }
    engrave();
  }));
  $$('button[data-shape]').forEach((b) => b.addEventListener('click', () => {
    $$('button[data-shape]').forEach((x) => x.classList.toggle('on', x === b));
    stage.dataset.shape = b.dataset.shape;
    showFinal();
    setTimeout(engrave, 650);
  }));
  window.addEventListener('resize', () => { showFinal(); fit(); });
  setText();
  document.fonts && document.fonts.ready.then(setText);
  if (reduce) { showFinal(); return; }
  gsap.set(textEl, { clipPath: 'inset(-30% 100% -30% 0%)' });
  let ran = false;
  ScrollTrigger.create({
    trigger: stage, start: 'top 70%', end: 'bottom top',
    onEnter: () => { if (!ran) { ran = true; engrave(); } },
    onRefresh: (self) => { if (!ran && self.scroll() > self.end) { ran = true; showFinal(); } },
  });
}

/* ---------- Purity rings ---------- */
function initPurity() {
  $$('.ring').forEach((ring) => {
    const fg = $('.fg', ring), num = $('[data-count]', ring);
    const target = parseFloat(ring.dataset.p), dec = parseInt(num.dataset.dec || '0', 10), C = 339.3;
    const set = (v) => { num.textContent = v.toFixed(dec); fg.style.strokeDashoffset = C * (1 - v / 100); };
    if (reduce) return set(target);
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: ring, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 2.4, ease: 'power3.out', onUpdate: () => set(o.v) }) });
  });
}

/* ---------- Sell / Buy tabs + calculator ---------- */
function initTrade() {
  const tabs = $$('.tabs button'), ink = $('.tab-ink'), panes = $$('.pane');
  if (!tabs.length) return;
  const wEl = $('#c-weight'), kEl = $('#c-karat'), rEl = $('#c-rate'), out = $('#c-out'), label = $('#c-label'), note = $('#c-note'), cta = $('#c-cta');
  const wa = 'https://wa.me/' + ($('#msg') ? $('#msg').dataset.wa : '');
  let mode = 'sell';
  const text = {
    sell: ['Estimated sell value', 'Indicative only. Final value depends on testing, weight and the live rate in store.', 'Get today\'s rate on WhatsApp'],
    buy: ['Estimated gold value', 'Gold value only — making charges, stones and engraving are quoted separately in store.', 'Ask for a price on WhatsApp'],
  };
  function moveInk() {
    const b = $('.tabs button.on');
    ink.style.width = b.offsetWidth + 'px';
    ink.style.transform = `translateX(${b.offsetLeft - 5}px)`;
  }
  function calc() {
    const w = parseFloat(wEl.value), r = parseFloat(rEl.value), p = parseFloat(kEl.value);
    const ok = w > 0 && r > 0;
    out.textContent = ok ? (w * r * p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
    const k = kEl.options[kEl.selectedIndex].text.split(' ')[0];
    const msg = `Hello Promise Gold & Diamonds, I would like to ${mode} gold` + (w > 0 ? ` (${w} g, ${k})` : '') + '. Could you share today\'s rate?';
    cta.href = wa + '?text=' + encodeURIComponent(msg);
  }
  function setMode(m) {
    mode = m;
    tabs.forEach((t) => { const on = t.dataset.mode === m; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    panes.forEach((p) => p.classList.toggle('on', p.dataset.pane === m));
    label.textContent = text[m][0]; note.textContent = text[m][1]; cta.textContent = text[m][2];
    moveInk(); calc();
  }
  tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
  let saved = '';
  try { saved = localStorage.getItem('pgd_rate') || ''; } catch (e) { /* storage unavailable */ }
  const preset = $('.calc').dataset.rate || '';
  rEl.value = saved || preset;
  [wEl, kEl, rEl].forEach((el) => el.addEventListener('input', () => {
    if (el === rEl) { try { localStorage.setItem('pgd_rate', rEl.value); } catch (e) { /* ignore */ } }
    calc();
  }));
  window.addEventListener('resize', moveInk);
  document.fonts && document.fonts.ready.then(moveInk);
  moveInk(); calc();
}

/* ---------- Micro-interactions ---------- */
function initMicro() {
  $$('.spot').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));
  if (reduce || !fine) return;
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.35, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
  });
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * 9, rotateX: -py * 9, transformPerspective: 900, duration: 0.6, ease: 'power2.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' }));
  });
  const cur = $('.cursor');
  const qx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cur.classList.add('on'); qx(e.clientX); qy(e.clientY); });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
  document.addEventListener('pointerover', (e) => cur.classList.toggle('big', !!e.target.closest('a, button, input, select, textarea, .svc, .pcard')));
}

/* ---------- Contact form -> WhatsApp ---------- */
function initForm() {
  const f = $('#msg');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const body = `Hello Promise Gold & Diamonds,\nI'm ${d.get('name')}. I'm interested in: ${d.get('topic')}.` + (d.get('note') ? `\n${d.get('note')}` : '');
    window.open('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
  });
}

/* ---------- Boot ---------- */
initImages();
initScroll();
initNav();
initPreloader();
initHero();
// Everything below the fold is set up when the browser is idle -> faster first paint & lower blocking time.
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 300));
const lateInit = () => {
  initReveals();
  initCraft();
  initStatement();
  initEngrave();
  initPurity();
  initTrade();
  initMicro();
  initForm();
  ScrollTrigger.refresh();
};
if (document.readyState === 'complete') idle(lateInit);
else window.addEventListener('load', () => idle(lateInit), { once: true });
