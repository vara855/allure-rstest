import { attachment, feature, label, step } from 'allure-js-commons';
import type { RuntimeMessage } from 'allure-js-commons/sdk';
import { describe, expect, test } from '@rstest/core';
import { isMatcherMessage } from '../../src/matcherMessages.js';
import { ALLURE_RUNTIME_MESSAGES_META_KEY } from '../../src/runtime.js';

const messages = (ctx: { task: { meta: Record<string, unknown> } }): RuntimeMessage[] =>
  ((ctx.task.meta[ALLURE_RUNTIME_MESSAGES_META_KEY] as RuntimeMessage[] | undefined) ?? []).filter(
    (message) => !isMatcherMessage(message),
  );

test('metadata message lands in task.meta', async (ctx) => {
  await feature('Checkout');
  expect(messages(ctx)).toEqual([
    { type: 'metadata', data: { labels: [{ name: 'feature', value: 'Checkout' }] } },
  ]);
});

test('step produces start and stop messages', async (ctx) => {
  await step('do a thing', () => {});
  expect(messages(ctx).map((message) => message.type)).toEqual(['step_start', 'step_stop']);
});

test('attachment is base64-encoded', async (ctx) => {
  await attachment('payload', '{"a":1}', 'application/json');
  const [message] = messages(ctx);
  expect(message.type).toBe('attachment_content');
  if (message.type !== 'attachment_content') return;
  expect(message.data.encoding).toBe('base64');
  expect(Buffer.from(message.data.content, 'base64').toString()).toBe('{"a":1}');
});

describe('suite with inherited meta', { meta: { shared: 'yes' } }, () => {
  test('first test accumulates only its own messages', async (ctx) => {
    await label('who', 'first');
    expect(messages(ctx)).toHaveLength(1);
  });

  test('second test does not see the first test messages', async (ctx) => {
    await label('who', 'second');
    expect(messages(ctx)).toEqual([
      { type: 'metadata', data: { labels: [{ name: 'who', value: 'second' }] } },
    ]);
  });
});
