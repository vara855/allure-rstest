import { LabelName, type Label, type Link, type Parameter, type Severity } from 'allure-js-commons';
import type { RuntimeMessage } from 'allure-js-commons/sdk';

export const ALLURE_META_KEY = 'allure';

type AllureMetaLabel = { name: string; value: string };
type AllureMetaLink = { name?: string; url: string; type?: string };
type AllureMetaParameter = { name: string; value: string };

export type AllureMeta = {
  displayName?: string;
  description?: string;
  descriptionHtml?: string;
  severity?: Severity | string;
  owner?: string;
  lead?: string;
  allureId?: string;
  historyId?: string;
  testCaseId?: string;
  parentSuite?: string;
  suite?: string;
  subSuite?: string;
  epic?: string | string[];
  feature?: string | string[];
  story?: string | string[];
  component?: string | string[];
  layer?: string | string[];
  tags?: string[];
  labels?: Record<string, string | string[]> | AllureMetaLabel[];
  links?: Record<string, string | string[]> | AllureMetaLink[];
  parameters?: Record<string, string> | AllureMetaParameter[];
};

/**
 * Declarative metadata for `test`/`describe` `meta`. rstest types `meta` as the loose
 * `Record<string, TaskMetaValue>` alias, so use this helper to get compile-time checking
 * of Allure keys (`severity`, `owner`, `tags`, ...) instead of writing the raw object.
 */
export const allureMeta = (meta: AllureMeta): { [ALLURE_META_KEY]: AllureMeta } => ({
  [ALLURE_META_KEY]: meta,
});

const SINGLE_LABELS: ReadonlyArray<[keyof AllureMeta, string]> = [
  ['severity', LabelName.SEVERITY],
  ['owner', LabelName.OWNER],
  ['lead', LabelName.LEAD],
  ['allureId', LabelName.ALLURE_ID],
  ['parentSuite', LabelName.PARENT_SUITE],
  ['suite', LabelName.SUITE],
  ['subSuite', LabelName.SUB_SUITE],
];
const MULTI_LABELS: ReadonlyArray<[keyof AllureMeta, string]> = [
  ['epic', LabelName.EPIC],
  ['feature', LabelName.FEATURE],
  ['story', LabelName.STORY],
  ['component', 'component'],
  ['layer', LabelName.LAYER],
];
const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const collectLabels = (meta: AllureMeta): Label[] => {
  const labels: Label[] = [];
  for (const [key, name] of MULTI_LABELS)
    for (const value of toArray(meta[key] as string | string[] | undefined))
      labels.push({ name, value });
  for (const [key, name] of SINGLE_LABELS) {
    const value = meta[key];
    if (typeof value === 'string') labels.push({ name, value });
  }
  for (const value of meta.tags ?? []) labels.push({ name: LabelName.TAG, value });
  if (Array.isArray(meta.labels)) labels.push(...meta.labels);
  else
    for (const [name, value] of Object.entries(meta.labels ?? {}))
      for (const item of toArray(value)) labels.push({ name, value: item });
  return labels;
};

const collectLinks = (meta: AllureMeta): Link[] =>
  Array.isArray(meta.links)
    ? meta.links
    : Object.entries(meta.links ?? {}).flatMap(([type, value]) =>
        toArray(value).map((url) => ({ type, url })),
      );

const collectParameters = (meta: AllureMeta): Parameter[] =>
  Array.isArray(meta.parameters)
    ? meta.parameters
    : Object.entries(meta.parameters ?? {}).map(([name, value]) => ({ name, value }));

export const toRuntimeMessages = (meta: AllureMeta): RuntimeMessage[] => {
  const labels = collectLabels(meta);
  const links = collectLinks(meta);
  const parameters = collectParameters(meta);
  const data = {
    ...(labels.length ? { labels } : {}),
    ...(links.length ? { links } : {}),
    ...(parameters.length ? { parameters } : {}),
    ...(meta.description === undefined ? {} : { description: meta.description }),
    ...(meta.descriptionHtml === undefined ? {} : { descriptionHtml: meta.descriptionHtml }),
    ...(meta.displayName === undefined ? {} : { displayName: meta.displayName }),
    ...(meta.historyId === undefined ? {} : { historyId: meta.historyId }),
    ...(meta.testCaseId === undefined ? {} : { testCaseId: meta.testCaseId }),
  };
  return Object.keys(data).length ? [{ type: 'metadata', data }] : [];
};

export const readAllureMeta = (meta: Record<string, unknown> | undefined): AllureMeta | undefined => {
  const value = meta?.[ALLURE_META_KEY];
  return value && typeof value === 'object' ? (value as AllureMeta) : undefined;
};
