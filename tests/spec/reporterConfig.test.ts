import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

const passingSpec = {
  'spec/config.test.ts': `
    import { test, expect } from "@rstest/core";

    test("a test", () => { expect(1).toBe(1); });
  `,
};

test('writes categories definitions', async () => {
  const { categories } = await runRstestInlineTest(passingSpec, {
    reporterOptions: 'categories: [{ name: "Flaky", matchedStatuses: ["failed"] }],',
  });

  expect(categories).toEqual([{ name: 'Flaky', matchedStatuses: ['failed'] }]);
});

test('writes environment info', async () => {
  const { envInfo } = await runRstestInlineTest(passingSpec, {
    reporterOptions: 'environmentInfo: { stand: "staging" },',
  });

  expect(envInfo).toEqual({ stand: 'staging' });
});

test('prepends global labels to every test', async () => {
  const { tests } = await runRstestInlineTest(passingSpec, {
    reporterOptions: 'globalLabels: [{ name: "env", value: "staging" }],',
  });

  expect(tests[0].labels).toEqual(expect.arrayContaining([{ name: 'env', value: 'staging' }]));
});

test('expands link templates from the reporter config', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/links.test.ts': `
      import { test, expect } from "@rstest/core";
      import { issue, tms } from "allure-js-commons";

      test("links", async () => {
        await issue("AE-123");
        await tms("TC-1");
        expect(1).toBe(1);
      });
    `,
  });

  expect(tests[0].links).toEqual(
    expect.arrayContaining([
      { type: 'issue', url: 'https://example.org/issue/AE-123' },
      { type: 'tms', url: 'https://example.org/tms/TC-1' },
    ]),
  );
});

test('derives testCaseId and historyId, and honours explicit overrides', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/ids.test.ts': `
      import { test, expect } from "@rstest/core";
      import { historyId, testCaseId } from "allure-js-commons";

      test("derived ids", () => { expect(1).toBe(1); });

      test("explicit ids", async () => {
        await testCaseId("my-case");
        await historyId("my-history");
        expect(1).toBe(1);
      });
    `,
  });

  const byName = Object.fromEntries(tests.map((t) => [t.name, t]));

  expect(byName['derived ids'].testCaseId).toMatch(/^[a-f0-9]{32}$/);
  expect(byName['derived ids'].historyId).toBeTruthy();
  expect(byName['explicit ids'].testCaseId).toBe('my-case');
  expect(byName['explicit ids'].historyId).toBe('my-history');
});

test('keeps historyId stable across runs of the same test', async () => {
  const [first, second] = await Promise.all([
    runRstestInlineTest(passingSpec),
    runRstestInlineTest(passingSpec),
  ]);

  expect(first.tests[0].historyId).toBe(second.tests[0].historyId);
});