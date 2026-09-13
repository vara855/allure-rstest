import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: 'docs',
  title: 'allure-rstest',
  base: '/allure-rstest',
  description: 'Allure integration for Rstest',
  outDir: 'build',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/vara855/allure-rstest',
      },
    ],
    footer: { message: 'MIT Licensed' },
  },
});
