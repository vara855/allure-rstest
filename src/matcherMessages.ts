import type { RuntimeMessage } from 'allure-js-commons/sdk';

export const ALLURE_RSTEST_MATCHER_MESSAGE_KEY = '__allureRstestMatcher';

export type AllureRstestMatcherRuntimeMessage = RuntimeMessage & {
  [ALLURE_RSTEST_MATCHER_MESSAGE_KEY]?: true;
};

export const markAsMatcherMessage = <T extends RuntimeMessage>(
  message: T,
): T & AllureRstestMatcherRuntimeMessage =>
  ({ ...message, [ALLURE_RSTEST_MATCHER_MESSAGE_KEY]: true }) as T &
    AllureRstestMatcherRuntimeMessage;

export const isMatcherMessage = (message: RuntimeMessage): boolean =>
  Boolean((message as AllureRstestMatcherRuntimeMessage)[ALLURE_RSTEST_MATCHER_MESSAGE_KEY]);