import { type Label, type Link, LabelName } from 'allure-js-commons';
import type { TestPlanV1 } from 'allure-js-commons/sdk';
import { extractMetadataFromString } from 'allure-js-commons/sdk';
import {
  getPosixPath,
  getProjectName,
  getRelativePath,
  includedInTestPlan,
} from 'allure-js-commons/sdk/reporter';

const ROOT_SUITE_NAME = 'Rstest:_internal_root_suite';

export type RstestTestLike = {
  name: string;
  testPath: string;
  parentNames?: string[];
  project?: string;
};

export type TestMetadata = {
  projectName?: string;
  specPath: string;
  name: string;
  suitePath: string[];
  fullName: string;
  legacyFullName: string;
  labels: Label[];
  links: Link[];
};

export const getSuitePath = (parentNames?: string[]): string[] =>
  (parentNames ?? []).filter((name) => Boolean(name) && name !== ROOT_SUITE_NAME);

export const getTestMetadata = (test: RstestTestLike): TestMetadata => {
  const suitePath = getSuitePath(test.parentNames);
  const projectName = test.project || getProjectName();
  const specPath = getPosixPath(getRelativePath(test.testPath));
  const { cleanTitle, labels, links } = extractMetadataFromString(test.name);
  const name = cleanTitle || test.name;
  const tail = suitePath.concat(name).join(' ');
  const base = projectName ? `${projectName}:${specPath}` : specPath;
  return {
    projectName,
    specPath,
    name,
    suitePath,
    fullName: `${base}#${tail}`,
    legacyFullName: `${specPath}#${tail}`,
    labels,
    links,
  };
};

export const existsInTestPlan = (test: RstestTestLike, testPlan?: TestPlanV1): boolean => {
  if (!testPlan) return true;
  const { fullName, labels } = getTestMetadata(test);
  const { value: id } = labels.find(({ name }) => name === LabelName.ALLURE_ID) ?? {};
  return includedInTestPlan(testPlan, { fullName, id });
};
