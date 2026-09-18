# allure-rstest demo

A standalone project that configures `allure-rstest` the way a real consumer would, runs a
handful of tests, and generates an Allure report from the results.

## Setup

Install dependencies (this also builds the local `allure-rstest` package via its `prepare`
script):

```bash
npm install
```

The demo runs its tests in two Rstest projects: a `node` project and a `browser` project.
The browser project uses Browser Mode (Playwright), so the first run needs the Chromium
driver installed:

```bash
npx playwright install chromium
```

## Run the tests

```bash
npm test
```

This writes Allure results to `allure-results/` (git-ignored).

## Generate and open the report

```bash
npm run allure       # npx allure generate ./allure-results --clean -o ./allure-report
npm run allure:open  # npx allure open ./allure-report
```

`allure-report/` is also git-ignored. Note: the Allure CLI requires a JVM to run.

## What the demo shows

- `tests/demo.test.ts` (node project)
  - a passing test using the runtime API (`feature`, `component`, `step` with a parameter, `attachment`)
  - a passing test using declarative metadata via `allureMeta`
  - a passing test whose `expect` calls appear as steps
  - a failing test
  - a skipped test
- `tests/browser/browser.test.ts` (browser project)
  - a passing test that calls the Allure API (`feature`, `step`, `attachment`) inside a real browser
  - a passing test that interacts with the live DOM via the `@rstest/browser` `page` locator

## Configuration

See `rstest.config.ts`. Two inline projects share one `AllureRstestReporter` writing to
`./allure-results`:

- `node` — the demo tests, with `setupFiles: ["allure-rstest/setup"]`
- `browser` — Browser Mode (Playwright, headless), with `setupFiles: ["allure-rstest/browser/setup"]`

Note: Browser Mode is experimental and, as of the current v1, cannot resolve the running test
(no AsyncLocalStorage in the browser), so per-test Allure metadata is not captured. The browser
tests therefore verify that the Allure API is usable and that results are produced, rather than
asserting per-test metadata.