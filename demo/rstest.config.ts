import { defineConfig } from '@rstest/core';
import AllureRstestReporter from 'allure-rstest/reporter';

export default defineConfig({
  include: ['tests/**/*.test.ts'],
  setupFiles: ['allure-rstest/setup'],
  reporters: ['default', new AllureRstestReporter({ resultsDir: './allure-results' })],
});