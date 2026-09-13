import { describe, expect, test } from '@rstest/core';
import { Allure, allureMeta, attachment, component, feature, step } from 'allure-rstest';

test('runtime api', async () => {
  await feature('Checkout');
  await component('billing-api');

  await step('create the order', async (ctx) => {
    await ctx.parameter('currency', 'EUR');
  });

  await attachment('payload', JSON.stringify({ ok: true }), 'application/json');

  expect(1).toBe(1);
});

describe('Billing', { meta: allureMeta({ epic: 'Payments' }) }, () => {
  test(
    'declarative meta',
    {
      meta: allureMeta({
        feature: 'Checkout',
        severity: 'critical',
        owner: 'team-payments',
        tags: ['smoke'],
        links: { issue: 'AE-123' },
      }),
    },
    async () => {
      await Allure.step('verify the total', () => {});
      expect('abc').toContain('b');
    },
  );
});

test('matcher steps', () => {
  expect(1).toBe(1);
  expect([1, 2, 3]).toHaveLength(3);
  expect('hello').toContain('ell');
});

test('failing test', () => {
  expect(1).toBe(2);
});

test.skip('skipped test', () => {
  expect(true).toBe(true);
});