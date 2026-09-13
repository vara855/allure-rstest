import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: 'docs',
  title: 'allure-rstest',
  description: 'Allure integration for Rstest',
  outDir: 'build',
  themeConfig: {
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/vara855/allure-rstest' },
      { icon: 'npm', mode: 'link', content: 'https://www.npmjs.com/package/allure-rstest' },
    ],
    footer: { message: 'MIT Licensed' },
  },
});