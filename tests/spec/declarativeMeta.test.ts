import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('applies declarative metadata before runtime metadata', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/meta.test.ts': `
      import { test, expect } from "@rstest/core";
      import { allureMeta } from "allure-rstest";
      import { severity } from "allure-js-commons";
      test("declarative @allure.label.feature:Title", {
        meta: allureMeta({ feature: "Meta", severity: "minor", owner: "team", tags: ["smoke"] }),
      }, async () => {
        await severity("blocker");
        expect(1).toBe(1);
      });
    `,
  });
  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: 'feature', value: 'Title' },
      { name: 'feature', value: 'Meta' },
      { name: 'owner', value: 'team' },
      { name: 'tag', value: 'smoke' },
      { name: 'severity', value: 'blocker' },
    ]),
  );
  expect(tests[0].labels.filter(({ name }) => name === 'severity')).toEqual([
    { name: 'severity', value: 'blocker' },
  ]);
});
