export const variants = [
  { file: 'motion.html', name: 'Motion', bundle: 'motion.js' },
  { file: 'gsap.html', name: 'GSAP', bundle: 'gsap.js' },
  { file: 'motion-gsap.html', name: 'Motion + GSAP', bundle: 'motion-gsap.js' }
];

export function renderVariant(baseHtml, variant) {
  return baseHtml
    .replace('<html lang="pt-BR"', `<html lang="pt-BR" data-variant="${variant.bundle.replace('.js', '')}"`)
    .replace('<head>', baseHtml.includes('name="robots"') ? '<head>' : '<head>\n  <meta name="robots" content="noindex, follow">')
    .replace('<title>Sistemas sob medida e automações para empresas | TechTogs</title>', `<title>Prévia ${variant.name} | TechTogs</title>`)
    .replace('<script src="assets/variants/motion-gsap.js" defer></script>', `<script src="assets/variants/${variant.bundle}" defer></script>`);
}
