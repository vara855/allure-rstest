import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const readSource = (relative) =>
  ts.createSourceFile(relative, readFileSync(join(root, relative), 'utf8'), ts.ScriptTarget.Latest, true);

const extractAllureMetaFields = (sourceFile) => {
  const alias = sourceFile.statements.find(
    (s) => ts.isTypeAliasDeclaration(s) && s.name.text === 'AllureMeta',
  );
  if (!alias || !ts.isTypeLiteralNode(alias.type)) return [];

  return alias.type.members.map((member) => ({
    name: member.name?.text ?? '?',
    type: member.type ? member.type.getText(sourceFile) : 'unknown',
  }));
};

const extractExportedNames = (sourceFile) => {
  const names = new Set();

  for (const statement of sourceFile.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) names.add(element.name.text);
    }

    if (
      ts.isVariableStatement(statement) &&
      (ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export) !== 0
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    }
  }

  return [...names];
};

const allureMetaFields = extractAllureMetaFields(readSource('src/meta.ts'));
const indexExports = extractExportedNames(readSource('src/index.ts'));
const syncExports = extractExportedNames(readSource('src/sync.ts'));

const readme = readFileSync(join(root, 'README.md'), 'utf8');
const readmeBody = readme.replace(/^#.*\n/, '').trim();

const frontmatter = `---
pageType: home

hero:
  name: allure-rstest
  text: Allure integration for Rstest
  actions:
    - theme: brand
      text: Get started
      link: /#installation
features:
  - title: Declarative metadata
    details: Set labels, severity, owner, tags and links through test meta.
  - title: Runtime API
    details: feature, step, attachment and more from the Allure facade.
  - title: Matchers as steps
    details: Turn expect() calls into report steps automatically.
---
`;

const metaTable = allureMetaFields
  .map(({ name, type }) => `| \`${name}\` | \`${type}\` |`)
  .join('\n');

const apiSection = `## API reference

> This section is generated from \`src/\` by \`scripts/generate-docs.mjs\` — do not edit by hand.

### Exported API

\`\`\`
${indexExports.join(', ')}
\`\`\`

The synchronous facade is available from \`allure-rstest/sync\`:

\`\`\`
${syncExports.join(', ')}
\`\`\`

### \`AllureMeta\`

Fields accepted by \`allureMeta({ ... })\`:

| Field | Type |
|---|---|
${metaTable}
`;

const index = `${frontmatter}\n${readmeBody}\n\n${apiSection}`;
const outPath = join(root, 'website', 'docs', 'index.md');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${index}\n`, 'utf8');
console.log(`Generated ${outPath}`);