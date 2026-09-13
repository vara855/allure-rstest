import { label, labels } from 'allure-js-commons/sync';

export const component = (name: string): void => label('component', name);

export const components = (...names: string[]): void =>
  labels(...names.map((value) => ({ name: 'component', value })));

export const customLabel =
  (name: string) =>
  (value: string): void =>
    label(name, value);