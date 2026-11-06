/* Decorative parallax only. All page content and recovery links work without JS. */
(() => {
  'use strict';
  const scene = document.getElementById('main');
  const toggle = document.getElementById('motion-toggle');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  if (!scene || !toggle) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const properties = ['--land-x', '--land-y', '--fog-x', '--fog-y', '--light-x', '--light-y'];
  const enabled = () => !paused && !reduced.matches && !document.hidden;

  function reset() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    currentX = currentY = 0;
    for (const property of properties) scene.style.setProperty(property, '0px');
  }
  function render() {
    frame = 0;
    if (!enabled()) return;
    const scroll = clamp(window.scrollY * 0.1, 0, 34);
    const targetX = pointerX * 11;
    const targetY = pointerY * 7 + scroll;
    currentX += (targetX - currentX) * 0.09;
    currentY += (targetY - currentY) * 0.09;
    scene.style.setProperty('--land-x', `${currentX.toFixed(2)}px`);
    scene.style.setProperty('--land-y', `${currentY.toFixed(2)}px`);
    scene.style.setProperty('--fog-x', `${(-currentX * 1.7).toFixed(2)}px`);
    scene.style.setProperty('--fog-y', `${(-currentY * 0.62).toFixed(2)}px`);
    scene.style.setProperty('--light-x', `${(currentX * 0.4).toFixed(2)}px`);
    scene.style.setProperty('--light-y', `${(currentY * 0.25).toFixed(2)}px`);
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.04) {
      frame = window.requestAnimationFrame(render);
    }
  }
  function requestRender() {
    if (enabled() && !frame) frame = window.requestAnimationFrame(render);
  }
  function syncMode() {
    const active = enabled();
    scene.classList.toggle('has-motion', active);
    toggle.hidden = reduced.matches;
    toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
    if (active) requestRender();
    else reset();
  }

  scene.addEventListener('pointermove', event => {
    if (!enabled() || !finePointer.matches) return;
    const box = scene.getBoundingClientRect();
    pointerX = clamp(((event.clientX - box.left) / box.width - 0.5) * 2, -1, 1);
    pointerY = clamp(((event.clientY - box.top) / box.height - 0.5) * 2, -1, 1);
    requestRender();
  }, {passive: true});
  scene.addEventListener('pointerleave', () => {
    pointerX = pointerY = 0;
    requestRender();
  });
  window.addEventListener('scroll', requestRender, {passive: true});
  window.addEventListener('resize', requestRender, {passive: true});
  document.addEventListener('visibilitychange', syncMode);
  reduced.addEventListener('change', syncMode);
  finePointer.addEventListener('change', () => {
    pointerX = pointerY = 0;
    requestRender();
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncMode();
  });
  syncMode();
})();
