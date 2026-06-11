/* ═══════════════════════════════════════════════════════════
   向向Soya · Official — main.js
   surface: a pastel dream / beneath: she is watching
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  || new URLSearchParams(location.search).has('static');
const finePointer  = matchMedia('(hover:hover) and (pointer:fine)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);

let URA = false;            // current personality
let unlocked = false;       // has ura been reached once
let bellClicks = 0;

/* ───────────────────────── LOADER ───────────────────────── */
const loader = $('#loader');
{
  const imgs = ['standing','keyart','fullbody','desk','chibi','sheet','expr1','expr2','expr3','expr4']
    .map(n => `assets/img/${n}.webp`);
  const bar = $('#loaderBar'), pct = $('#loaderPct'), msg = $('#loaderMsg');
  const msgs = ['CONNECTING TIMELINE', 'CALIBRATING RIFT', 'SUMMONING SOYA'];
  let loaded = 0, mi = 0;
  const msgTimer = setInterval(() => { msg.textContent = msgs[++mi % msgs.length]; }, 700);
  const t0 = performance.now();
  const tick = () => {
    loaded++;
    const p = Math.round(loaded / imgs.length * 100);
    bar.style.width = p + '%';
    pct.textContent = p + '%';
    if (loaded >= imgs.length) {
      clearInterval(msgTimer);
      const wait = Math.max(0, 900 - (performance.now() - t0));
      setTimeout(() => { loader.classList.add('done'); enterHero(); }, wait);
    }
  };
  imgs.forEach(src => { const im = new Image(); im.onload = tick; im.onerror = tick; im.src = src; });
  // failsafe
  setTimeout(() => { if (!loader.classList.contains('done')) { clearInterval(msgTimer); loader.classList.add('done'); enterHero(); } }, 6000);
}

/* ─────────────────────── HERO ENTRANCE ──────────────────── */
let heroEntered = false;
function enterHero() {
  if (heroEntered) return;
  if (document.hidden && !reduceMotion) {
    // rAF is suspended in hidden tabs — play the entrance when actually seen
    document.addEventListener('visibilitychange', () => enterHero(), { once: true });
    return;
  }
  heroEntered = true;
  if (window.gsap && !reduceMotion) {
    gsap.timeline()
      .from('.hero-bigword span', { opacity: 0, scale: 1.12, duration: 1.4, ease: 'power3.out' }, 0)
      .from('#heroFigure', { y: 80, opacity: 0, duration: 1.2, ease: 'power3.out' }, .15)
      .from('.hero-copy > *', { y: 34, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out' }, .4)
      .from('.hero-rec, .hero-scroll', { opacity: 0, duration: .8 }, 1.1);
  }
}

/* ─────────────────────── NAV / MENU ─────────────────────── */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });

const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
menuBtn.addEventListener('click', () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

/* ─────────────────────── TIMECODES ──────────────────────── */
{
  const recT = $('#recTime'), vfT = $('#vfTime');
  const start = Date.now();
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    recT.textContent = `${pad(s / 3600 | 0)}:${pad((s / 60 | 0) % 60)}:${pad(s % 60)}`;
    const f = Math.floor((Date.now() - start) / 1000 * 24);
    vfT.textContent = `${pad(f / 86400 | 0)}:${pad((f / 1440 | 0) % 60)}:${pad((f / 24 | 0) % 60)}:${pad(f % 24)}`;
  }, 120);
}

/* ─────────────────── SCRAMBLE TEXT ENGINE ───────────────── */
const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01<>/\\▓▒░█♡✦';
function scrambleTo(el, target, dur = 700) {
  if (reduceMotion || document.hidden) { el.textContent = target; return; }
  const from = el.textContent;
  const len = Math.max(from.length, target.length);
  const t0 = performance.now();
  (function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    let out = '';
    for (let i = 0; i < len; i++) {
      const reveal = i / len < p * 1.4 - .2;
      out += reveal ? (target[i] || '') : (Math.random() < .7 ? GLYPHS[Math.random() * GLYPHS.length | 0] : (from[i] || ''));
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame); else el.textContent = target;
  })(t0);
}

/* corrupted stat — never settles */
{
  const el = $('#statFound');
  const corrupt = () => {
    const roll = Math.random();
    el.textContent = roll < .18 ? 'ERR_' : roll < .3 ? '∞-1' : String(rand(140, 9990) | 0);
  };
  corrupt();
  setInterval(() => { if (!document.hidden) scrambleTo(el, (Math.random() < .2 ? 'ERR_' : String(rand(140, 9990) | 0)), 420); }, 2600);
}

/* ───────────────────── SCROLL REVEALS ───────────────────── */
if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  $$('.reveal').forEach(el => {
    gsap.fromTo(el, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  $$('.scramble').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => scrambleTo(el, el.dataset[URA ? 'ura' : 'omote'] || el.textContent, 800)
    });
  });
  // hero figure drifts up slightly as you scroll away
  gsap.to('#heroFigure', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  // timeline nodes line draw feel: nothing extra needed
} else {
  document.body.classList.add('no-anim');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ─────────────────── HERO MOUSE PARALLAX ────────────────── */
if (finePointer && !reduceMotion) {
  const fig = $('#heroFigure'), word = $('.hero-bigword span'), glow = $('.hero-glow');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - .5);
    ty = (e.clientY / innerHeight - .5);
  }, { passive: true });
  (function loop() {
    cx = lerp(cx, tx, .06); cy = lerp(cy, ty, .06);
    fig.style.transform  = `translate(${cx * -16}px, ${cy * -10}px)`;
    word.style.transform = `translate(${cx * 26}px, calc(-6% + ${cy * 18}px))`;
    glow.style.transform = `translate(${cx * -30}px, ${cy * -20}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ──────────────────── CUSTOM CURSOR ─────────────────────── */
if (finePointer && !reduceMotion) {
  document.body.classList.add('has-cursor');
  const cur = $('#cursor');
  let mx = innerWidth / 2, my = innerHeight / 2, px = mx, py = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() {
    px = lerp(px, mx, .22); py = lerp(py, my, .22);
    cur.style.transform = `translate(${px}px, ${py}px)`;
    requestAnimationFrame(loop);
  })();
  addEventListener('mouseover', e => {
    cur.classList.toggle('hovering', !!e.target.closest('a,button,input,.g-item,.follow-chibi'));
  }, { passive: true });
}

/* ──────────────────── PARTICLE CANVAS ───────────────────── */
const fxCanvas = $('#fx');
if (!reduceMotion) {
  const ctx = fxCanvas.getContext('2d');
  let W, H, DPR;
  const resize = () => {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = fxCanvas.width = innerWidth * DPR;
    H = fxCanvas.height = innerHeight * DPR;
    fxCanvas.style.width = innerWidth + 'px';
    fxCanvas.style.height = innerHeight + 'px';
  };
  resize(); addEventListener('resize', resize);

  const COUNT = innerWidth < 700 ? 34 : 64;
  const OMOTE_COLORS = ['#f6cdda', '#bfe6e1', '#f3ddc0', '#fbe3ec', '#cfe9f5'];
  const URA_COLORS   = ['#ff2e55', '#c2183d', '#8e1430', '#ff7a96'];
  const parts = [];

  function spawn(p = {}) {
    p.x = rand(0, W); p.y = rand(-H * .1, H);
    p.vy = rand(.18, .65) * DPR; p.vx = rand(-.12, .12) * DPR;
    p.size = rand(3, 8) * DPR; p.rot = rand(0, Math.PI * 2);
    p.vr = rand(-.01, .01); p.sway = rand(0, Math.PI * 2);
    p.swayAmp = rand(.2, .9) * DPR; p.alpha = rand(.35, .85);
    p.type = Math.random() < .22 ? 'star' : 'petal';
    p.color = (URA ? URA_COLORS : OMOTE_COLORS)[Math.random() * (URA ? URA_COLORS : OMOTE_COLORS).length | 0];
    return p;
  }
  for (let i = 0; i < COUNT; i++) parts.push(spawn({}));

  let streak = null; // ura static streak
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.sway += .015; p.rot += p.vr;
      p.x += p.vx + Math.sin(p.sway) * p.swayAmp * .35;
      p.y += p.vy * (URA ? 1.8 : 1);
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) { spawn(p); p.y = -16; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * (URA ? .8 : 1);
      ctx.fillStyle = p.color;
      if (p.type === 'star') {
        const tw = .55 + .45 * Math.sin(p.sway * 2);
        ctx.globalAlpha *= tw;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.moveTo(0, 0); ctx.quadraticCurveTo(p.size * .22, p.size * .22, 0, p.size);
          ctx.quadraticCurveTo(-p.size * .22, p.size * .22, 0, 0);
        }
        ctx.fill();
      } else if (URA) { // crimson shard / heart
        if (p.size > 5.4 * DPR) { // heart
          const s = p.size * .5;
          ctx.beginPath();
          ctx.moveTo(0, s * .8);
          ctx.bezierCurveTo(-s * 1.4, -s * .3, -s * .5, -s * 1.2, 0, -s * .35);
          ctx.bezierCurveTo(s * .5, -s * 1.2, s * 1.4, -s * .3, 0, s * .8);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size * .12, -p.size * .8, p.size * .24, p.size * 1.6);
        }
      } else { // pastel petal
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * .42, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    // occasional horizontal static streak in ura
    if (URA) {
      if (!streak && Math.random() < .012) streak = { y: rand(0, H), life: rand(4, 10) | 0, h: rand(1, 3) * DPR };
      if (streak) {
        ctx.globalAlpha = .14;
        ctx.fillStyle = '#ff2e55';
        ctx.fillRect(0, streak.y, W, streak.h);
        ctx.globalAlpha = .06; ctx.fillStyle = '#2ee6d6';
        ctx.fillRect(0, streak.y + streak.h + 2 * DPR, W, streak.h * .6);
        ctx.globalAlpha = 1;
        if (--streak.life <= 0) streak = null;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  // recolor existing particles on theme change
  addEventListener('soya:theme', () => parts.forEach(p => {
    p.color = (URA ? URA_COLORS : OMOTE_COLORS)[Math.random() * (URA ? URA_COLORS : OMOTE_COLORS).length | 0];
  }));
}

/* ────────────────────── WEB AUDIO ───────────────────────── */
const Audio8 = (() => {
  let ac = null, master = null, delaySend = null, playing = false;
  let schedTimer = null, nextIdx = 0, loopStart = 0, hbTimer = null;

  // music-box melody: [eighth-beat, midi] — wistful loop
  const MELODY = [
    [0,76],[1,79],[2,84],[3,83],[4,79],[5,76],
    [6,81],[7,84],[8,88],[9,86],[10,83],[11,79],
    [12,76],[13,79],[14,84],[15,88],[16,91],[17,88],
    [18,86],[19,83],[20,86],[21,84],[22,79],[23,76]
  ];
  const BASS = [[0,48],[6,45],[12,41],[18,43]];
  const LOOP_LEN = 24;

  const toMinor = m => ({76:75, 88:87, 81:80, 83:82, 91:90, 75:75}[m] ?? m);
  const f = m => 440 * Math.pow(2, (m - 69) / 12);

  function ensureCtx() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .16;
    master.connect(ac.destination);
    // shimmer delay
    delaySend = ac.createGain(); delaySend.gain.value = .22;
    const d = ac.createDelay(1); d.delayTime.value = .36;
    const fb = ac.createGain(); fb.gain.value = .26;
    const wet = ac.createGain(); wet.gain.value = .5;
    delaySend.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(master);
  }

  function pluck(midi, t, vel = 1, dark = false) {
    const freq = f(dark ? toMinor(midi) : midi);
    const detune = dark ? rand(-12, 12) : rand(-3, 3);
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
    o1.type = 'sine'; o1.frequency.value = freq; o1.detune.value = detune;
    o2.type = 'sine'; o2.frequency.value = freq * 4; o2.detune.value = detune;
    const g2 = ac.createGain(); g2.gain.value = .12;
    o2.connect(g2); g2.connect(g); o1.connect(g);
    g.connect(master); g.connect(delaySend);
    const peak = .5 * vel;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + .008);
    g.gain.exponentialRampToValueAtTime(.001, t + (dark ? 2.4 : 1.6));
    o1.start(t); o2.start(t); o1.stop(t + 2.6); o2.stop(t + 2.6);
  }

  function schedule() {
    const dark = URA;
    const stepDur = dark ? .42 : .33;
    while (true) {
      const beat = nextIdx % LOOP_LEN;
      const loopNo = Math.floor(nextIdx / LOOP_LEN);
      const t = loopStart + (loopNo * LOOP_LEN + beat) * stepDur;
      if (t > ac.currentTime + .6) break;
      for (const [b, m] of MELODY) if (b === beat && !(dark && Math.random() < .12)) pluck(m, t, .9, dark);
      for (const [b, m] of BASS)   if (b === beat) pluck(m, t, .5, dark);
      nextIdx++;
    }
  }

  function heartbeat(t) {
    const thump = (tt, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(58, tt);
      o.frequency.exponentialRampToValueAtTime(36, tt + .14);
      g.gain.setValueAtTime(0, tt);
      g.gain.linearRampToValueAtTime(vol, tt + .015);
      g.gain.exponentialRampToValueAtTime(.001, tt + .22);
      o.connect(g); g.connect(master);
      o.start(tt); o.stop(tt + .3);
    };
    thump(t, .9); thump(t + .19, .55);
  }

  return {
    toggle() {
      ensureCtx();
      if (ac.state === 'suspended') ac.resume();
      playing = !playing;
      if (playing) {
        nextIdx = 0; loopStart = ac.currentTime + .1;
        schedule();
        schedTimer = setInterval(schedule, 180);
        if (URA) this.startHeart();
      } else {
        clearInterval(schedTimer);
        this.stopHeart();
      }
      return playing;
    },
    onTheme() { // restart loop in new mode
      if (!playing) { if (URA && ac) this.beat(); return; }
      clearInterval(schedTimer);
      nextIdx = 0; loopStart = ac.currentTime + .25;
      schedule();
      schedTimer = setInterval(schedule, 180);
      if (URA) this.startHeart(); else this.stopHeart();
    },
    startHeart() {
      this.stopHeart();
      hbTimer = setInterval(() => { if (!document.hidden) heartbeat(ac.currentTime + .05); }, 1300);
    },
    stopHeart() { if (hbTimer) { clearInterval(hbTimer); hbTimer = null; } },
    beat() { // single heartbeat (gesture-safe)
      ensureCtx(); if (ac.state === 'suspended') ac.resume();
      heartbeat(ac.currentTime + .03);
    },
    ding(n = 1) { // bell chime
      ensureCtx(); if (ac.state === 'suspended') ac.resume();
      for (let i = 0; i < n; i++) {
        const t = ac.currentTime + .03 + i * .28;
        [1318.5, 1318.5 * 2.76].forEach((fr, j) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = 'sine'; o.frequency.value = fr * (URA ? .94 : 1);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(j ? .12 : .3, t + .005);
          g.gain.exponentialRampToValueAtTime(.001, t + 1.1);
          o.connect(g); g.connect(master); g.connect(delaySend);
          o.start(t); o.stop(t + 1.2);
        });
      }
    },
    get playing() { return playing; }
  };
})();

const audioBtn = $('#audioBtn');
audioBtn.addEventListener('click', () => {
  const on = Audio8.toggle();
  audioBtn.classList.toggle('on', on);
  audioBtn.setAttribute('aria-pressed', String(on));
});

/* ───────────────── THEME (OMOTE ⇄ URA) ──────────────────── */
const whisper = $('#whisper');
let whisperT = null;
function say(text, ms = 2600) {
  whisper.textContent = text;
  whisper.classList.add('show');
  clearTimeout(whisperT);
  whisperT = setTimeout(() => whisper.classList.remove('show'), ms);
}

function flash(strong = false) {
  if (reduceMotion || document.hidden) return;
  const fl = $('#flash');
  fl.style.transition = 'none';
  fl.style.opacity = strong ? .9 : .35;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fl.style.transition = `opacity ${strong ? .9 : .45}s ease`;
    fl.style.opacity = 0;
  }));
}

function swapTexts() {
  const key = URA ? 'ura' : 'omote';
  $$('[data-omote]').forEach(el => {
    const txt = el.dataset[key];
    if (txt == null) return;
    if (el.classList.contains('scramble') || el.classList.contains('hero-sub')) scrambleTo(el, txt, 900);
    else el.textContent = txt;
  });
}

function setTheme(ura) {
  if (URA === ura) return;
  URA = ura; if (ura) unlocked = true;
  flash(true);
  document.body.classList.add('theme-anim');
  setTimeout(() => document.body.classList.remove('theme-anim'), 1200);
  document.body.classList.toggle('ura', ura);
  swapTexts();
  // truth section + nav
  $('#truth').hidden = !ura;
  $$('.nav-truth').forEach(a => a.hidden = !ura);
  // favicon / title / theme-color
  $('#favicon').href = ura ? 'assets/img/favicon-ura.png' : 'assets/img/favicon.png';
  $('#metaTheme').content = ura ? '#0d0609' : '#fdf3ee';
  document.title = ura ? '向向Soya♡ — 找到你了' : '向向Soya · Official — 穿梭时间线的布偶猫女仆';
  dispatchEvent(new Event('soya:theme'));
  Audio8.onTheme();
  if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 100);
  say(ura ? '……嘻嘻。这边的我，你也会喜欢的吧？♡' : '……下次见♡', 3200);
}

/* bell ritual */
const bellBtn = $('#bellBtn');
bellBtn.addEventListener('click', () => {
  bellBtn.classList.remove('rung'); void bellBtn.offsetWidth; bellBtn.classList.add('rung');
  if (URA) { Audio8.ding(1); setTheme(false); bellClicks = 0; return; }
  if (unlocked) { Audio8.ding(2); setTheme(true); return; }
  bellClicks++;
  if (bellClicks === 1) { Audio8.ding(1); flash(false); say('……？（铃铛轻轻颤动了一下）'); }
  else if (bellClicks === 2) { Audio8.ding(2); Audio8.beat(); flash(false); say('……听见了。再摇一次的话——就回不去了哦？'); }
  else { Audio8.ding(3); setTheme(true); }
});

/* konami + typed name triggers */
{
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0, typed = '';
  addEventListener('keydown', e => {
    if (e.target.matches('input,textarea')) return;
    // konami
    kIdx = (e.key === KONAMI[kIdx]) ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) { kIdx = 0; setTheme(!URA); return; }
    // typing her name
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === 'soya') { typed = ''; setTheme(!URA); }
    // lightbox keys
    if (!lightbox.hidden) {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') stepLB(1);
      if (e.key === 'ArrowLeft') stepLB(-1);
    }
  });
}

/* console egg */
console.log(
  '%c♡ 向向Soya ♡%c\n' +
  '  /\\_/\\   在所有时间线里，找到你。\n' +
  ' ( o.o )  every timeline leads to you.\n' +
  '  > ^ <   hint: 摇铃三次。或者，输入 soya()',
  'font-size:18px;color:#e98caf;font-weight:bold', 'color:#79c4bd'
);
window.soya = () => { setTheme(!URA); return URA ? '……找到你了♡' : '……梦，还在继续。'; };

/* ───────────────────── TRUE NAME FORM ───────────────────── */
$('#nameForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#trueName').value.trim();
  if (!name) return;
  const reply = $('#nameReply');
  reply.textContent = '';
  scrambleTo(reply, `「${name}」…………找到你了。`, 1100);
  Audio8.beat();
  setTimeout(() => Audio8.beat(), 800);
  setTimeout(() => {
    reply.textContent = `「${name}」…………找到你了。这一次，绝对不会再放开了哦。♡`;
  }, 2100);
});

/* ─────────────────────── TILT CARDS ─────────────────────── */
if (finePointer && !reduceMotion) {
  $$('.tilt').forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-4px)`;
        raf = null;
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ─────────────────────── LIGHTBOX ───────────────────────── */
const lightbox = $('#lightbox');
const lbImg = $('#lightbox img'), lbCap = $('#lightbox figcaption');
const gItems = $$('.g-item');
let lbIdx = 0;
function openLB(i) {
  lbIdx = i;
  const it = gItems[i], img = $('img', it);
  lbImg.src = img.src; lbImg.alt = img.alt;
  lbCap.textContent = it.dataset.cap || '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLB() { lightbox.hidden = true; document.body.style.overflow = ''; }
function stepLB(d) { openLB((lbIdx + d + gItems.length) % gItems.length); }
gItems.forEach((it, i) => it.addEventListener('click', () => openLB(i)));
$('.lb-close').addEventListener('click', closeLB);
$('.lb-prev').addEventListener('click', e => { e.stopPropagation(); stepLB(-1); });
$('.lb-next').addEventListener('click', e => { e.stopPropagation(); stepLB(1); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });

/* ─────────────────────── CHIBI POKE ─────────────────────── */
{
  const chibi = $('#chibiPoke');
  let pokes = 0;
  const lines = ['喵？', '呜喵！', '再、再戳的话……', '喵呜……♡', '好痒啦！'];
  chibi.addEventListener('click', e => {
    pokes++;
    Audio8.ding(1);
    const heart = document.createElement('span');
    heart.textContent = ['♡', '✦', '♪'][Math.random() * 3 | 0];
    Object.assign(heart.style, {
      position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px', zIndex: 180,
      color: 'var(--pink)', fontSize: '20px', pointerEvents: 'none',
      transition: 'transform 1s ease, opacity 1s ease', transform: 'translate(-50%,-50%)'
    });
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translate(${rand(-40, 40)}px, -90px) rotate(${rand(-30, 30)}deg)`;
      heart.style.opacity = 0;
    });
    setTimeout(() => heart.remove(), 1100);
    if (pokes === 8) say('再戳的话……另一个我，会醒过来哦？♡', 3000);
    else say(lines[Math.random() * lines.length | 0], 1500);
  });
}

})();
