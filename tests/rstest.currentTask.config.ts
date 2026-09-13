import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['tests/spec/currentTask.test.ts'],
  setupFiles: ['./tests/fixtures/currentTask.setup.ts'],
});
