import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: true,
    },
  ],
  source: {
    tsconfigPath: './tsconfig.build.json',
    entry: {
      index: './src/index.ts',
      sync: './src/sync.ts',
      setup: './src/setup.ts',
      reporter: './src/reporter.ts',
      'browser/index': './src/browser/index.ts',
      'browser/setup': './src/browser/setup.ts',
    },
  },
});
