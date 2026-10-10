import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

// Same lockfile and build options for both sources; no files or refs are changed.
const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = process.argv[2] ?? 'b1394d4';
const previous = execFileSync('git', ['show', `${baseline}:variants/motion-interactions.js`], {
  cwd: root, encoding: 'utf8',
});
const results = [];
for (const variant of ['motion', 'gsap', 'motion-gsap']) {
  const sizes = [];
  for (const old of [true, false]) {
    const result = await build({
      absWorkingDir: root, entryPoints: [`variants/${variant}.js`],
      bundle: true, format: 'iife', target: ['es2022'], minify: true,
      write: false, logLevel: 'warning',
      plugins: old ? [{ name: 'baseline-interactions', setup(builder) {
        builder.onLoad({ filter: /[\\/]motion-interactions\.js$/ }, () => ({
          contents: previous, loader: 'js', resolveDir: fileURLToPath(new URL('../variants/', import.meta.url)),
        }));
      } }] : [],
    });
    const bytes = result.outputFiles[0].contents;
    sizes.push({ bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
  }
  results.push({ variant, before: sizes[0], after: sizes[1], savedBytes: sizes[0].bytes - sizes[1].bytes });
}
console.log(JSON.stringify({ baseline, node: process.version, results }, null, 2));
