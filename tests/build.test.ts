import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from '@rstest/core';

const ENTRIES = ['index', 'sync', 'setup', 'reporter', 'browser/index', 'browser/setup'];

describe('build output', () => {
  test.each(ENTRIES)('emits %s.js', (entry) => {
    expect(existsSync(resolve(process.cwd(), `dist/${entry}.js`))).toBe(true);
  });

  test.each(ENTRIES)('emits %s.d.ts', (entry) => {
    expect(existsSync(resolve(process.cwd(), `dist/${entry}.d.ts`))).toBe(true);
  });
});
