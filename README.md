# allure-rstest

[Allure Report](https://allurereport.org/) integration for the [rstest](https://rstest.rs) test runner.

## Installation

```bash
npm install --save-dev allure-rstest
```

## Configuration

Both lines are required. `rstest` does not let a reporter append `setupFiles` for you,
so the setup file is wired up manually.

```ts
// rstest.config.ts
import { defineConfig } from '@rstest/core';
import AllureRstestReporter from 'allure-rstest/reporter';

export default defineConfig({
  setupFiles: ['allure-rstest/setup'],
  reporters: [
    'default',
    new AllureRstestReporter({ resultsDir: './allure-results' }),
  ],
});
```

## Metadata

Four channels work at the same time and are merged as described below.

### Declarative (recommended)

`rstest` inherits `meta` from `describe` down to nested tests, and child keys override
inherited ones — the runner does this for you. Use `allureMeta()` (instead of a raw object)
so the Allure keys are type-checked at compile time.

```ts
import { describe, test } from '@rstest/core';
import { allureMeta } from 'allure-rstest';

describe('Billing', { meta: allureMeta({ epic: 'Payments' }) }, () => {
  test('charges a card', {
    meta: allureMeta({
      feature: 'Checkout',
      severity: 'critical',
      owner: 'team-payments',
      tags: ['smoke'],
      labels: { component: 'billing-api' },
      links: { issue: 'AE-123' },
    }),
  }, async () => {
    // ...
  });
});
```

### Runtime API

```ts
import { Allure, attachment, component, feature, step } from 'allure-rstest';

test('charges a card', async () => {
  await feature('Checkout');
  await component('billing-api');
  await Allure.severity('critical');

  await step('create the order', async (ctx) => {
    await ctx.parameter('currency', 'EUR');
  });

  await attachment('payload', JSON.stringify(body), 'application/json');
});
```

A synchronous variant is available from `allure-rstest/sync`; the same names return `void`.

### In the test title

```ts
test('charges a card @allure.id:42 @allure.label.feature:Checkout', fn);
test('refunds @allure.link.issue:https://example.org/AE-123', fn);
```

### Application order

Title → declarative `meta` (suite, then test) → runtime API.

- Multiple-valued labels (`epic`, `feature`, `story`, `component`, `layer`, `tag`,
  arbitrary ones) accumulate across all channels.
- Single-valued labels (`severity`, `owner`, `lead`, `allureId`, `parentSuite`,
  `suite`, `subSuite`) — the last channel wins.
- Links and parameters accumulate.

Technical labels (`host`, `thread`, `package`, `framework`, `language`) are set by the
reporter and are not overridden by user channels.

## Arbitrary labels

`component` is not part of Allure's built-in label set and does not feed the Behaviors
tab — it is a plain label used for grouping and filtering.

```ts
import { component, customLabel } from 'allure-rstest';

const squad = customLabel('squad');

await component('billing-api');
await squad('alpha');
```

## Reporter configuration

| Field | Type | Purpose |
|---|---|---|
| `resultsDir` | `string` | Where to write results. Defaults to `./allure-results` |
| `links` | `LinkConfig` | URL templates per link type |
| `globalLabels` | `Label[] \| Record<string, string \| string[]>` | Labels added to every test |
| `categories` | `Category[]` | Defect category definitions |
| `environmentInfo` | `Record<string, string \| undefined>` | Environment information |
| `listeners` | `LifecycleListener[]` | Result lifecycle hooks |
| `reportMatchers` | `boolean` | Turn `expect` calls into steps. Defaults to `true` |
| `cleanResults` | `boolean` | Remove stale Allure artifacts from `resultsDir` at run start. Defaults to `true` |
| `enabled` | `boolean` | Run the integration as a no-op when `false`. Defaults to the `ALLURE_ENABLED` env var, or `true` |

## Disabling

To run rstest with zero Allure side effects (for example, in fast local development while
keeping the report only on CI), either set the env var for the whole run:

```bash
ALLURE_ENABLED=false npm test
```

or pass `enabled: false` to the reporter:

```ts
new AllureRstestReporter({ enabled: false }),
```

When disabled, the setup file skips wrapping `test`/`it`, matchers and the runtime, and
the reporter writes nothing.

## Browser mode

```ts
setupFiles: ['allure-rstest/browser/setup'],
```

## Limitations

- **Testplan does not work in browser mode.** rstest has neither `browser.commands` nor
  `provide`/`inject`, so there is no way to read the testplan file from the browser.
- **Per-test metadata is not captured in browser mode (v1).** Browsers have no
  `AsyncLocalStorage`, so the running test cannot be resolved and Allure API calls inside
  a browser test are no-ops. Browser mode runs the tests and produces results, but steps,
  attachments and labels are not reported per test.
- The integration relies on an internal rstest detail (`globalThis["@rstest/core"]`) and
  is verified against `@rstest/core@0.11.12`. On a minor version mismatch the package
  prints a warning.

## License

MIT