import { describe, expect, test } from '@rstest/core';
import { getCurrentTask } from '../../src/currentTask.js';

const resolved = () => Boolean(getCurrentTask()?.id);

test('plain test', () => expect(resolved()).toBe(true));

test('async test', async () => {
  await Promise.resolve();
  expect(resolved()).toBe(true);
});

test.concurrent('concurrent test', async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(resolved()).toBe(true);
});

test.each([1, 2])('each %i', async () => {
  await Promise.resolve();
  expect(resolved()).toBe(true);
});

test.concurrent.each([1, 2])('concurrent each %i', async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(resolved()).toBe(true);
});

test.for([1, 2])('for %i', async () => {
  await Promise.resolve();
  expect(resolved()).toBe(true);
});

test.each`
  a    | b
  ${1} | ${2}
`('template each $a', () => expect(resolved()).toBe(true));

test('retried test', { retry: 1 }, () => expect(resolved()).toBe(true));

describe('nested suite', () => {
  test('inside describe', () => expect(resolved()).toBe(true));
  describe('deeper', () => {
    test('two levels deep', () => expect(resolved()).toBe(true));
  });
});

test.skip('skipped test never runs', () => {
  throw new Error('must not run');
});

test('wrapper is idempotent', async () => {
  const { installApiWrapper } = await import('../../src/apiWrapper.js');
  const api = (globalThis as unknown as Record<string, { test: unknown }>)['@rstest/core'];
  const before = api.test;
  installApiWrapper();
  expect(api.test).toBe(before);
});
