import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('reports suite hook errors and retry count', async () => {
  const hook = await runRstestInlineTest({
    'spec/hook.test.ts': `
      import { beforeAll, test } from "@rstest/core";
      beforeAll(() => { throw new Error("hook exploded"); });
      test("never runs", () => {});
    `,
  });
  const globals = Object.values(hook.globals ?? {}).flatMap((g) => g.errors);
  expect(globals).toEqual(
    expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('hook exploded') })]),
  );

  const retry = await runRstestInlineTest({
    'spec/retry.test.ts': `
      import { test, expect } from "@rstest/core";
      let attempts = 0;
      test("flaky", { retry: 2 }, () => expect(++attempts).toBe(3));
    `,
  });
  expect(retry.tests[0].parameters).toEqual(
    expect.arrayContaining([{ name: 'retry', value: '2', excluded: true }]),
  );
});
