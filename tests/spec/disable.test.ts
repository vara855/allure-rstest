import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from '@rstest/core';
import { runRstestInlineTest } from '../harness.js';
import { isAllureDisabled } from '../../src/env.js';
import AllureRstestReporter from '../../src/reporter.js';

let tempDir: string | undefined;

const resultsDir = () => (tempDir = mkdtempSync(join(tmpdir(), 'ar-disable-')));
const listFiles = () => (tempDir ? readdirSync(tempDir) : []);

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
  delete process.env.ALLURE_ENABLED;
});

test('isAllureDisabled parses the env flag', () => {
  delete process.env.ALLURE_ENABLED;
  expect(isAllureDisabled()).toBe(false);
  process.env.ALLURE_ENABLED = 'true';
  expect(isAllureDisabled()).toBe(false);
  process.env.ALLURE_ENABLED = 'false';
  expect(isAllureDisabled()).toBe(true);
  process.env.ALLURE_ENABLED = '0';
  expect(isAllureDisabled()).toBe(true);
});

test('reporter is enabled by default', () => {
  const reporter = new AllureRstestReporter({
    resultsDir: resultsDir(),
    environmentInfo: { stand: 'staging' },
  });
  reporter.onTestRunStart();
  expect(listFiles()).toContain('environment.properties');
});

test('reporter writes nothing when enabled: false', () => {
  const reporter = new AllureRstestReporter({ resultsDir: resultsDir(), enabled: false });
  reporter.onTestRunStart();
  expect(listFiles()).toEqual([]);
});

test('reporter writes nothing when ALLURE_ENABLED=false', () => {
  process.env.ALLURE_ENABLED = 'false';
  const reporter = new AllureRstestReporter({ resultsDir: resultsDir() });
  reporter.onTestRunStart();
  expect(listFiles()).toEqual([]);
});

test('a nested run with ALLURE_ENABLED=false produces no results', async () => {
  const { tests } = await runRstestInlineTest(
    {
      'spec/x.test.ts': `
        import { test, expect } from "@rstest/core";
        test("t", () => { expect(1).toBe(1); });
      `,
    },
    { env: () => ({ ALLURE_ENABLED: 'false' }) },
  );

  expect(tests).toEqual([]);
});