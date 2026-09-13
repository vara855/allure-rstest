import { setGlobalTestRuntime } from 'allure-js-commons/sdk/runtime';
import { beforeAll } from '@rstest/core';

import { RstestBrowserTestRuntime } from '../RstestBrowserTestRuntime.js';

beforeAll(() => {
  setGlobalTestRuntime(new RstestBrowserTestRuntime());
});