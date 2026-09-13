# allure-rstest demo

A standalone project that configures `allure-rstest` the way a real consumer would, runs a
handful of tests, and commits the generated Allure artifacts so the report can be opened
without re-running the suite.

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

This writes Allure results to `allure-results/` (already committed so the report can be
opened without running the tests).

## Open the report

```bash
npx allure open allure-results
```

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