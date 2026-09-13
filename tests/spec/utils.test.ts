import { describe, expect, test } from '@rstest/core';
import { existsInTestPlan, getSuitePath, getTestMetadata } from '../../src/utils.js';

describe('getSuitePath', () => {
  test('filters internal and unnamed suites', () => {
    expect(getSuitePath(['Rstest:_internal_root_suite', '', 'Billing'])).toEqual(['Billing']);
  });
});

test('builds metadata and extracts title labels', () => {
  const meta = getTestMetadata({
    name: 'charges @allure.id:42 @allure.label.feature:Checkout',
    testPath: `${process.cwd()}/tests/spec/billing.test.ts`,
    parentNames: ['Rstest:_internal_root_suite', 'Billing'],
    project: 'unit',
  });
  expect(meta.fullName).toBe('unit:tests/spec/billing.test.ts#Billing charges');
  expect(meta.labels).toEqual(
    expect.arrayContaining([
      { name: 'ALLURE_ID', value: '42' },
      { name: 'feature', value: 'Checkout' },
    ]),
  );
});

test('matches a test plan by allure id', () => {
  const subject = { name: 'charges @allure.id:42', testPath: 'billing.test.ts' };
  expect(existsInTestPlan(subject)).toBe(true);
  expect(existsInTestPlan(subject, { version: '1.0', tests: [{ id: 42 }] })).toBe(true);
  expect(existsInTestPlan(subject, { version: '1.0', tests: [{ id: 7 }] })).toBe(false);
});
