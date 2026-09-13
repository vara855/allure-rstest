import * as commons from 'allure-js-commons';

import * as rstestLabels from './labels.js';

export {
  allureId,
  attachTrace,
  attachment,
  attachmentPath,
  description,
  descriptionHtml,
  displayName,
  epic,
  feature,
  globalAttachment,
  globalAttachmentPath,
  globalError,
  historyId,
  issue,
  label,
  labels,
  layer,
  link,
  links,
  logStep,
  owner,
  parameter,
  parentSuite,
  severity,
  step,
  story,
  subSuite,
  suite,
  tag,
  tags,
  testCaseId,
  tms,
} from 'allure-js-commons';

export {
  ContentType,
  LabelName,
  LinkType,
  Severity,
  Stage,
  Status,
  type AttachmentOptions,
  type Label,
  type Link,
  type Parameter,
  type StatusDetails,
  type StepContext,
} from 'allure-js-commons';

export { component, components, customLabel } from './labels.js';
export { type AllureMeta, allureMeta } from './meta.js';
export type { AllureRstestLegacyApi } from './legacy.js';

declare global {
  // eslint-disable-next-line no-var
  var allure: import('./legacy.js').AllureRstestLegacyApi;
}

/** Тот же набор функций, доступный одним объектом: Allure.feature(...). */
export const Allure = {
  allureId: commons.allureId,
  attachTrace: commons.attachTrace,
  attachment: commons.attachment,
  attachmentPath: commons.attachmentPath,
  description: commons.description,
  descriptionHtml: commons.descriptionHtml,
  displayName: commons.displayName,
  epic: commons.epic,
  feature: commons.feature,
  globalAttachment: commons.globalAttachment,
  globalAttachmentPath: commons.globalAttachmentPath,
  globalError: commons.globalError,
  historyId: commons.historyId,
  issue: commons.issue,
  label: commons.label,
  labels: commons.labels,
  layer: commons.layer,
  link: commons.link,
  links: commons.links,
  logStep: commons.logStep,
  owner: commons.owner,
  parameter: commons.parameter,
  parentSuite: commons.parentSuite,
  severity: commons.severity,
  step: commons.step,
  story: commons.story,
  subSuite: commons.subSuite,
  suite: commons.suite,
  tag: commons.tag,
  tags: commons.tags,
  testCaseId: commons.testCaseId,
  tms: commons.tms,
  ...rstestLabels,
} as const;