import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from '@rstest/core';
import AllureRstestReporter from '../../src/reporter.js';

let tempDir: string | undefined;

const resultsDir = () => (tempDir = mkdtempSync(join(tmpdir(), 'ar-clean-')));

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

test('removes stale allure artifacts at run start by default', () => {
  const dir = resultsDir();
  writeFileSync(join(dir, 'stale-result.json'), '{}');
  writeFileSync(join(dir, 'stale-container.json'), '{}');
  writeFileSync(join(dir, 'stale-attachment.txt'), 'x');
  writeFileSync(join(dir, 'stale-globals.json'), '{}');
  writeFileSync(join(dir, 'keep.txt'), 'x');

  const reporter = new AllureRstestReporter({ resultsDir: dir });
  reporter.onTestRunStart();

  expect(existsSync(join(dir, 'stale-result.json'))).toBe(false);
  expect(existsSync(join(dir, 'stale-container.json'))).toBe(false);
  expect(existsSync(join(dir, 'stale-attachment.txt'))).toBe(false);
  expect(existsSync(join(dir, 'stale-globals.json'))).toBe(false);
  expect(existsSync(join(dir, 'keep.txt'))).toBe(true);
});

test('keeps existing results when cleanResults is false', () => {
  const dir = resultsDir();
  writeFileSync(join(dir, 'stale-result.json'), '{}');

  const reporter = new AllureRstestReporter({ resultsDir: dir, cleanResults: false });
  reporter.onTestRunStart();

  expect(existsSync(join(dir, 'stale-result.json'))).toBe(true);
});

test('rejects a non-string resultsDir', () => {
  expect(() => new AllureRstestReporter({ resultsDir: 123 as unknown as string })).toThrow(
    /resultsDir/,
  );
});

test('rejects a non-boolean reportMatchers', () => {
  expect(() =>
    new AllureRstestReporter({ reportMatchers: 'yes' as unknown as boolean }),
  ).toThrow(/reportMatchers/);
});

test('rejects a non-boolean cleanResults', () => {
  expect(() => new AllureRstestReporter({ cleanResults: 'yes' as unknown as boolean })).toThrow(
    /cleanResults/,
  );
});