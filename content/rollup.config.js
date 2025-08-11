import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: '../dist/content.js',
    format: 'esm',
  },
  external: [
    'node:path',
    'node:url',
    'zod',
  ],
  plugins: [
    typescript(),
  ],
})
