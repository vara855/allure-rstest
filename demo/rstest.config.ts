import { defineConfig, defineInlineProject } from '@rstest/core';
import AllureRstestReporter from 'allure-rstest/reporter';

export default defineConfig({
  reporters: ['default', new AllureRstestReporter({ resultsDir: './allure-results' })],
  projects: [
    defineInlineProject({
      name: 'node',
      include: ['tests/demo.test.ts'],
      setupFiles: ['allure-rstest/setup'],
    }),
    defineInlineProject({
      name: 'browser',
      include: ['tests/browser/**/*.test.ts'],
      setupFiles: ['allure-rstest/browser/setup'],
      browser: {
        provider: 'playwright',
        enabled: true,
        headless: true,
      },
    }),
  ],
});