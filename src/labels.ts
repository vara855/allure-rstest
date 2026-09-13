import { label, labels } from 'allure-js-commons';

/**
 * `component` не входит в LabelName и не участвует в формировании вкладки Behaviors —
 * это обычная метка, по которой можно группировать и фильтровать.
 */
export const component = (name: string) => label('component', name);

export const components = (...names: string[]) =>
  labels(...names.map((value) => ({ name: 'component', value })));

/** Фабрика для собственных меток проекта: const squad = customLabel("squad"). */
export const customLabel = (name: string) => (value: string) => label(name, value);