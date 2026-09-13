import { type RstestTask, runWithTask } from './currentTask.js';

const RSTEST_API_GLOBAL_KEY = '@rstest/core';
const EACH_CONTEXT = Symbol.for('rstest.test.each.context');
const WRAPPED = Symbol.for('allure.rstest.wrapped');
const MAX_DEPTH = 4;

type AnyFn = ((...args: unknown[]) => unknown) & Record<PropertyKey, unknown>;
type TestContextLike = { task?: RstestTask };

const isWrapped = (value: AnyFn) => Boolean(value[WRAPPED]);

const markWrapped = <T extends AnyFn>(value: T): T => {
  Object.defineProperty(value, WRAPPED, { value: true });
  return value;
};

const isContext = (value: unknown): value is TestContextLike =>
  typeof value === 'function' && Boolean((value as unknown as TestContextLike).task?.id);

const wrapBody = (fn: AnyFn): AnyFn => {
  if (isWrapped(fn)) return fn;

  const wrapped = markWrapped(function (this: unknown, ...args: unknown[]) {
    const ctx = args.find(isContext);
    return ctx?.task ? runWithTask(ctx.task, () => fn.apply(this, args)) : fn.apply(this, args);
  } as AnyFn);

  Object.defineProperty(wrapped, EACH_CONTEXT, { value: true });
  return wrapped;
};

const wrapCall = (fn: AnyFn, cache: WeakMap<AnyFn, AnyFn>, depth: number): AnyFn => {
  const cached = cache.get(fn);
  if (cached) return cached;
  if (isWrapped(fn) || depth > MAX_DEPTH) return fn;

  const wrapped = markWrapped(function (this: unknown, ...args: unknown[]) {
    const mapped = args.map((arg) => (typeof arg === 'function' ? wrapBody(arg as AnyFn) : arg));
    const result = fn.apply(this, mapped);
    return typeof result === 'function' ? wrapCall(result as AnyFn, cache, depth + 1) : result;
  } as AnyFn);

  cache.set(fn, wrapped);
  for (const key of Reflect.ownKeys(fn)) {
    if (key === 'length' || key === 'name' || key === 'prototype' || key === WRAPPED) continue;
    const descriptor = Object.getOwnPropertyDescriptor(fn, key);
    if (!descriptor) continue;

    if (descriptor.get) {
      Object.defineProperty(wrapped, key, {
        ...descriptor,
        get: () => {
          const value = descriptor.get?.call(fn);
          return typeof value === 'function' ? wrapCall(value as AnyFn, cache, depth + 1) : value;
        },
      });
      continue;
    }

    if (descriptor.set) continue;
    Object.defineProperty(wrapped, key, {
      ...descriptor,
      value:
        typeof descriptor.value === 'function'
          ? wrapCall(descriptor.value as AnyFn, cache, depth + 1)
          : descriptor.value,
    });
  }
  return wrapped;
};

export const installApiWrapper = (): void => {
  const api = (globalThis as unknown as Record<string, Record<string, unknown> | undefined>)[
    RSTEST_API_GLOBAL_KEY
  ];

  if (!api || typeof api.test !== 'function' || typeof api.it !== 'function') {
    throw new Error(
      'allure-rstest: the global Rstest API was not found. ' +
        'Ensure "allure-rstest/setup" is configured in rstest.config setupFiles ' +
        'and @rstest/core is version 0.11.12 or newer.',
    );
  }

  const cache = new WeakMap<AnyFn, AnyFn>();
  api.test = wrapCall(api.test as AnyFn, cache, 0);
  api.it = wrapCall(api.it as AnyFn, cache, 0);
};
