import { setGlobalTestRuntime } from 'allure-js-commons/sdk/runtime';
import { afterEach, beforeAll, beforeEach } from '@rstest/core';
import type { TestPlanV1 } from 'allure-js-commons/sdk';
import { parseTestPlan } from 'allure-js-commons/sdk/reporter';

import { installApiWrapper } from './apiWrapper.js';
import type { RstestTask } from './currentTask.js';
import { assertSupportedRstestVersion } from './diagnostics.js';
import { allureRstestLegacyApi, allureRstestNoopLegacyApi } from './legacy.js';
import { registerAllureRstestExpect } from './matchers.js';
import { RstestTestRuntime } from './RstestTestRuntime.js';
import {
  ALLURE_SETUP_FLAG_META_KEY,
  ALLURE_SKIP_META_KEY,
  ALLURE_THREAD_META_KEY,
  resetMessages,
} from './runtime.js';
import { existsInTestPlan } from './utils.js';
import { isAllureDisabled } from './env.js';

if (isAllureDisabled()) {
  (globalThis as Record<string, unknown>).allure = allureRstestNoopLegacyApi;
} else {
  assertSupportedRstestVersion();
  installApiWrapper();
  registerAllureRstestExpect();

  let testPlan: TestPlanV1 | undefined;

  beforeAll(() => {
    setGlobalTestRuntime(new RstestTestRuntime());
    testPlan = parseTestPlan();
  });

  beforeEach((ctx) => {
    const task = ctx.task as RstestTask;
    resetMessages(task);
    task.meta[ALLURE_SETUP_FLAG_META_KEY] = true;
    task.meta[ALLURE_THREAD_META_KEY] = process.env.RSTEST_WORKER_ID ?? null;
    if (
      !existsInTestPlan(
        { name: task.name, testPath: task.filepath ?? '', parentNames: undefined },
        testPlan,
      )
    ) {
      task.meta[ALLURE_SKIP_META_KEY] = true;
      ctx.skip();
    }

    (globalThis as Record<string, unknown>).allure = allureRstestLegacyApi;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).allure = undefined;
  });
}
