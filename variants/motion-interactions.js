import { animate } from 'motion/mini';
import { hover } from 'motion';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initMotionInteractions({ intro = false } = {}) {
  if (reducedMotion.matches) return;

  if (intro) {
    animate('.hero-copy h1', { opacity: [0.65, 1], transform: ['translateY(16px)', 'translateY(0px)'] }, { duration: 0.32, ease: 'easeOut' });
    animate('.hero-description, .hero-actions', { opacity: [0.55, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.32, delay: 0.08, ease: 'easeOut' });
    animate('.workflow-window', { opacity: [0.7, 1], transform: ['scale(0.97)', 'scale(1)'] }, { duration: 0.32, delay: 0.16, ease: 'easeOut' });
  }

  hover('.flow-node, .output-node', element => {
    if (reducedMotion.matches) return;
    animate(element, { transform: 'scale(1.02)' }, { duration: 0.12, ease: 'easeOut' });
    return () => animate(element, { transform: 'scale(1)' }, { duration: 0.2, ease: 'easeOut' });
  });

  window.addEventListener('techtogs:flow-step', event => {
    const node = document.querySelector(event.detail.selector);
    if (!node || reducedMotion.matches) return;
    animate(node, { transform: ['scale(1)', 'scale(1.035)', 'scale(1)'] }, { duration: 0.32, ease: 'easeInOut' });
    const icon = node.querySelector('.node-icon, svg');
    if (icon) animate(icon, { transform: ['rotate(0deg) scale(1)', 'rotate(-6deg) scale(1.14)', 'rotate(0deg) scale(1)'] }, { duration: 0.32, ease: 'easeInOut' });
  });
}
