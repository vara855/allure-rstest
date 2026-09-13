import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['tests/spec/currentTask.test.ts', 'tests/spec/runtime.test.ts'],
  setupFiles: ['./tests/fixtures/currentTask.setup.ts'],
});
