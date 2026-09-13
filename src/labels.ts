import { label, labels } from 'allure-js-commons';

/**
 * `component` is not part of LabelName and does not feed the Behaviors tab —
 * it is a plain label used for grouping and filtering.
 */
export const component = (name: string) => label('component', name);

export const components = (...names: string[]) =>
  labels(...names.map((value) => ({ name: 'component', value })));

/** Factory for project-specific labels: const squad = customLabel("squad"). */
export const customLabel = (name: string) => (value: string) => label(name, value);