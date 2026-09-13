import { AsyncLocalStorage } from 'node:async_hooks';

export type RstestTask = {
  id: string;
  name: string;
  filepath?: string;
  projectRoot?: string;
  retryCount: number;
  meta: Record<string, unknown>;
};

type Holder = { __allureRstestTaskStorage?: AsyncLocalStorage<RstestTask> };

const getStorage = (): AsyncLocalStorage<RstestTask> => {
  const holder = globalThis as unknown as Holder;

  return (holder.__allureRstestTaskStorage ??= new AsyncLocalStorage<RstestTask>());
};

export const runWithTask = <T>(task: RstestTask, body: () => T): T =>
  getStorage().run(task, body);

export const getCurrentTask = (): RstestTask | undefined => getStorage().getStore();
