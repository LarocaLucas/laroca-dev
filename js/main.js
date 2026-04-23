/**
 * main.js — JavaScript do Laroca Dev
 * Módulos: cursor, navbar scroll + mobile, scroll reveal, matrix rain
 */

'use strict';

/* ── 1. CURSOR CUSTOMIZADO (desktop only) ───────────────────
 * Só ativa em dispositivos com mouse (hover: hover)
 ─────────────────────────────────────────────────────────── */
(function initCursor() {
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let curX = 0, curY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    curX = e.clientX;
    curY = e.clientY;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
  }, { passive: true });

  // Ring com suavização via requestAnimationFrame
  function animateRing() {
    ringX += (curX - ringX) * 0.15;
    ringY += (curY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);
})();


/* ── 2. NAVBAR — SCROLL + MOBILE TOGGLE ────────────────────
 ─────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Adiciona classe scrolled ao rolar
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Toggle menu mobile
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Fecha menu ao clicar em qualquer link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* ── 3. SCROLL REVEAL ───────────────────────────────────────
 * Anima elementos com classe .reveal ao entrar no viewport
 ─────────────────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Pequeno stagger para grupos de cards
          const delay = i * 0.05;
          entry.target.style.transitionDelay = delay + 's';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ── 4. MATRIX RAIN ROXO ────────────────────────────────────
 * Canvas animado com caracteres caindo na cor roxa #b347ff
 * Funciona em desktop e mobile, fica atrás de todo conteúdo
 * via z-index: -1 no CSS. Throttle ~30fps para não onerar CPU.
 ─────────────────────────────────────────────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Conjunto de caracteres: letras, números, símbolos de código
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
    '0123456789<>{}[]()=+*&%$#@!?/\\|^~`;:' +
    'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäå';

  const FONT_SIZE = 14;        // tamanho do caractere em px
  const COLOR     = '#b347ff'; // roxo principal da identidade
  const TRAIL     = 'rgba(5, 5, 8, 0.045)'; // rastro de cauda
  const TIP_COLOR = 'rgba(212, 168, 255, 0.75)'; // ponta lilás

  let columns = 0;
  let drops   = [];

  /** Redimensiona o canvas e reinicializa colunas conforme viewport. */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const newColumns = Math.floor(canvas.width / FONT_SIZE);
    const prev = drops.slice();

    // Preserva posições existentes; inicia novas em Y negativo aleatório
    drops = Array.from({ length: newColumns }, (_, i) =>
      prev[i] !== undefined
        ? prev[i]
        : Math.random() * -(canvas.height / FONT_SIZE)
    );
    columns = newColumns;
  }

  /** Renderiza um frame da chuva Matrix. */
  function draw() {
    // Overlay escuro semi-transparente cria o efeito de cauda/rastro
    ctx.fillStyle = TRAIL;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < columns; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x    = i * FONT_SIZE;
      const y    = drops[i] * FONT_SIZE;

      // Ponta da gota mais clara (lilás) para destaque visual
      ctx.fillStyle = TIP_COLOR;
      ctx.fillText(char, x, y);
      ctx.fillStyle = COLOR;

      // Reseta a gota aleatoriamente após ultrapassar a tela
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5; // velocidade moderada — efeito suave, não ansioso
    }
  }

  // Inicializa e escuta redimensionamento
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Loop de animação com throttle ~30fps
  let lastTime = 0;
  const INTERVAL = 33; // ~30fps

  function loop(timestamp) {
    if (timestamp - lastTime >= INTERVAL) {
      draw();
      lastTime = timestamp;
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
