module.exports.noRestrictedSyntaxRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: "TSNonNullExpression>CallExpression[callee.property.name='getAttribute']",
      message: "Please check for null or use  `|| ''` instead of `!` when calling `getAttribute`",
    },
    {
      selector: "NewExpression[callee.name='URL'][arguments.length=1]",
      message: 'Please pass in `window.location.origin` as the 2nd argument to `new URL()`',
    },
    {
      selector: "CallExpression[callee.name='unsafeHTML']",
      message: 'Use unsafeHTML sparingly. Please add an eslint-disable comment if you want to use this',
    },
  ],
}

module.exports.noRestrictedImportsRule = {
  'no-restricted-imports': [
    'error',
    {
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
          name: '@github-ui/failbot',
          importNames: ['reportError'],
          message:
            'Calling `reportError` directly is deprecated. To report errors to sentry, let them bubble to the document naturally or re-throw them. If they get caught by calling code you wish to avoid, wrap the re-throw in a setTimeout.',
        },
        {
          name: '@github/hotkey',
          message: 'Please import from @github-ui/hotkey instead',
        },
        {
          name: '@github/jtml',
          message: 'Use the shimmed version of jtml instead. See @github-ui/jtml-shimmed',
        },
        {
          name: '@primer/react',
          importNames: ['Avatar'],
          message: 'Use { GitHubAvatar } from @github-ui/github-avatar instead',
        },
        {
          name: '@primer/react/experimental',
          importNames: ['InlineAutocomplete'],
          message: 'Use { InlineAutocomplete } from @github-ui/inline-autocomplete instead',
        },
        {
          name: '@primer/react/drafts',
          importNames: ['InlineAutocomplete'],
          message: 'Use { InlineAutocomplete } from @github-ui/inline-autocomplete instead',
        },
        {
          name: '@primer/react/experimental',
          importNames: ['MarkdownEditor', 'MarkdownEditorHandle', 'MarkdownEditorProps'],
          message: 'Use @github-ui/comment-box instead',
        },
        {
          name: '@primer/react/drafts',
          importNames: ['MarkdownEditor', 'MarkdownEditorHservandle', 'MarkdownEditorProps'],
          message: 'Use @github-ui/comment-box instead',
        },
        {
          name: '@primer/react/experimental',
          importNames: ['MarkdownViewer'],
          message: 'Use { MarkdownViewer } from @github-ui/markdown-viewer instead',
        },
        {
          name: '@primer/react/drafts',
          importNames: ['MarkdownViewer'],
          message: 'Use { MarkdownViewer } from @github-ui/markdown-viewer instead',
        },
        {
          name: 'react',
          importNames: ['useLayoutEffect'],
          message:
            'Please use the `useLayoutEffect` hook from `@github-ui/use-layout-effect` instead. React.useLayoutEffect is not compatible with SSR.',
        },
        {
          name: '@github-ui/toast/ToastContext',
          importNames: ['useToastContext'],
          message:
            'Toasts degrade the overall user experience and are therefore considered a discouraged pattern. Please consider using alternatives as described in: https://www.figma.com/file/yHGQBFKDI3OsRsfx3mMXLn/Expected-a11y-interactions?type=whiteboard&node-id=96-483&t=QSiiBb064ZfsYhy2-4. If you have any questions, reach out in #primer.',
        },
        {
          name: 'lodash',
          message: 'Use lodash-es instead of lodash',
        },
        {
          name: 'lodash-es',
          message:
            "Don't import the full lodash-es module. Import each function you are using separately with import <function> from 'lodash-es/<function>'",
        },
        {
          name: 'clsx',
          importNames: ['default'],
          message: 'Use the named import instead: `import {clsx} from "clsx"`',
        },
      ],
      patterns: [
        {
          group: ['**/behaviors/**', '**/github/**', '**/marketing/**'],
          message:
            'Please do not import legacy modules into React code as they are not guaranteed to work in SSR. See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#how-to-fix-no-restricted-imports-errors',
        },
        {
          group: ['*.server'],
          message:
            'Please do not import server modules directly. These will be swapped in during compilation of the alloy bundle. See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#server-aliases',
        },
        {
          group: [
            '**/hyperlist-web/**',
            '**/inbox/**',
            '**/blackbird-monolith/**',
            '**/repositories/**',
            '**/pull-requests/**',
            '**/react-code-view/**',
            '**/repo-creation/**',
            '**/secret-scanning/**',
            '**/settings/notifications/**',
            '**/settings/rules/**',
            '**/virtual-network-settings/**',
          ],
          message: 'Please do not import react apps modules in react-shared',
        },
        {
          group: ['**/ui/packages/**'],
          message:
            'Please do not import packages directly. Instead install the package in your workspace as a dependency and import from `@github/<package-name>`',
        },
        {
          group: ['**/use-hydrated-effect'],
          message:
            'Prefer `useClientValue` from `@github-ui/use-client-value` or `useLayoutEffect` from React. This hook exists to support an optimization to avoid unnecessary re-paints after hydration and should not be used to measure DOM elements or other browser-only values.',
        },
        {
          group: ['**/use-render-phase'],
          importNames: ['useRenderPhase'],
          message:
            "Please use `useClientValue` instead. You can think of `useRenderPhase` as 'environment sniffing' vs `useClientValue`'s 'feature detection' approach.",
        },
      ],
    },
  ],
}

module.exports.baseConfig = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'compat',
    'delegated-events',
    'filenames',
    'i18n-text',
    'escompat',
    'import',
    'github',
    'custom-elements',
    'jsx-a11y',
    'ssr-friendly',
    'testing-library',
    'relay',
    '@github-ui/dotcom-primer',
    '@github-ui/github-monorepo',
    '@github-ui/ui-commands',
    '@tanstack/query',
    'unicorn',
    'no-barrel-files',
    'clsx',
    'unused-imports',
  ],
  extends: [
    'plugin:github/internal',
    'plugin:github/recommended',
    'plugin:github/browser',
    'plugin:escompat/typescript',
    'plugin:github/typescript',
    'plugin:import/typescript',
    'plugin:custom-elements/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    // Maintain this order for primer-react/recommended, jsx-a11y/recommended, and github/react
    'plugin:jsx-a11y/recommended',
    'plugin:primer-react/recommended',
    'plugin:github/react',
    'plugin:@github-ui/github-monorepo/react',
    'plugin:relay/strict',
    'plugin:@github-ui/ui-commands/recommended',
    'plugin:@github-ui/dotcom-primer/recommended',
    'plugin:clsx/recommended',
  ],
  parserOptions: {
    project: ['tsconfig.json'],
  },
  ignorePatterns: ['*__generated__*'],
  rules: {
    'primer-react/a11y-link-in-text-block': 'error',
    'no-barrel-files/no-barrel-files': 'error',
    'no-throw-literal': 'error',
    'no-restricted-globals': [
      'error',
      {
        name: '__TRUSTED_TYPE_POLICIES__',
        message: 'Use @github-ui/trusted-types to work with trusted types',
      },
    ],
    // we are not using flow types
    'relay/generated-flow-types': 'off',
    'import/no-unresolved': ['error', {ignore: ['^plugin:.*']}],
    'import/extensions': [
      'error',
      'ignorePackages',
      {json: 'always', ts: 'never', tsx: 'never', js: 'never', jsx: 'never'},
    ],
    'custom-elements/extends-correct-class': 'off',
    'custom-elements/one-element-per-file': 'off',
    'custom-elements/define-tag-after-class-definition': 'off',
    'custom-elements/expose-class-on-global': 'off',
    'custom-elements/tag-name-matches-class': ['error', {suffix: ['Element']}],
    'custom-elements/file-name-matches-element': 'off',
    'compat/compat': ['error'],
    'delegated-events/global-on': ['error'],
    'delegated-events/no-high-freq': ['error'],
    'escompat/no-dynamic-imports': 'off',
    'escompat/no-nullish-coalescing': 'off',
    '@typescript-eslint/no-shadow': 'error',
    // `unused-imports` plugin works like `no-unused-vars` but provides an autofix for the imports
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': [
      'error',
      {
        // allow AnythingController or AnythingElement side-effecting imports
        varsIgnorePattern: '^[A-Z][a-zA-Z]+(Controller|Element)$',
      },
    ],
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        // allow vars starting with _ or AnythingController or AnythingElement
        varsIgnorePattern: '^(_|[A-Z][a-zA-Z]+(Controller|Element)$)',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': ['error'],
    'valid-typeof': ['error', {requireStringLiterals: true}],
    'github/no-inner-html': 'off',
    '@github-ui/github-monorepo/restrict-package-deep-imports': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: "NewExpression[callee.name='URL'][arguments.length=1]",
        message: 'Please pass in `window.location.origin` as the 2nd argument to `new URL()`',
      },
      {
        selector: "CallExpression[callee.name='unsafeHTML']",
        message: 'Use unsafeHTML sparingly. Please add an eslint-disable comment if you want to use this',
      },
      {
        selector: "CallExpression[callee.name='readInlineData']",
        message:
          'Avoid using readInlineData. Please add an eslint-disable comment if you have to use this. See https://thehub.github.com/support/ecosystem/api-graphql/training/relay/relay-read-inline-data/',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
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
            name: '@github-ui/failbot',
            importNames: ['reportError'],
            message:
              'Calling `reportError` directly is deprecated. To report errors to sentry, let them bubble to the document naturally or re-throw them. If they get caught by calling code you wish to avoid, wrap the re-throw in a setTimeout.',
          },
          {
            name: '@github/selector-observer',
            message:
              'Use a Catalyst component instead of observing an element. See https://thehub.github.com/epd/engineering/dev-practicals/frontend/client-side-behaviors-with-catalyst/',
          },
          {
            name: 'delegated-events',
            message:
              "Use a Catalyst component instead of listening to an element's events. See https://thehub.github.com/epd/engineering/dev-practicals/frontend/client-side-behaviors-with-catalyst/",
          },
          {
            name: '@github/hotkey',
            message: 'Please import from @github-ui/hotkey instead',
          },
          {
            name: '@github/jtml',
            message: 'Use the shimmed version of jtml instead. See @github-ui/jtml-shimmed',
          },
          {
            name: '@primer/react',
            importNames: ['Avatar'],
            message: 'Use { GitHubAvatar } from @github-ui/github-avatar instead',
          },
          {
            name: 'msw',
            message: 'Please import from @github-ui/storybook/msw instead',
          },
          {
            name: '@testing-library/user-event',
            message: 'Use explicit `user-event-13` or `user-event-14` instead.',
          },
          {
            name: 'user-event-14',
            message:
              'Avoid importing user-event directly. Instead, use `render` (and unpack `user` from the result) or `setupUserEvent` from "@github-ui/react-core/test-utils".',
            importNames: ['default'],
          },
          {
            name: 'user-event-13',
            message:
              '`Version 13 is deprecated. Please upgrade to 14 as soon as possible; for instructions see https://thehub.github.com/epd/engineering/dev-practicals/frontend/testing/upgrading-user-event/',
          },
          {
            name: 'lodash',
            message: 'Use lodash-es instead of lodash',
          },
          {
            name: 'lodash-es',
            message:
              "Don't import the full lodash-es module. Import each function you are using separately with import <function> from 'lodash-es/<function>'",
          },
        ],
        patterns: [
          {
            group: ['*.server'],
            message:
              'Please do not import server modules directly. These will be swapped in during compilation. See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/',
          },
        ],
      },
    ],
    'primer-react/no-system-props': ['error', {includeUtilityComponents: true}],
    'primer-react/a11y-tooltip-interactive-trigger': 'off',
    'primer-react/new-color-css-vars': 2,
    'react/no-danger': ['error'],
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
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
    'react/prop-types': 'off',
    'react/jsx-no-constructed-context-values': ['error'],
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useHydratedEffect',
      },
    ],
    'unicorn/prefer-array-find': 'error',
    'unicorn/no-instanceof-array': 'error',
  },
  settings: {
    polyfills: ['Request', 'window.customElements', 'window.requestIdleCallback'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'app/assets/modules'],
      },
      typescript: true,
    },
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.ts?(x)'],
      rules: {
        'no-throw-literal': 'off',
        '@typescript-eslint/no-throw-literal': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-confusing-non-null-assertion': 'error',
        '@typescript-eslint/no-extra-non-null-assertion': 'error',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        // recommended by typescript-eslint as the typechecker handles these out of the box
        // https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',

        // muting an expensive rule that scans jsdoc comments looking for @deprecated notes
        'import/no-deprecated': 'off',
      },
    },
    {
      files: ['*.json'],
      rules: {
        'filenames/match-regex': 'off',
      },
      parser: null,
      parserOptions: {
        project: null,
      },
    },
    {
      files: ['package.json'],
      extends: ['plugin:@github-ui/github-monorepo/package-json'],
      parser: null,
      parserOptions: {
        project: null,
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-var': 'off',
      },
    },
    {
      files: ['*.stories.tsx', '*.stories.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'msw',
                message: 'Please import from @github-ui/storybook/msw instead',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['**/__browser-tests__/**/*.ts'],
      extends: ['plugin:@github-ui/github-monorepo/test'],
      rules: {
        'no-throw-literal': 'off',
        '@typescript-eslint/no-throw-literal': 'error',
        'filenames/match-regex': 'off',
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@github-ui/github-monorepo/test-file-names': 'error',
      },
    },
    {
      files: ['**/__tests__/**/*.tsx', '**/__tests__/**/*.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:testing-library/react', 'plugin:@github-ui/github-monorepo/test'],
      rules: {
        'no-throw-literal': 'off',
        '@typescript-eslint/no-throw-literal': 'error',
        'i18n-text/no-en': 'off',
        'github/unescaped-html-literal': 'off',
        'filenames/match-regex': 'off',
        'react/jsx-no-constructed-context-values': 'off',
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@github-ui/github-monorepo/test-file-names': 'error',
        'jest/expect-expect': ['error', {assertFunctionNames: ['expect', 'expect*', 'verify*', 'validate*']}],
        'jest/no-commented-out-tests': 'off',
        'jest/no-disabled-tests': 'off',
      },
    },
    {
      files: ['*.config.js', '*.config.mjs', 'test/linting/*.js', 'janky-reporter.mjs', 'janky-formatter.js'],
      extends: ['plugin:github/internal', 'plugin:escompat/typescript'],
      parser: null,
      parserOptions: {
        project: null,
      },
      env: {
        node: true,
        browser: false,
      },
      globals: {
        process: true,
        __dirname: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'escompat/no-object-rest-spread': 'off',
        'escompat/no-optional-catch': 'off',
        'i18n-text/no-en': 'off',
        'import/no-commonjs': 'off',
        'import/no-nodejs-modules': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['eslintrc.js', '.eslintrc.js'],
      parser: null,
      parserOptions: {
        project: null,
      },
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'filenames/match-regex': ['off'],
        'import/no-commonjs': ['off'],
      },
    },
  ],
}
