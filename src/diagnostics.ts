import { createRequire } from 'node:module';

/** Version of @rstest/core the internal details contract is pinned to. */
export const PINNED_RSTEST_VERSION = '0.11.12';

export const MISSING_SETUP_MESSAGE =
  'allure-rstest: no test reported a connected setup file. ' +
  'Add setupFiles: ["allure-rstest/setup"] to rstest.config — without it steps, ' +
  'attachments and metadata will not reach the report.';

const readRstestVersion = (): string | undefined => {
  try {
    return createRequire(import.meta.url)('@rstest/core/package.json').version as string;
  } catch {
    return undefined;
  }
};

/**
 * The wrapper relies on undocumented rstest internals (globalThis["@rstest/core"]),
 * so a minor version mismatch is worth warning about upfront.
 */
export const assertSupportedRstestVersion = (): void => {
  const version = readRstestVersion();

  if (!version) {
    return;
  }

  const [major, minor] = version.split('.');
  const [pinnedMajor, pinnedMinor] = PINNED_RSTEST_VERSION.split('.');

  if (major !== pinnedMajor || minor !== pinnedMinor) {
    // eslint-disable-next-line no-console
    console.warn(
      `allure-rstest: found @rstest/core@${version}, while the integration is verified against ` +
        `${PINNED_RSTEST_VERSION}. If steps or metadata are missing, this is the first thing to check.`,
    );
  }
};