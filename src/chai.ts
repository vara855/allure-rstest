import { expect } from '@rstest/core';

type Flagged = { __flags?: Record<string, unknown> };

/**
 * Local replacement for chai.util.flag: in chai this is exactly access to obj.__flags.
 * rstest bundles chai internally and does not expose it, so we read the flags directly.
 */
export function flag(obj: unknown, key: string, ...rest: [unknown?]): unknown {
  const flags = ((obj as Flagged).__flags ??= {});

  if (rest.length) {
    flags[key] = rest[0];

    return undefined;
  }

  return flags[key];
}

export const getAssertionPrototype = (): Record<PropertyKey, unknown> =>
  Object.getPrototypeOf(expect(null)) as Record<PropertyKey, unknown>;

export const getExpectStatic = (): Record<PropertyKey, unknown> =>
  expect as unknown as Record<PropertyKey, unknown>;