import * as allure from 'allure-js-commons';

/** @deprecated use the api exported from "allure-rstest". */
export interface AllureRstestLegacyApi {
  label: (name: string, value: string) => Promise<void>;
  link: (type: string, url: string, name?: string) => Promise<void>;
  parameter: (
    name: string,
    value: string,
    options?: { excluded?: boolean; mode?: 'hidden' | 'masked' | 'default' },
  ) => Promise<void>;
  description: (markdown: string) => Promise<void>;
  descriptionHtml: (html: string) => Promise<void>;
  testCaseId: (id: string) => Promise<void>;
  historyId: (id: string) => Promise<void>;
  allureId: (id: string) => Promise<void>;
  displayName: (name: string) => Promise<void>;
  attachment: (name: string, content: Buffer | string, type: string) => Promise<void>;
  issue: (name: string, url: string) => Promise<void>;
  tms: (name: string, url: string) => Promise<void>;
  epic: (name: string) => Promise<void>;
  feature: (name: string) => Promise<void>;
  story: (name: string) => Promise<void>;
  suite: (name: string) => Promise<void>;
  parentSuite: (name: string) => Promise<void>;
  subSuite: (name: string) => Promise<void>;
  owner: (name: string) => Promise<void>;
  severity: (name: string) => Promise<void>;
  layer: (name: string) => Promise<void>;
  tag: (name: string) => Promise<void>;
  step: (name: string, body: () => Promise<void>) => Promise<void>;
}

/** @deprecated use the api exported from "allure-rstest". */
export const allureRstestLegacyApi: AllureRstestLegacyApi = {
  label: (...args) => Promise.resolve(allure.label(...args)),
  link: (type, url, name) => Promise.resolve(allure.link(url, name, type)),
  parameter: (name, value, options) => Promise.resolve(allure.parameter(name, value, options)),
  description: (...args) => Promise.resolve(allure.description(...args)),
  descriptionHtml: (html) => Promise.resolve(allure.descriptionHtml(html)),
  testCaseId: (id) => Promise.resolve(allure.testCaseId(id)),
  historyId: (id) => Promise.resolve(allure.historyId(id)),
  allureId: (id) => Promise.resolve(allure.allureId(id)),
  displayName: (name) => Promise.resolve(allure.displayName(name)),
  attachment: (name, content, type) =>
    Promise.resolve(allure.attachment(name, content, { contentType: type })),
  issue: (name, url) => Promise.resolve(allure.issue(url, name)),
  tms: (name, url) => Promise.resolve(allure.tms(url, name)),
  epic: (name) => Promise.resolve(allure.epic(name)),
  feature: (name) => Promise.resolve(allure.feature(name)),
  story: (name) => Promise.resolve(allure.story(name)),
  suite: (name) => Promise.resolve(allure.suite(name)),
  parentSuite: (name) => Promise.resolve(allure.parentSuite(name)),
  subSuite: (name) => Promise.resolve(allure.subSuite(name)),
  owner: (name) => Promise.resolve(allure.owner(name)),
  severity: (name) => Promise.resolve(allure.severity(name)),
  layer: (name) => Promise.resolve(allure.layer(name)),
  tag: (name) => Promise.resolve(allure.tag(name)),
  step: (name, body) => Promise.resolve(allure.step(name, body)),
};

const noop = () => Promise.resolve();

/**
 * Inert implementation of the legacy global, installed when the integration is disabled so
 * code using `globalThis.allure` keeps working (no-op instead of `undefined`).
 */
export const allureRstestNoopLegacyApi: AllureRstestLegacyApi = {
  label: noop,
  link: noop,
  parameter: noop,
  description: noop,
  descriptionHtml: noop,
  testCaseId: noop,
  historyId: noop,
  allureId: noop,
  displayName: noop,
  attachment: noop,
  issue: noop,
  tms: noop,
  epic: noop,
  feature: noop,
  story: noop,
  suite: noop,
  parentSuite: noop,
  subSuite: noop,
  owner: noop,
  severity: noop,
  layer: noop,
  tag: noop,
  step: noop,
};