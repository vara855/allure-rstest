import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  include: ['tests/spec/**/*.test.ts', 'tests/build.test.ts'],
  exclude: ['tests/fixtures/**', 'tests/spec/currentTask.test.ts', 'tests/spec/runtime.test.ts'],
  testTimeout: 60_000,
});
