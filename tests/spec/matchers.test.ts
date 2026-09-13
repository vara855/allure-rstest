import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('turns expect calls into steps', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/matchers.test.ts': `
      import { test, expect } from "@rstest/core";

      test("asserts", () => {
        expect(1).toBe(1);
        expect("abc").toContain("b");
      });
    `,
  });

  const names = tests[0].steps.map((s) => s.name);

  expect(names).toEqual(['expect(1).toBe(1)', 'expect("abc").toContain("b")']);
  expect(tests[0].steps.every((s) => s.status === 'passed')).toBe(true);
});

test('marks a failing matcher step as failed', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/failing.test.ts': `
      import { test, expect } from "@rstest/core";

      test("fails", () => { expect(1).toBe(2); });
    `,
  });

  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].status).toBe('failed');
});

test('supports expect.extend', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/extend.test.ts': `
      import { test, expect } from "@rstest/core";

      expect.extend({
        toBeAnswer(received) {
          return { pass: received === 42, message: () => "expected 42" };
        },
      });

      test("custom matcher", () => { expect(42).toBeAnswer(); });
    `,
  });

  expect(tests[0].steps.map((s) => s.name)).toEqual(['expect(42).toBeAnswer()']);
});

test('does not wrap expect.poll into a step', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/poll.test.ts': `
      import { test, expect } from "@rstest/core";

      test("polls", async () => {
        let value = 0;
        setTimeout(() => { value = 1; }, 10);
        await expect.poll(() => value).toBe(1);
      });
    `,
  });

  expect(tests[0].status).toBe('passed');
  expect(tests[0].steps).toEqual([]);
});

test('reportMatchers: false suppresses matcher steps', async () => {
  const { tests } = await runRstestInlineTest(
    {
      'spec/off.test.ts': `
        import { test, expect } from "@rstest/core";

        test("asserts", () => { expect(1).toBe(1); });
      `,
    },
    { reporterOptions: 'reportMatchers: false,' },
  );

  expect(tests[0].steps).toEqual([]);
});