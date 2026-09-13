import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('reports a single passing test', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/sample.test.ts': `
      import { test, expect } from "@rstest/core";
      test("passing test", () => expect(1).toBe(1));
    `,
  });
  expect(tests).toHaveLength(1);
  expect(tests[0].name).toBe('passing test');
  expect(tests[0].status).toBe('passed');
});
