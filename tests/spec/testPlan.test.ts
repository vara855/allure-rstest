import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('runs only tests listed in the test plan', async () => {
  const { tests } = await runRstestInlineTest(
    {
      'spec/plan.test.ts': `
        import { test } from "@rstest/core";
        test("included @allure.id:1", () => {});
        test("excluded @allure.id:2", () => {});
      `,
      'testplan.json': JSON.stringify({ version: '1.0', tests: [{ id: 1 }] }),
    },
    { env: (testDir) => ({ ALLURE_TESTPLAN_PATH: join(testDir, 'testplan.json') }) },
  );
  expect(tests.map(({ name }) => name)).toEqual(['included']);
});
