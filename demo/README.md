# allure-rstest demo

A standalone project that configures `allure-rstest` the way a real consumer would, runs a
handful of tests, and generates an Allure report from the results.

## Setup

Install dependencies (this also builds the local `allure-rstest` package via its `prepare`
script):

```bash
npm install
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

- `tests/demo.test.ts`
  - a passing test using the runtime API (`feature`, `component`, `step` with a parameter, `attachment`)
  - a passing test using declarative metadata via `allureMeta`
  - a passing test whose `expect` calls appear as steps
  - a failing test
  - a skipped test

## Configuration

See `rstest.config.ts`: `setupFiles: ["allure-rstest/setup"]` plus the
`AllureRstestReporter` writing to `./allure-results`.