import { build } from 'esbuild';
import aliasPath from 'esbuild-plugin-alias-path';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  sourcemap: true,           
  minify: false,               
  target: ['node20'],
  outdir: 'dist',
  plugins: [
    aliasPath({
      alias: {
        '@': './src',
      },
    }),
  ],
  external: [
    'express',
    'body-parser',
    'depd',
    'inversify-express-utils',
    'argon2',
    'mongoose',
  ],
}).catch(() => process.exit(1));
