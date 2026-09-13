import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { attachment, logStep, step } from 'allure-js-commons';
import type { AllureResults } from 'allure-js-commons/sdk';
import { stripAnsi } from 'allure-js-commons/sdk';
import { setGlobalTestRuntime } from 'allure-js-commons/sdk/runtime';
import { MessageReader, getPosixPath } from 'allure-js-commons/sdk/reporter';

import { installApiWrapper } from '../src/apiWrapper.js';
import { RstestTestRuntime } from '../src/RstestTestRuntime.js';

// The harness drives the Allure facade for fixture bookkeeping, so give the outer test
// process a real runtime and current-task resolution. This keeps the root test config
// free of an allure-rstest setup and silences "no test runtime is found" warnings.
installApiWrapper();
setGlobalTestRuntime(new RstestTestRuntime());

const require_ = createRequire(import.meta.url);
const fileDirname = dirname(fileURLToPath(import.meta.url));
const distDir = getPosixPath(join(fileDirname, '..', 'dist'));

export const setupModulePath = `${distDir}/setup.js`;
export const reporterModulePath = `${distDir}/reporter.js`;
export const browserSetupModulePath = `${distDir}/browser/setup.js`;

export type TestFiles = Record<string, string>;

export type RunOpts = {
  env?: (testDir: string) => Record<string, string>;
  reporterOptions?: string;
  browser?: boolean;
  withoutSetup?: boolean;
};

export const createRstestConfig = (
  allureResultsPath: string,
  { reporterOptions = '', browser = false, withoutSetup = false }: RunOpts = {},
): string => {
  const setupPath = browser ? browserSetupModulePath : setupModulePath;
  const setupLine = withoutSetup ? '' : `setupFiles: ["${setupPath}"],`;
  const browserBlock = browser
    ? 'browser: { provider: "playwright", enabled: true, headless: true },'
    : '';

  return `
import { defineConfig } from "@rstest/core";
import AllureRstestReporter from "${reporterModulePath}";

export default defineConfig({
  include: ["spec/**/*.test.ts"],
  ${setupLine}
  ${browserBlock}
  resolve: { alias: {
    "allure-rstest/sync": "${distDir}/sync.js",
    "allure-rstest": "${distDir}/index.js",
  } },
  reporters: [new AllureRstestReporter({
    resultsDir: "${allureResultsPath}",
    links: {
      issue: { urlTemplate: "https://example.org/issue/%s" },
      tms: { urlTemplate: "https://example.org/tms/%s" },
    },
    ${reporterOptions}
  })],
});
`;
};

export type RunResult = AllureResults & {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export const runRstestInlineTest = async (
  testFiles: TestFiles,
  opts: RunOpts = {},
): Promise<RunResult> => {
  const { env = () => ({}) } = opts;
  const testDir = join(fileDirname, 'fixtures', randomUUID());
  const allureResultsPath = getPosixPath(join(testDir, 'allure-results'));
  const filesToWrite: TestFiles = {
    'rstest.config.ts': createRstestConfig(allureResultsPath, opts),
    'package.json': JSON.stringify({ name: 'dummy', type: 'module' }),
    ...testFiles,
  };

  await step('create test directory', () => mkdir(testDir, { recursive: true }));
  for (const [name, content] of Object.entries(filesToWrite)) {
    await step(`write test file "${name}"`, async () => {
      const filePath = join(testDir, name);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
      await attachment(name, content, {
        contentType: 'text/plain',
        encoding: 'utf-8',
        fileExtension: extname(name),
      });
    });
  }

  const modulePath = join(dirname(require_.resolve('@rstest/core/package.json')), 'bin/rstest.js');
  const args = ['run', '--config', join(testDir, 'rstest.config.ts'), '--root', testDir];
  const testProcess = await step(`${modulePath} ${args.join(' ')}`, () =>
    fork(modulePath, args, {
      env: { ...process.env, ALLURE_TEST_MODE: '1', ...env(testDir) },
      cwd: testDir,
      stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
    }),
  );
  const messageReader = new MessageReader();
  const stdout: string[] = [];
  const stderr: string[] = [];

  testProcess.on('message', messageReader.handleMessage);
  testProcess.stdout?.setEncoding('utf8').on('data', (chunk) => stdout.push(stripAnsi(String(chunk))));
  testProcess.stderr?.setEncoding('utf8').on('data', (chunk) => stderr.push(stripAnsi(String(chunk))));

  return new Promise((resolve) => {
    testProcess.on('exit', async (code, signal) => {
      if (signal) await logStep(`Interrupted with ${signal}`);
      if (code) await logStep(`Exit code: ${code}`);
      await attachment('stdout', stdout.join('\n'), 'text/plain');
      await attachment('stderr', stderr.join('\n'), 'text/plain');
      await rm(testDir, { recursive: true, maxRetries: 3, retryDelay: 1000 });
      await messageReader.attachResults();
      resolve({
        ...messageReader.results,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n'),
        exitCode: code,
      });
    });
  });
};
