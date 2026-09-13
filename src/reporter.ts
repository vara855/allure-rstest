import { LabelName, Stage, Status, type Label, type StatusDetails } from 'allure-js-commons';
import type { RuntimeMessage } from 'allure-js-commons/sdk';
import { getMessageAndTraceFromError, getStatusFromError } from 'allure-js-commons/sdk';
import type { ReporterConfig } from 'allure-js-commons/sdk/reporter';
import {
  ReporterRuntime,
  createDefaultWriter,
  getEnvironmentLabels,
  getFallbackTestCaseIdLabel,
  getFrameworkLabel,
  getHostLabel,
  getLanguageLabel,
  getPackageLabel,
  getSuiteLabels,
  getThreadLabel,
  md5,
} from 'allure-js-commons/sdk/reporter';
import type { Reporter, TestCaseInfo, TestResult } from '@rstest/core';

import {
  ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY,
  ALLURE_RUNTIME_MESSAGES_META_KEY,
  ALLURE_SKIP_META_KEY,
  ALLURE_THREAD_META_KEY,
} from './runtime.js';
import { readAllureMeta, toRuntimeMessages } from './meta.js';
import { getTestMetadata } from './utils.js';

export type AllureRstestReporterConfig = ReporterConfig & { reportMatchers?: boolean };

export default class AllureRstestReporter implements Reporter {
  readonly flushOutputStreams = false;
  #runtime: ReporterRuntime;
  #startTimes = new Map<string, number>();
  #globalMessages: RuntimeMessage[] = [];

  constructor(config: AllureRstestReporterConfig = {}) {
    const { listeners, resultsDir, reportMatchers: _reportMatchers, ...rest } = config;
    this.#runtime = new ReporterRuntime({
      ...rest,
      writer: createDefaultWriter({ resultsDir }),
      listeners,
    });
  }

  onTestRunStart(): void {
    this.#runtime.writeCategoriesDefinitions();
    this.#runtime.writeEnvironmentInfo();
    this.#startTimes.clear();
    this.#globalMessages = [];
  }

  onTestCaseStart(test: TestCaseInfo): void {
    if (test.startTime !== undefined) this.#startTimes.set(test.testId, test.startTime);
  }

  onTestCaseResult(result: TestResult): void {
    const meta = (result.meta ?? {}) as Record<string, unknown>;
    if (meta[ALLURE_SKIP_META_KEY] === true) return;

    const globalMessages = meta[ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY];
    if (Array.isArray(globalMessages)) this.#globalMessages.push(...globalMessages);

    const { projectName, specPath, fullName, legacyFullName, name, suitePath, labels, links } =
      getTestMetadata(result);
    const uuid = this.#runtime.startTest({ name, start: this.#startTimes.get(result.testId) });

    this.#runtime.updateTest(uuid, (test) => {
      const titlePath = [...specPath.split('/'), ...suitePath];
      test.fullName = fullName;
      test.titlePath = projectName ? [projectName, ...titlePath] : titlePath;
      test.labels.push(getFrameworkLabel('rstest'));
      test.labels.push(getLanguageLabel());
      test.labels.push(...labels);
      test.labels.push(...getSuiteLabels(suitePath));
      test.labels.push(...getEnvironmentLabels());
      test.labels.push(getHostLabel());
      test.labels.push(getThreadLabel(toThreadName(meta[ALLURE_THREAD_META_KEY])));
      test.labels.push(getFallbackTestCaseIdLabel(md5(legacyFullName)));
      test.labels.push(getPackageLabel(result.testPath));
      test.links.push(...links);
      if (result.project) test.parameters.push({ name: 'project', value: result.project });
      if (result.retryCount)
        test.parameters.push({ name: 'retry', value: String(result.retryCount), excluded: true });
      applyStatus(test, result);
    });

    const runtimeMessages = meta[ALLURE_RUNTIME_MESSAGES_META_KEY];
    const messages = [
      ...toRuntimeMessages(readAllureMeta(meta) ?? {}),
      ...(Array.isArray(runtimeMessages) ? runtimeMessages : []),
    ];
    if (messages.length) this.#runtime.applyRuntimeMessages(uuid, messages);
    this.#runtime.updateTest(uuid, (test) => normalizeSingleLabels(test));
    this.#runtime.stopTest(uuid, { duration: result.duration ?? 0 });
    this.#runtime.writeTest(uuid);
  }

  onTestRunEnd(): void {
    if (this.#globalMessages.length) this.#runtime.applyGlobalRuntimeMessages(this.#globalMessages);
    this.#globalMessages = [];
  }

  onTestSuiteResult(result: TestResult): void {
    const messages = (result.errors ?? []).map(
      (error): RuntimeMessage => ({
        type: 'global_error',
        data: {
          ...getMessageAndTraceFromError(error),
          message: error.message
            ? `${result.name} hook failed: ${error.message}`
            : `${result.name} hook failed`,
        },
      }),
    );
    if (messages.length) this.#runtime.applyGlobalRuntimeMessages(messages);
  }
}

const toThreadName = (workerId: unknown): string | undefined =>
  typeof workerId === 'string' || typeof workerId === 'number'
    ? `rstest-worker-${workerId}`
    : undefined;

const applyStatus = (
  test: { status?: Status; stage: Stage; statusDetails: StatusDetails },
  result: TestResult,
): void => {
  if (result.status === 'pass') {
    test.status = Status.PASSED;
    test.stage = Stage.FINISHED;
  } else if (result.status === 'fail') {
    const [error] = result.errors ?? [];
    test.status = error ? getStatusFromError(error) : Status.BROKEN;
    test.statusDetails = error ? getMessageAndTraceFromError(error) : {};
    test.stage = Stage.FINISHED;
  } else {
    test.status = Status.SKIPPED;
    test.stage = Stage.PENDING;
  }
};

const SINGLE_LABELS = new Set<string>([
  LabelName.SEVERITY,
  LabelName.OWNER,
  LabelName.LEAD,
  LabelName.ALLURE_ID,
  LabelName.PARENT_SUITE,
  LabelName.SUITE,
  LabelName.SUB_SUITE,
]);

const normalizeSingleLabels = (test: { labels: Label[] }): void => {
  test.labels = test.labels.filter(({ name }, index, labels) => {
    if (!SINGLE_LABELS.has(name)) return true;
    return !labels.slice(index + 1).some((label) => label.name === name);
  });
};
