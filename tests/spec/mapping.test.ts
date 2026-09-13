import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('maps statuses and runtime messages', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/mapping.test.ts': `
      import { test, expect } from "@rstest/core";
      import { feature, step } from "allure-js-commons";
      test("passing", async () => {
        await feature("Checkout");
        await step("inner step", () => {});
        expect(1).toBe(1);
      });
      test("failing", () => expect(1).toBe(2));
      test.skip("skipped", () => {});
    `,
  });
  const byName = Object.fromEntries(tests.map((result) => [result.name, result]));
  expect(byName.passing.status).toBe('passed');
  expect(byName.passing.labels).toEqual(
    expect.arrayContaining([{ name: 'feature', value: 'Checkout' }]),
  );
  expect(byName.passing.steps[0].name).toBe('inner step');
  expect(byName.failing.status).toBe('failed');
  expect(byName.skipped.status).toBe('skipped');
});

test('builds suite paths and technical labels', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/suites.test.ts': `
      import { describe, test, expect } from "@rstest/core";
      describe("Billing", () => describe("Checkout", () => {
        test("charges a card", () => expect(1).toBe(1));
      }));
    `,
  });
  expect(tests[0].fullName).toContain('spec/suites.test.ts#Billing Checkout charges a card');
  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: 'parentSuite', value: 'Billing' },
      { name: 'suite', value: 'Checkout' },
      { name: 'framework', value: 'rstest' },
    ]),
  );
});
