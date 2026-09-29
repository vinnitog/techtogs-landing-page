import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { renderVariant, variants } from '../variants/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = path.join(root, 'assets', 'variants');
await mkdir(assets, { recursive: true });

await build({
  entryPoints: Object.fromEntries(variants.map(variant => [variant.bundle.replace('.js', ''), path.join(root, 'variants', variant.bundle)])),
  outdir: assets,
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  minify: true,
  logLevel: 'warning'
});

const baseHtml = await readFile(path.join(root, 'index.html'), 'utf8');
for (const variant of variants) {
  await writeFile(path.join(root, variant.file), renderVariant(baseHtml, variant));
}
console.log('Três prévias de animação preparadas.');
