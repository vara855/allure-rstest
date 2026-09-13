import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  include: ['tests/spec/utils.test.ts', 'tests/build.test.ts'],
});
