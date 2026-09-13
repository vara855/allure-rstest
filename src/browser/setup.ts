import { setGlobalTestRuntime } from 'allure-js-commons/sdk/runtime';
import { beforeAll } from '@rstest/core';

import { RstestBrowserTestRuntime } from '../RstestBrowserTestRuntime.js';
import { isAllureDisabled } from '../env.js';

if (!isAllureDisabled()) {
  beforeAll(() => {
    setGlobalTestRuntime(new RstestBrowserTestRuntime());
  });
}