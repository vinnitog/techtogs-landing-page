import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initGsapStory() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-copy h1', { y: 22, opacity: 0.55, duration: 0.32 })
    .from('.hero-description', { y: 14, opacity: 0.55, duration: 0.32 }, '-=0.24')
    .from('.hero-actions', { y: 12, opacity: 0.55, duration: 0.32 }, '-=0.24')
    .from('.hero-visual', { x: 22, opacity: 0.6, duration: 0.32 }, '-=0.24');

  gsap.from('.method .step-number', {
    x: -16,
    opacity: 0.4,
    duration: 0.32,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.method .steps', start: 'top 82%', once: true }
  });
}
