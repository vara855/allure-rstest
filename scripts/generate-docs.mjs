import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8').trim();

const packageJson = readFileSync(join(root, 'package.json'), 'utf-8');

const {version} = JSON.parse(packageJson);

const index = `---
title: allure-rstest ${version}
description: Allure integration for Rstest
---

${readme}
`;

const outPath = join(root, 'website', 'docs', 'index.md');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${index}\n`, 'utf8');
console.log(`Generated ${outPath}`);