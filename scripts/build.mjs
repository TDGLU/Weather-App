import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

mkdirSync(path.join(root, 'assets', 'js'), { recursive: true });
mkdirSync(path.join(root, 'assets', 'css'), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'js', 'app.js')],
  outfile: path.join(root, 'assets', 'js', 'app.min.js'),
  bundle: true,
  minify: true,
  target: ['es2020'],
  legalComments: 'none'
});

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'css', 'main.css')],
  outfile: path.join(root, 'assets', 'css', 'app.min.css'),
  minify: true
});

copyFileSync(
  path.join(root, 'src', 'js', 'theme-init.js'),
  path.join(root, 'assets', 'js', 'theme-init.js')
);

console.log('Build complete: assets/js/app.min.js, assets/css/app.min.css');