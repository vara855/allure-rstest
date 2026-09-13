import { setGlobalTestRuntime } from 'allure-js-commons/sdk/runtime';
import { beforeAll, beforeEach } from '@rstest/core';

import { installApiWrapper } from './apiWrapper.js';
import type { RstestTask } from './currentTask.js';
import { RstestTestRuntime } from './RstestTestRuntime.js';
import { ALLURE_SETUP_FLAG_META_KEY, ALLURE_THREAD_META_KEY, resetMessages } from './runtime.js';

installApiWrapper();

beforeAll(() => setGlobalTestRuntime(new RstestTestRuntime()));

beforeEach((ctx) => {
  const task = ctx.task as RstestTask;
  resetMessages(task);
  task.meta[ALLURE_SETUP_FLAG_META_KEY] = true;
  task.meta[ALLURE_THREAD_META_KEY] = process.env.RSTEST_WORKER_ID ?? null;
});
