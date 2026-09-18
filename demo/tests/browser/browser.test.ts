import { page } from '@rstest/browser';
import { expect, test } from '@rstest/core';
import { attachment, feature, step } from 'allure-rstest';

// Browser mode runs these tests in a real Chromium instance. Per-test Allure metadata is a
// documented v1 limitation (no AsyncLocalStorage in the browser), so these tests verify that
// the Allure API stays usable without throwing and that the run produces real browser results.
test('runs the Allure API in a browser', async () => {
  await feature('Browser Mode');
  await step('query the live DOM', async () => {
    await attachment('user agent', navigator.userAgent, 'text/plain');
  });

  expect(navigator.userAgent).toContain('Chrom');
});

test('interacts with the page', async () => {
  document.body.innerHTML = `
    <button id="count-btn">Count: 0</button>
  `;

  let count = 0;
  document.getElementById('count-btn')!.addEventListener('click', (e) => {
    count++;
    (e.target as HTMLButtonElement).textContent = `Count: ${count}`;
  });

  await expect.element(page.getByRole('button', { name: 'Count: 0' })).toBeVisible();
  await page.getByRole('button', { name: 'Count: 0' }).click();
  await expect.element(page.getByText('Count: 1')).toBeVisible();
});