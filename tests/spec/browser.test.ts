import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

const hasPlaywright = await import('playwright')
  .then(() => true)
  .catch(() => false);

// Browser mode is a v1 limitation: without AsyncLocalStorage the browser cannot resolve
// the current test, so per-test Allure metadata is not captured. We only assert that the
// test runs and produces a result.
test.skipIf(!hasPlaywright)('runs tests in browser mode', async () => {
  const { tests } = await runRstestInlineTest(
    {
      'spec/browser.test.ts': `
        import { test, expect } from "@rstest/core";
        import { attachment, feature } from "allure-rstest";

        test("runs in a browser", async () => {
          await feature("Checkout");
          await attachment("payload", "hello", "text/plain");
          expect(1).toBe(1);
        });
      `,
    },
    { browser: true },
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].status).toBe('passed');
});