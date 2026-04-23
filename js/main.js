'use strict';

/* ── 1. CURSOR ────────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let cx = 0, cy = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
  }, { passive: true });
  (function animRing() {
    rx += (cx - rx) * 0.15; ry += (cy - ry) * 0.15;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
})();

/* ── 2. NAVBAR ────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }
})();

/* ── 3. SCROLL REVEAL ─────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (i * 0.05) + 's';
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── 4. MATRIX RAIN ───────────────────────────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>{}[]()=+*&%$#@!?/\\|^~`;:';
  const FS = 14;
  let cols = 0, drops = [];
  function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const n = Math.floor(canvas.width / FS);
    drops = Array.from({ length: n }, (_, i) => drops[i] ?? Math.random() * -(canvas.height / FS));
    cols = n;
  }
  function draw() {
    ctx.fillStyle = 'rgba(5,5,8,0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FS}px 'Share Tech Mono', monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x = i * FS, y = drops[i] * FS;
      ctx.fillStyle = 'rgba(212,168,255,0.75)'; ctx.fillText(ch, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5;
    }
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  let last = 0;
  (function loop(ts) { if (ts - last >= 33) { draw(); last = ts; } requestAnimationFrame(loop); })();
})();

/* ── 5. HUD TECH UI ───────────────────────────────────────────
 * Estilo: wallpaper tech — anéis segmentados com entalhes,
 * rede de nós flutuantes, arcos de energia, scan line,
 * ticker marks, core pulsante, readouts agressivos.
 * Paleta: roxo #b347ff, lilás #d4a8ff, pink #ff006e.
 ──────────────────────────────────────────────────────────── */
(function initHUD() {

  /* Inicia apenas após o layout estar completo */
  function start() {
    if (window.matchMedia('(max-width: 900px)').matches) return;

    const canvas = document.getElementById('hud-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* Lê o tamanho real do container após layout completo */
    const parent = canvas.parentElement;
    const pW = parent.offsetWidth  || 500;
    const pH = parent.offsetHeight || 500;
    /* Canvas quadrado = o menor lado do container (com margem) */
    const S = Math.round(Math.min(pW, pH) * 0.88);
    canvas.width  = S;
    canvas.height = S;
    /* CSS: exibir no tamanho calculado */
    canvas.style.width  = S + 'px';
    canvas.style.height = S + 'px';

    const cx = S / 2;
    const cy = S / 2;
    const R  = S * 0.42;   // raio base ~ 201px

    /* Paleta */
    const P  = '#b347ff';
    const L  = '#d4a8ff';
    const PK = '#ff006e';

    /* ── Readouts ────────────────────────────────────────── */
    const LABELS = ['SYS','CPU','MEM','NET','SEC','API','GPU','DSK'];
    let vals = [];
    function refreshVals() {
      vals = [
        'ONLINE', Math.floor(Math.random()*60+10)+'%',
        Math.floor(Math.random()*512+64)+'M',  Math.floor(Math.random()*40+2)+'ms',
        'LV.'+(7+Math.floor(Math.random()*3)), Math.floor(Math.random()*999+100)+'/s',
        Math.floor(Math.random()*80+10)+'%',   Math.floor(Math.random()*80+20)+'%',
      ];
    }
    refreshVals();
    setInterval(refreshVals, 900);

    /* ── Partículas flutuantes (dentro do canvas S×S) ────── */
    const PTOTAL = 60;
    const pts = Array.from({ length: PTOTAL }, () => ({
      x:  Math.random() * S,
      y:  Math.random() * S,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.4,
    }));

    function updateParticles() {
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > S) p.vx *= -1;
        if (p.y < 0 || p.y > S) p.vy *= -1;
      });
    }

    /* Apenas partículas dentro do círculo R */
    function inCircle(p) {
      return Math.hypot(p.x - cx, p.y - cy) < R * 1.01;
    }

    function drawNodeNetwork() {
      const maxDist = R * 0.58;
      for (let i = 0; i < PTOTAL; i++) {
        if (!inCircle(pts[i])) continue;
        for (let j = i + 1; j < PTOTAL; j++) {
          if (!inCircle(pts[j])) continue;
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d > maxDist) continue;
          ctx.save();
          ctx.globalAlpha = (1 - d / maxDist) * 0.22;
          ctx.strokeStyle = P;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
      pts.forEach(p => {
        if (!inCircle(p)) return;
        ctx.save();
        ctx.globalAlpha  = 0.55;
        ctx.fillStyle    = Math.random() > 0.98 ? PK : P;
        ctx.shadowColor  = P;
        ctx.shadowBlur   = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    /* ── Anéis segmentados com ticker marks ──────────────── */
    const RINGS = [
      { r: 0.95, spd:  0.003, segs: 28, gap: 0.08, lw: 1.5, col: 'rgba(179,71,255,0.55)', ticks: 112 },
      { r: 0.78, spd: -0.006, segs: 18, gap: 0.11, lw: 1.0, col: 'rgba(179,71,255,0.38)', ticks:  72 },
      { r: 0.62, spd:  0.010, segs: 14, gap: 0.12, lw: 0.9, col: 'rgba(212,168,255,0.42)', ticks:   0 },
      { r: 0.45, spd: -0.018, segs:  9, gap: 0.16, lw: 0.8, col: 'rgba(179,71,255,0.48)', ticks:  36 },
      { r: 0.29, spd:  0.030, segs:  6, gap: 0.20, lw: 0.7, col: 'rgba(212,168,255,0.55)', ticks:   0 },
    ];

    function drawSegmentedRings(t) {
      RINGS.forEach(ring => {
        const rr   = R * ring.r;
        const rot  = ring.spd * t * 0.001;
        const each = (Math.PI * 2) / ring.segs;

        ctx.save();
        ctx.strokeStyle = ring.col;
        ctx.lineWidth   = ring.lw;
        for (let i = 0; i < ring.segs; i++) {
          const start = rot + i * each;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, start, start + each - ring.gap);
          ctx.stroke();
        }

        /* Ticker marks */
        if (ring.ticks > 0) {
          ctx.lineWidth   = 0.7;
          for (let i = 0; i < ring.ticks; i++) {
            const a  = rot + (i / ring.ticks) * Math.PI * 2;
            const r1 = rr - 5;
            const r2 = rr + 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a)*r1, cy + Math.sin(a)*r1);
            ctx.lineTo(cx + Math.cos(a)*r2, cy + Math.sin(a)*r2);
            ctx.stroke();
          }
        }
        ctx.restore();
      });
    }

    /* ── Arcos de energia (brilhantes, rápidos) ──────────── */
    const ARCS = [
      { r: 0.95, spd:  0.055, span: 0.40, col: P,  lw: 3.0, phase: 0      },
      { r: 0.78, spd: -0.038, span: 0.22, col: L,  lw: 2.2, phase: Math.PI },
      { r: 0.62, spd:  0.085, span: 0.16, col: PK, lw: 1.8, phase: 1.4    },
    ];

    function drawEnergyArcs(t) {
      ARCS.forEach(arc => {
        const a  = arc.phase + arc.spd * t * 0.001;
        const rr = R * arc.r;
        ctx.save();
        ctx.strokeStyle = arc.col;
        ctx.lineWidth   = arc.lw;
        ctx.shadowColor = arc.col;
        ctx.shadowBlur  = 12;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, a, a + arc.span);
        ctx.stroke();
        ctx.restore();
      });
    }

    /* ── Scan line horizontal ─────────────────────────────── */
    let scanY = -R;
    function drawScanLine() {
      scanY += 0.85;
      if (scanY > R) scanY = -R;
      const absY = cy + scanY;
      const xOff = Math.sqrt(Math.max(0, R*R - scanY*scanY));
      ctx.save();
      ctx.strokeStyle = 'rgba(179,71,255,0.6)';
      ctx.lineWidth   = 1.2;
      ctx.shadowColor = P;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.moveTo(cx - xOff, absY);
      ctx.lineTo(cx + xOff, absY);
      ctx.stroke();
      /* fade abaixo */
      const g = ctx.createLinearGradient(0, absY, 0, absY + 14);
      g.addColorStop(0, 'rgba(179,71,255,0.14)');
      g.addColorStop(1, 'rgba(179,71,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - xOff, absY, xOff * 2, 14);
      ctx.restore();
    }

    /* ── Core central pulsante ───────────────────────────── */
    function drawCore(t) {
      const pulse = Math.sin(t * 0.003) * 0.5 + 0.5;
      const cR    = R * 0.068;

      /* Glow radial */
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * (3 + pulse * 1.5));
      g.addColorStop(0,   `rgba(179,71,255,${0.55 + pulse * 0.3})`);
      g.addColorStop(0.5, `rgba(179,71,255,0.12)`);
      g.addColorStop(1,   'rgba(179,71,255,0)');
      ctx.beginPath(); ctx.arc(cx, cy, cR * 5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      /* Orbe */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
      ctx.fillStyle = P; ctx.shadowColor = P; ctx.shadowBlur = 18;
      ctx.fill(); ctx.restore();

      /* Anel de pulso */
      ctx.beginPath();
      ctx.arc(cx, cy, cR + pulse * R * 0.06 + R * 0.09, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(179,71,255,${0.6 - pulse * 0.3})`;
      ctx.lineWidth   = 1; ctx.stroke();

      /* Texto LD */
      ctx.font         = `900 ${Math.floor(R * 0.065)}px 'Orbitron',monospace`;
      ctx.fillStyle    = `rgba(212,168,255,${0.6 + pulse * 0.35})`;
      ctx.textAlign    = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('LD', cx, cy);
    }

    /* ── Cantos HUD ──────────────────────────────────────── */
    function drawCorners() {
      const m = S * 0.04, sz = S * 0.10;
      [[m,m,1,1],[S-m,m,-1,1],[m,S-m,1,-1],[S-m,S-m,-1,-1]].forEach(([x,y,dx,dy]) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(179,71,255,0.65)'; ctx.lineWidth = 2;
        ctx.shadowColor = P; ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(x+dx*sz,y); ctx.lineTo(x,y); ctx.lineTo(x,y+dy*sz);
        ctx.stroke();
        ctx.fillStyle = P; ctx.fillRect(x-3,y-3,6,6);
        ctx.restore();
      });
    }

    /* ── Readouts laterais ───────────────────────────────── */
    let blinkOn = true;
    setInterval(() => { blinkOn = !blinkOn; }, 480);

    function drawReadouts(t) {
      const fade = Math.sin(t * 0.0015) * 0.2 + 0.65;
      const fs   = 11;
      ctx.font         = `${fs}px 'Share Tech Mono',monospace`;
      ctx.textBaseline = 'middle';

      /* Posições relativas ao centro */
      const xLL = cx - R * 1.0;   // label esquerdo
      const xLV = cx - R * 0.50;  // valor esquerdo
      const xRL = cx + R * 0.52;  // label direito
      const xRV = cx + R * 1.02;  // valor direito
      const startY = cy - R * 0.52;
      const step   = R * 0.36;

      for (let i = 0; i < 4; i++) {
        const y      = startY + i * step;
        const blink  = blinkOn && i === 0;
        const blinkR = blinkOn && i === 2;

        /* Esquerda */
        ctx.textAlign = 'left';
        ctx.fillStyle = `rgba(120,55,190,${fade * 0.9})`;
        ctx.fillText(LABELS[i], xLL, y);
        ctx.textAlign   = 'right';
        ctx.fillStyle   = blink  ? PK : `rgba(179,71,255,${fade + 0.1})`;
        ctx.shadowColor = P; ctx.shadowBlur = blink ? 8 : 0;
        ctx.fillText(vals[i], xLV, y);
        ctx.shadowBlur  = 0;

        /* Direita */
        ctx.textAlign = 'left';
        ctx.fillStyle = `rgba(120,55,190,${fade * 0.9})`;
        ctx.fillText(LABELS[i+4], xRL, y);
        ctx.fillStyle   = blinkR ? PK : `rgba(179,71,255,${fade + 0.1})`;
        ctx.shadowColor = P; ctx.shadowBlur = blinkR ? 8 : 0;
        ctx.fillText(vals[i+4], xRV, y);
        ctx.shadowBlur  = 0;
      }
    }

    /* ── Loop principal ──────────────────────────────────── */
    function draw(t) {
      ctx.clearRect(0, 0, S, S);

      /* Clip para o círculo — partículas e scan line ficam dentro */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.01, 0, Math.PI * 2); ctx.clip();
      updateParticles();
      drawNodeNetwork();
      drawScanLine();
      ctx.restore();

      /* Elementos que podem sair levemente do círculo */
      drawSegmentedRings(t);
      drawEnergyArcs(t);
      drawCore(t);
      drawCorners();
      drawReadouts(t);
    }

    requestAnimationFrame(function loop(t) { draw(t); requestAnimationFrame(loop); });
  }

  /* Aguarda o layout estar pronto antes de iniciar */
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }

})();
