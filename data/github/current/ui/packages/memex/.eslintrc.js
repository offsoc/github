// @ts-check
const React = require('react')

const noRestrictedImportsConfig = {
  paths: [
    {
      name: 'react-dom/test-utils',
      importNames: ['act'],
      message: 'Please use the act from @testing-library/react instead to avoid potential mismatches',
    },
    {
      name: 'react',
      importNames: ['act'],
      message: 'Please use the act from @testing-library/react instead to avoid potential mismatches',
    },
    {
      name: 'react-router-dom',
      importNames: ['Link', 'NavLink', 'useNavigate', 'useSearchParams', 'useLinkClickHandler', 'Navigate'],
      message: 'Please use the components/hooks from client/router instead, to avoid issues related to turbo in dotcom',
    },
    {
      name: 'react',
      importNames: ['default', 'React'],
      message: 'Only destructured imports of react are allowed',
    },
    {
      name: 'lodash',
      message: "Please use 'lodash-es' as it better supports tree-shaking.",
    },
    {
      name: 'lodash-es',
      importNames: ['noop'],
      message: "Please use '@github-ui/noop' for consistency as the standard no-op function.",
    },
    {
      name: 'lodash-es',
      importNames: ['identity'],
      message: "Please use 'utils/identity' for consistency as the standard identity function.",
    },
    {
      name: 'lodash-es',
      importNames: ['partition'],
      message: "Please use 'utils/partition' for consistency as the standard partition function.",
    },
    {
      name: 'lodash-es',
      importNames: ['omit'],
      message: "Please use 'utils/omit' for consistency as the standard omit function.",
    },
    {
      name: 'lodash-es',
      importNames: ['isNull'],
      message: "Prefer using '=== null' instead for consistency.",
    },
    {
      name: 'lodash-es',
      importNames: ['isString'],
      message: `Prefer using 'typeof value === "string"' instead for consistency.`,
    },
    {
      name: 'lodash-es',
      importNames: ['isError'],
      message: `Prefer using 'value instanceof Error' instead for consistency.`,
    },
    {
      name: 'lodash-es',
      importNames: ['last'],
      message: `Prefer using 'list.at(-1)' instead for consistency.`,
    },
    {
      name: 'lodash-es',
      importNames: ['first'],
      message: `Prefer using 'list[0]' or 'list.at(0)' instead for consistency.`,
    },
    {
      name: 'lodash-es',
      importNames: ['uniqueId'],
      message: "Prefer using 'hooks/common/use-prefixed-id' instead.",
    },
    {
      name: '@primer/react',
      importNames: ['Avatar'],
      message: 'Use { GitHubAvatar } from @github-ui/github-avatar instead',
    },
  ],
  patterns: [
    {
      group: ['@primer/react/lib/*'],
      message:
        "Use of non-ESM version of Primer components not allowed. Change the path from 'lib' to 'lib-esm' when importing from within the package",
    },
  ],
}

/**
 * @type {import('eslint').Linter.Config['parserOptions']}
 * Parser Options configuration for non-client files
 */
const baseServerParserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  tsconfigRootDir: __dirname,
  project: ['./tsconfig.json'],
}

/**
 * @type {import('eslint').Linter.Config['parserOptions']}
 * Parser options configuration for client files
 */
const baseClientParserOptions = {
  ...baseServerParserOptions,
  ecmaFeatures: {
    jsx: true,
  },
}

const baseNoRestrictedSyntax = [
  {
    selector: 'TSEnumDeclaration',
    message: `
Typescript enums are weird and inefficient, a const object provides the same
level of type safety, but with a smaller output size, and better ergonomics,
since it doesn't require the access to be from the enum directly every time.

Compare:

## Using an enum

enum MyEnum {
A = 'A',
B = 'B'
}

generated output:

var MyEnum;
(function (MyEnum) {
MyEnum["A"] = "A";
MyEnum["B"] = "B";
})(MyEnum || (MyEnum = {}));

Why does typescript generate output like this?  Enums are designed to be
merge-able, so if an enum is defined, and in scope, attempting to redefine it only
extends the original enum - a bit strange

## Using a const object instead
const MyConstObjectEnum = {
A: 'A',
B: 'B'
} as const
type MyConstObjectEnum = typeof MyConstObjectEnum[keyof typeof MyConstObjectEnum]

You may notice we define a type with the same name as the object. This
works, since typescript disambiguates the type to be the object type, and
allows them both to be used interchangeably, depending on context.

The \`type\` validly becomes a string union of the values of the object \`"A" | "B"\`
however the value of the object MyConstObjectEnum is an object wit the keys/values A, B


Code output

const MyConstObjectEnum = {A: 'A', B: 'B'}

In both cases we can limit the accepted values to the values of the object/enum, however
using a const object has a significantly smaller runtime size, no _generated_ code output.
`,
  },
]
const noRestrictedSyntaxWithBuildItemsAndColumnsOverrides = [
  {
    selector: 'CallExpression[callee.name="buildInitialItemsAndColumns"][arguments.length=2]',
    message: 'Calls to "buildInitialItemsAndColumns" with a second argument is not allowed in production code',
  },
]

const noRestrictedSyntaxWithDataHelpersForTestsOnly = [
  {
    selector: 'CallExpression[callee.name="resetInitialState"]',
    message: 'Calls to "resetInitialState" are not allowed in production code',
  },
  {
    selector: 'CallExpression[callee.name="setApiMetadataForTests"]',
    message: 'Calls to "setApiMetadataForTests" are not allowed in production code',
  },
  {
    selector: 'CallExpression[callee.name="resetAliveConfigForTests"]',
    message: 'Calls to "resetAliveConfigForTests" are not allowed in production code',
  },
  {
    selector: 'CallExpression[callee.name="resetEnabledFeaturesForTests"]',
    message: 'Calls to "resetEnabledFeaturesForTests" are not allowed in production code',
  },
]

const noRestrictedSyntaxDirectInteractionWithQueryClient = [
  {
    selector: 'MemberExpression > Identifier[name="getQueryData"]',
    message:
      'Direct calls to "getQueryData" are not allowed. Please use existing functions in "query-client-api.ts" instead.',
  },
  {
    selector: 'MemberExpression > Identifier[name="setQueryData"]',
    message:
      'Direct calls to "setQueryData" are not allowed. Please use existing functions in "query-client-api.ts" instead.',
  },
  {
    selector: 'MemberExpression > Identifier[name="getQueriesData"]',
    message:
      'Direct calls to "getQueriesData" are not allowed. Please use existing functions in "query-client-api.ts" instead.',
  },
  {
    selector: 'MemberExpression > Identifier[name="setQueriesData"]',
    message:
      'Direct calls to "setQueriesData" are not allowed. Please use existing functions in "query-client-api.ts" instead.',
  },
]

const typescriptEslintPluginConfig = [
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
  // 'plugin:@typescript-eslint/strict',
  // need prettier here (even though it's declared already), since it needs to be last
  'plugin:prettier/recommended',
]

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'simple-import-sort',
    'import',
    'unused-imports',
    'no-only-tests',
    'jsx-a11y',
    'i18n-text',
    'testing-library',
    'jest',
    'escompat',
    'ssr-friendly',
    '@github-ui/memex',
    '@tanstack/query',
    'unicorn',
  ],
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:primer-react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:github/recommended',
    'plugin:github/typescript',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parserOptions: baseClientParserOptions,
  // rules which apply to JS, TS, etc.
  rules: {
    // stylistic rules
    'eol-last': ['error', 'always'],
    'no-empty': 'error',

    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',

    'import/no-named-as-default-member': 'off',
    'import/named': 'off',
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-deprecated': 'off',

    'sort-imports': 'off',
    'github/no-then': 'off',

    'no-console': 'error',

    // Custom exhaustive deps
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '^(useEventHandler$|^useCommands)$',
      },
    ],

    /*
     * By default we want to catch and warn about any places
     * that dangerouslySetInnerHTML so that these instead use
     * the `<SanitizedHtml />`component to ensure no unsafe DOM is
     * rendered to the user.
     */
    'react/no-danger': 'error',
    'react/jsx-boolean-value': ['error'],
    'react/forbid-component-props': ['error', {forbid: ['dangerouslySetInnerHTML']}],
    'id-denylist': [
      'error',
      // this name is used to render arbitrary text as HTML, which may allow
      // untrusted input to be displayed and open an XSS vulnerability
      //
      // Please look into sanitizing this value with `<SanitizedHtml /> or
      // whether you even need to use this part of React.
      'dangerouslySetInnerHTML',
    ],
    // avoid usage of closing jsx tags for elements that take no children
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
    // code-quality rules
    radix: 'off',
    'react/jsx-no-constructed-context-values': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': 'error',
    'no-var': 'error',
    'no-restricted-properties': [
      'error',
      ...Object.keys(React).map(key => {
        return {
          object: 'React',
          property: key,
          message: `imports of \`React.${key}\` should not use the global React namespace, which is only provided for typings. Instead, \`import {${key}} from 'react'\``,
        }
      }),
      {
        object: 'window',
        property: 'localStorage',
        message:
          'localStorage should be used through `safeLocalStorage` to avoid issues with browsers that disallow accessing localStorage',
      },
      {
        object: 'window',
        property: 'sessionStorage',
        message:
          'sessionStorage should be used through `safeSessionStorage` to avoid issues with browsers that disallow accessing sessionStorage',
      },
      {
        object: 'localStorage',
        message:
          'localStorage should be used through `safeLocalStorage` to avoid issues with browsers that disallow accessing localStorage',
      },
      {
        object: 'sessionStorage',
        message:
          'sessionStorage should be used through `safeSessionStorage` to avoid issues with browsers that disallow accessing sessionStorage',
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'localStorage',
        message:
          'localStorage should be used through `safeLocalStorage` to avoid issues with browsers that disallow accessing localStorage',
      },
      {
        name: 'sessionStorage',
        message:
          'sessionStorage should be used through `safeSessionStorage` to avoid issues with browsers that disallow accessing sessionStorage',
      },
    ],
    'no-restricted-syntax': [
      'error',
      ...baseNoRestrictedSyntax,
      ...noRestrictedSyntaxWithBuildItemsAndColumnsOverrides,
      ...noRestrictedSyntaxWithDataHelpersForTestsOnly,
      ...noRestrictedSyntaxDirectInteractionWithQueryClient,
    ],
    'no-restricted-imports': [
      'error',
      {
        ...noRestrictedImportsConfig,
        patterns: [
          ...noRestrictedImportsConfig.patterns,
          /**
           * Don't allow @ngneat/falso for production code at all
           */
          {
            group: ['@ngneat/falso/*'],
            message: 'Falso for fake data should not be used in production code',
          },
          {
            group: ['**/fields/progress-bar/*'],
            message: 'Import parent component from `fields/progress-bar` and use `variant` prop instead',
          },
        ],
      },
    ],

    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        controlComponents: ['Checkbox'],
        depth: 2,
      },
    ],

    'primer-react/a11y-tooltip-interactive-trigger': 'off',
    'primer-react/a11y-link-in-text-block': 'error',

    /**
     * Rules inherited from the base @github/eslintrc package configuration that have not yet been configured in Memex.
     * We should go through these rules and add specific eslint-disables for any exceptions and fully enable these.
     */
    'github/prefer-observers': 'off',
    'ssr-friendly/no-dom-globals-in-constructor': 'off',
    'ssr-friendly/no-dom-globals-in-module-scope': 'off',
    '@github-ui/github-monorepo/package-json-ordered-fields': 'off',
    '@github-ui/github-monorepo/package-json-version-numbers': 'off',
    'no-barrel-files/no-barrel-files': 'off',
  },
  // rules which apply only to TS
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [...typescriptEslintPluginConfig],
      parserOptions: {
        ...baseClientParserOptions,
        project: './tsconfig.json',
      },
      rules: {
        // stylistic rules
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'class',
            format: ['PascalCase'],
          },
          // replicates the pre-3.0 '@typescript-eslint/interface-name-prefix' rule
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/array-type': ['error', {default: 'generic'}],
        '@typescript-eslint/consistent-type-assertions': ['error', {assertionStyle: 'as'}],
        // code quality rules
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports plugin in inherited config
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/restrict-template-expressions': ['off'],
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              // "object" should not be banned: https://github.com/typescript-eslint/typescript-eslint/issues/2068
              object: false,
              // The default message recommends 'Record<string, unknown>' and 'unknown', which are not appropriate for all cases.
              // See extended comment in 'src/client/@types/common/index.d.ts'.
              '{}': {
                message:
                  '`{}` actually means "any non-nullish value".\n- If you want a type meaning "any type or interface <T>", you probably want `Indexable<T>` instead.\n- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.\n- If you want a type meaning "any value", you probably want `unknown` instead.',
              },
              'React.StatelessComponent': {
                message:
                  'Use React.FC instead, and define types for children based on usage. This is deprecated in types for React 18',
                fixWith: 'React.FC',
              },
              'React.StatelessFunctionalComponent': {
                message:
                  'Use React.FC instead, and define types for children based on usage. This is deprecated in types for React 18',
                fixWith: 'React.FC',
              },
              'React.VoidFunctionalComponent': {
                message:
                  'Use React.FC instead, and define types for children based on usage. This is deprecated in types for React 18',
                fixWith: 'React.FC',
              },
              'React.VFC': {
                message:
                  'Use React.FC instead, and define types for children based on usage. This is deprecated in types for React 18',
                fixWith: 'React.FC',
              },
            },
          },
        ],

        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-floating-promises': ['off'],
        '@typescript-eslint/no-misused-promises': ['off'],
        '@typescript-eslint/require-await': ['off'],

        'unicorn/consistent-function-scoping': ['error'],

        'primer-react/no-system-props': ['error', {includeUtilityComponents: true}],
      },
    },
    {
      // React components in the client bundle should not interact with DOM globals
      // within the module scope - this breaks import/require from a Node context
      // which is a key prerequsite for server-side rendering
      files: [`src/client/**/*.ts`, `src/client/**/*.tsx`],
      extends: ['plugin:ssr-friendly/recommended'],
    },
    {
      files: [
        'src/stories/**/*.ts',
        'src/mocks/**/*.ts',
        '**/**/*-spec.ts',
        '**/**/fixtures/**/*.ts',
        '**/**/*-factory.ts',
      ],
      rules: {
        // disabling this rule for files that aren't part of the main bundle
        'i18n-text/no-en': 'off',
        // we use plenty of HTML in mock data or test files to test sanitization that it's not worth the effort to
        // lint every single time we use something that looks like unsafe HTML code
        'github/unescaped-html-literal': 'off',
      },
    },
    {
      files: ['src/tests/**/*', 'src/playwright-tests/**/*'],
      rules: {
        // disabling this rule for tests, since we commonly define functions near where they are used for convenience
        'unicorn/consistent-function-scoping': 'off',
        'import/no-nodejs-modules': 'off',
        // we use plenty of HTML in mock data or test files to test sanitization that it's not worth the effort to
        // lint every single time we use something that looks like unsafe HTML code
        'github/unescaped-html-literal': 'off',
        // TODO: remove this rule when it understands that `.innerText` is different from `.innerText()`
        'github/no-innerText': 'off',
      },
    },
    {
      files: ['src/stories/**/*.ts', 'src/mocks/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: [
        '**/**/.eslintrc.js',
        '**/**/.eslintrc.cjs',
        '**/**/jest.config.js',
        '**/**/webpack.config.ts',
        'script/*.js',
        'script/*.mjs',
        'script/*.ts',
      ],
      rules: {
        'filenames/match-regex': ['off'],
        'no-console': 'off',
        'i18n-text/no-en': 'off',
        'import/no-nodejs-modules': 'off',
      },
    },
    {
      files: ['script/*.js', '**/**/.eslintrc.js'],
      rules: {
        'import/no-commonjs': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['webpack.config.ts', 'webpack/*.ts', 'script/*.ts', 'jest.config.js'],
      extends: [...typescriptEslintPluginConfig],
      parserOptions: {
        ...baseServerParserOptions,
        project: 'tsconfig.webpack.json',
      },
    },
    {
      extends: [...typescriptEslintPluginConfig],
      parserOptions: {
        ...baseServerParserOptions,
        project: 'tsconfig.server.json',
      },
      files: ['src/server.ts'],
      rules: {
        'import/no-commonjs': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['src/server-dev.js'],
      rules: {
        'import/no-commonjs': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
        'import/no-nodejs-modules': 'off',
      },
    },
    {
      files: [
        'src/client/state-providers/memex-items/memex-items-data.ts',
        'src/tests/**/*-test.ts',
        'src/tests/jest-setup.ts',
      ],
      rules: {
        'no-restricted-syntax': ['error', ...baseNoRestrictedSyntax],
      },
    },
    {
      files: ['src/client/from-react-shared/**/*', 'src/client/from-relay-shared/**/*'],
      rules: {
        'filenames/match-regex': ['off'],
        // temporary until Relay type checking is fixed
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
    {
      files: ['src/client/from-react-shared/**/__generated__/**/*.graphql.ts', 'dev-environment/mockServiceWorker.js'],
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'eslint-comments/no-use': 'off',
      },
    },
    {
      files: ['src/client/from-react-shared/**/*.test.*'],
      rules: {
        'i18n-text/no-en': 'off',
      },
    },
    {
      files: ['**/*.json'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['**/strings.ts'],
      rules: {
        'i18n-text/no-en': 'off',
      },
    },
    {
      files: [
        'src/client/state-providers/**/query-client-api/*.ts',
        'src/client/state-providers/**/query-client-api.ts',
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...baseNoRestrictedSyntax,
          ...noRestrictedSyntaxWithBuildItemsAndColumnsOverrides,
          ...noRestrictedSyntaxWithDataHelpersForTestsOnly,
        ],
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
}

module.exports = config
