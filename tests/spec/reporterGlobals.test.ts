import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from '@rstest/core';
import AllureRstestReporter from '../../src/reporter.js';
import { ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY, ALLURE_SETUP_FLAG_META_KEY } from '../../src/runtime.js';

let tempDir: string | undefined;

const resultsDir = () => (tempDir = mkdtempSync(join(tmpdir(), 'ar-globals-')));

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

const baseResult = (overrides: Record<string, unknown> = {}) => ({
  testId: 't1',
  name: 'a test',
  testPath: '/tmp/proj/tests/a.test.ts',
  project: 'demo',
  status: 'pass',
  duration: 10,
  meta: {},
  ...overrides,
});

const readGlobalErrors = (): unknown[] => {
  const files = readdirSync(tempDir!).filter((file) => file.endsWith('-globals.json'));
  return files.flatMap((file) =>
    (JSON.parse(readFileSync(join(tempDir!, file), 'utf8')) as { errors: unknown[] }).errors,
  );
};

test('writes global messages immediately, without relying on onTestRunEnd', () => {
  const reporter = new AllureRstestReporter({ resultsDir: resultsDir() });
  reporter.onTestRunStart();
  reporter.onTestCaseResult(
    baseResult({
      meta: {
        [ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY]: [
          { type: 'global_error', data: { message: 'boom' } },
        ],
      },
    }),
  );
  // onTestRunEnd is intentionally NOT called.

  expect(readGlobalErrors()).toEqual([expect.objectContaining({ message: 'boom' })]);
});

test('resets the setup flag between runs', () => {
  const reporter = new AllureRstestReporter({ resultsDir: resultsDir() });
  const warnings: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => warnings.push(args.map(String).join(' '));

  try {
    // Run 1: a setup file is present.
    reporter.onTestRunStart();
    reporter.onTestCaseStart({ testId: 't1', startTime: 0 });
    reporter.onTestCaseResult(baseResult({ meta: { [ALLURE_SETUP_FLAG_META_KEY]: true } }));
    reporter.onTestRunEnd();
    expect(warnings).toHaveLength(0);

    // Run 2: no setup file — the reporter must warn again.
    reporter.onTestRunStart();
    reporter.onTestCaseStart({ testId: 't2', startTime: 0 });
    reporter.onTestCaseResult(baseResult({ testId: 't2' }));
    reporter.onTestRunEnd();

    expect(warnings.some((w) => w.includes('setupFiles: ["allure-rstest/setup"]'))).toBe(true);
  } finally {
    console.error = originalError;
  }
});