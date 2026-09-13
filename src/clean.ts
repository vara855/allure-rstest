import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const isAllureArtifact = (name: string): boolean =>
  name.endsWith('-result.json') ||
  name.endsWith('-container.json') ||
  name.endsWith('-globals.json') ||
  name.includes('-attachment.') ||
  name === 'environment.properties' ||
  name === 'categories.json';

/** Removes stale Allure artifacts from a results directory, leaving unrelated files intact. */
export const cleanResultsDir = (resultsDir: string): void => {
  if (!existsSync(resultsDir)) return;

  for (const name of readdirSync(resultsDir)) {
    if (isAllureArtifact(name)) unlinkSync(join(resultsDir, name));
  }
};