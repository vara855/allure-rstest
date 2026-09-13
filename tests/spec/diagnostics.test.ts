import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('explains a missing setup file on stderr', async () => {
  const { tests, stderr } = await runRstestInlineTest(
    {
      'spec/nosetup.test.ts': `
        import { test, expect } from "@rstest/core";

        test("no setup", () => { expect(1).toBe(1); });
      `,
    },
    { withoutSetup: true },
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].steps).toEqual([]);
  expect(stderr).toContain('setupFiles: ["allure-rstest/setup"]');
});

test('stays silent when the setup file is configured', async () => {
  const { stderr } = await runRstestInlineTest({
    'spec/withsetup.test.ts': `
      import { test, expect } from "@rstest/core";

      test("with setup", () => { expect(1).toBe(1); });
    `,
  });

  expect(stderr).not.toContain('setupFiles: ["allure-rstest/setup"]');
});