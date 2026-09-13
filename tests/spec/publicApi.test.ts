import { expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';

test('exposes component and customLabel through the async facade', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/facade.test.ts': `
      import { test, expect } from "@rstest/core";
      import { component, customLabel, feature } from "allure-rstest";

      const squad = customLabel("squad");

      test("async facade", async () => {
        await feature("Checkout");
        await component("billing-api");
        await squad("alpha");
        expect(1).toBe(1);
      });
    `,
  });

  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: 'feature', value: 'Checkout' },
      { name: 'component', value: 'billing-api' },
      { name: 'squad', value: 'alpha' },
    ]),
  );
});

test('exposes the Allure namespace', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/namespace.test.ts': `
      import { test, expect } from "@rstest/core";
      import { Allure } from "allure-rstest";

      test("namespace", async () => {
        await Allure.severity("critical");
        await Allure.component("billing-api");
        expect(1).toBe(1);
      });
    `,
  });

  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: 'severity', value: 'critical' },
      { name: 'component', value: 'billing-api' },
    ]),
  );
});

test('exposes a synchronous facade', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/sync.test.ts': `
      import { test, expect } from "@rstest/core";
      import { component, feature } from "allure-rstest/sync";

      test("sync facade", () => {
        feature("Checkout");
        component("billing-api");
        expect(1).toBe(1);
      });
    `,
  });

  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: 'feature', value: 'Checkout' },
      { name: 'component', value: 'billing-api' },
    ]),
  );
});

test('keeps the deprecated global allure object working', async () => {
  const { tests } = await runRstestInlineTest({
    'spec/legacy.test.ts': `
      import { test, expect } from "@rstest/core";

      test("legacy global", async () => {
        await globalThis.allure.feature("Checkout");
        expect(1).toBe(1);
      });
    `,
  });

  expect(tests[0].labels).toEqual(expect.arrayContaining([{ name: 'feature', value: 'Checkout' }]));
});