import type { RuntimeMessage } from 'allure-js-commons/sdk';
import { isGlobalRuntimeMessage } from 'allure-js-commons/sdk';
import { BaseMessageTestRuntime } from 'allure-js-commons/sdk/runtime';

import { type RstestTask, getCurrentTask } from './currentTask.js';

export const ALLURE_RUNTIME_MESSAGES_META_KEY = 'allureRuntimeMessages';
export const ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY = 'allureGlobalRuntimeMessages';
export const ALLURE_SETUP_FLAG_META_KEY = 'allureRstestSetup';
export const ALLURE_SKIP_META_KEY = 'allureSkip';
export const ALLURE_THREAD_META_KEY = 'allureRstestWorker';

const ORPHAN_MESSAGES_KEY = '__allureRstestOrphanMessages';

type MetaKey =
  | typeof ALLURE_RUNTIME_MESSAGES_META_KEY
  | typeof ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY;

export const resetMessages = (task: RstestTask): void => {
  task.meta[ALLURE_RUNTIME_MESSAGES_META_KEY] = [];
  task.meta[ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY] = [];
};

const pushToMeta = (task: RstestTask, key: MetaKey, message: RuntimeMessage): void => {
  const existing = task.meta[key];
  const messages = Array.isArray(existing) ? (existing as RuntimeMessage[]) : [];
  if (!Array.isArray(existing)) task.meta[key] = messages;
  messages.push(message);
};

export const takeOrphanMessages = (): RuntimeMessage[] => {
  const holder = globalThis as unknown as Record<string, RuntimeMessage[] | undefined>;
  const result = [...(holder[ORPHAN_MESSAGES_KEY] ?? [])];
  holder[ORPHAN_MESSAGES_KEY] = [];
  return result;
};

const addOrphanMessage = (message: RuntimeMessage): void => {
  const holder = globalThis as unknown as Record<string, RuntimeMessage[] | undefined>;
  (holder[ORPHAN_MESSAGES_KEY] ??= []).push(message);
};

export class BaseRstestTestRuntime extends BaseMessageTestRuntime {
  sendMessageSync(message: RuntimeMessage): void {
    const task = getCurrentTask();
    if (!task) {
      if (isGlobalRuntimeMessage(message)) addOrphanMessage(message);
      else console.error('allure-rstest: unable to resolve the current test.');
      return;
    }
    pushToMeta(
      task,
      isGlobalRuntimeMessage(message)
        ? ALLURE_GLOBAL_RUNTIME_MESSAGES_META_KEY
        : ALLURE_RUNTIME_MESSAGES_META_KEY,
      message,
    );
  }

  sendMessage(message: RuntimeMessage): Promise<void> {
    this.sendMessageSync(message);
    return Promise.resolve();
  }
}
