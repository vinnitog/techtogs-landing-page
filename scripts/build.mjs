import './build-variants.mjs';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderVariant, variants } from '../variants/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await mkdir(path.join(output, 'assets'), { recursive: true });
await mkdir(path.join(output, 'assets', 'variants'), { recursive: true });

// Only the public site assets belong in the Pages artifact.
for (const file of ['styles.css', 'app.js', 'politica-de-privacidade.html', 'assets/brand-horizontal.svg', 'assets/brand-symbol.svg', 'assets/favicon.svg']) {
  await copyFile(path.join(root, file), path.join(output, file));
}

const html = (await readFile(path.join(root, 'index.html'), 'utf8'))
  .replace('<html lang="pt-BR">', '<html lang="pt-BR" data-hosting="static">')
  .replace('<head>', '<head>\n  <meta name="robots" content="noindex, follow">')
  .replace('type="submit">Enviar meu desafio', 'type="submit" disabled>Simular envio do desafio')
  .replace('Seus dados são usados para conversar sobre seu projeto.', 'Demonstração: use dados fictícios. Nada será enviado ou salvo.');

await writeFile(path.join(output, 'index.html'), html);
for (const variant of variants) {
  await writeFile(path.join(output, variant.file), renderVariant(html, variant));
  await copyFile(path.join(root, 'assets', 'variants', variant.bundle), path.join(output, 'assets', 'variants', variant.bundle));
}
const servicePage = (await readFile(path.join(root, 'sistemas-sob-medida.html'), 'utf8'))
  .replace('<head>', '<head>\n  <meta name="robots" content="noindex, follow">');
await writeFile(path.join(output, 'sistemas-sob-medida.html'), servicePage);
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('Site estático preparado em dist/ (formulário em modo de demonstração).');
