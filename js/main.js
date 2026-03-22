/**
 * main.js — JavaScript do Laroca Dev
 * Módulos: cursor, navbar scroll + mobile, scroll reveal
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
