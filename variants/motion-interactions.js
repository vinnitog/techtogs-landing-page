import { animate, hover } from 'motion';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initMotionInteractions({ intro = false } = {}) {
  if (reducedMotion.matches) return;

  if (intro) {
    animate('.hero-copy h1', { opacity: [0.65, 1], y: [16, 0] }, { duration: 0.32, ease: 'easeOut' });
    animate('.hero-description, .hero-actions', { opacity: [0.55, 1], y: [12, 0] }, { duration: 0.32, delay: 0.08, ease: 'easeOut' });
    animate('.workflow-window', { opacity: [0.7, 1], scale: [0.97, 1] }, { duration: 0.32, delay: 0.16, ease: 'easeOut' });
  }

  hover('.flow-node, .output-node', element => {
    animate(element, { scale: 1.02 }, { duration: 0.12, ease: 'easeOut' });
    return () => animate(element, { scale: 1 }, { duration: 0.2, ease: 'easeOut' });
  });

  window.addEventListener('techtogs:flow-step', event => {
    const node = document.querySelector(event.detail.selector);
    if (!node || reducedMotion.matches) return;
    animate(node, { scale: [1, 1.035, 1] }, { duration: 0.32, ease: 'easeInOut' });
    const icon = node.querySelector('.node-icon, svg');
    if (icon) animate(icon, { rotate: [0, -6, 0], scale: [1, 1.14, 1] }, { duration: 0.32, ease: 'easeInOut' });
  });
}
