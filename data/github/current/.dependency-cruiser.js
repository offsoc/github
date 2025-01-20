/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  extends: 'dependency-cruiser/configs/recommended-strict',
  forbidden: [
    /* rules with exceptions from the recommended-strict preset */
    {
      name: 'no-circular',
      from: {
        pathNot: [
          'app/assets/modules/blackbird-monolith',
          'app/assets/modules/enterprise-insights-actions',
          'app/assets/modules/github/code-editor.ts',
          'app/assets/modules/github/codemirror',
          'app/assets/modules/github/command-palette',
          'app/assets/modules/github/editor/code-editor.ts',
          'app/assets/modules/github/editor/detect-language-mode.ts',
          'app/assets/modules/github/editor/yaml-editors',
          'app/assets/modules/github/jump-to',
          'app/assets/modules/github/single-page-wizard',
          'app/assets/modules/github/slash-command-expander-element',
          'app/assets/modules/github/workflow-runs',
          'app/assets/modules/orgs-insights',
          'app/assets/modules/pulls-dashboard',
          'app/assets/modules/react-code-view',
          'app/assets/modules/secret-scanning',
          'app/components/command_palette',
          'app/components/memex/memex-project-picker-element.ts',
          'app/components/memex/project_list',
          'app/components/search',
          'app/components/tracking_blocks',
          'ui/packages/actions-metrics',
          'ui/packages/billing-app',
          'ui/packages/code-mirror',
          'ui/packages/code-view-types',
          'ui/packages/commenting',
          'ui/packages/commit-checks-status',
          'ui/packages/consent-experience',
          'ui/packages/conversations',
          'ui/packages/date-picker',
          'ui/packages/diff-lines',
          'ui/packages/filter',
          'ui/packages/insights-charts',
          'ui/packages/issue-actions',
          'ui/packages/issue-body',
          'ui/packages/issue-create',
          'ui/packages/issue-form',
          'ui/packages/issue-viewer',
          'ui/packages/item-picker',
          'ui/packages/issues-react',
          'ui/packages/list-view-items-issues-prs',
          'ui/packages/memex/src/mocks',
          'ui/packages/memex/src/playwright-tests/fixtures',
          'ui/packages/notifications-inbox',
          'ui/packages/owner-dropdown',
          'ui/packages/pull-request-viewer',
          'ui/packages/ref-selector',
          'ui/packages/repos-branches',
          'ui/packages/repos-rules',
          'ui/packages/timeline-items',
        ],
      },
    },
    {
      name: 'no-orphans',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)[.][^/]+[.](js|cjs|mjs|ts|json)$', // dot files
          '[.]d[.]ts$', // TypeScript declaration files
          '(^|/)tsconfig[.]json$', // TypeScript config
          '(^|/)(babel|webpack|jest)[.]config[.](js|cjs|mjs|ts|json)$', // other configs
          // includes things in folders like __mocks__, __fixtures__
          'mockServiceWorker.js$',
          '/__mocks__/',
          '/__fixtures__/',
          '/ssr-shims/',
          'app/assets/modules/checks.ts$',
          'app/assets/modules/github/marketplace/search-cache.ts$',
          'app/assets/modules/octocaptcha.ts$',
          'app/assets/modules/uuid.ts$',
          'ui/packages/eslintrc/',
          'ui/packages/stylelint/',
          'ui/packages/chart-card/__tests__/ChartCard.test.tsx',
          'ui/packages/insights-charts/sandbox/theme.js$',
          'ui/packages/item-picker2/index.ts$',
          'ui/packages/nested-list-view/nested-list-view.ts',
          'ui/packages/memex/src/tests/resolver.cjs$',
          'ui/packages/eslint-config-shared-components/eslint-config-shared-components.js',
          'ui/packages/eslint-plugin-dotcom-primer/__tests__/fixtures/',
          'ui/packages/webpack/loaders/primer-react-css-layer-loader.js',
        ],
      },
    },
    {
      name: 'no-non-package-json',
      from: {
        pathNot: ['^app/', '.stories.tsx', 'stories.ts', 'webpack.config.(ts|js|cjs|cts|mts)$'],
      },
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
        pathNot: ['node_modules/@storybook/'],
      },
    },
    {
      name: 'not-to-unresolvable',
      from: {},
      to: {
        couldNotResolve: true,
        pathNot: [
          'msw/browser',
          '@github/turbo/dist/types/core/types',
          '@remix-run/router/dist/history',
          '@dnd-kit/core/dist/types',
          'plugin:dynamic-elements',
          'react-relay/relay-hooks/helpers',
        ],
      },
    },
    /* rules you might want to tweak for your specific situation: */
    {
      name: 'not-to-spec',
      to: {
        path: '\\.(spec|test)\\.(js|mjs|cjs|ts|ls|coffee|litcoffee|coffee\\.md)$',
      },
      from: {
        pathNot: ['app/assets/modules/enterprise-insights-actions/__tests__/RawDataSection.test.tsx'],
      },
    },
    // {
    //   name: 'not-to-dev-dep',
    //   from: {
    //     path: '^(ui/packages)',
    //     pathNot: '[.](spec|test)[.](js|jsx|mjs|cjs|ts|tsx|ls|coffee|litcoffee|coffee[.]md)$',
    //   },
    //   to: {
    //     dependencyTypes: ['npm-dev'],
    //     // type only dependencies are not a problem as they don't end up in the
    //     // production code or are ignored by the runtime.
    //     dependencyTypesNot: ['type-only'],
    //     pathNot: ['node_modules/@types/'],
    //   },
    // },
  ],
  options: {
    /* conditions specifying which files not to follow further when encountered:
       - path: a regular expression to match
       - dependencyTypes: see https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md#dependencytypes-and-dependencytypesnot
       for a complete list
    */
    doNotFollow: {
      path: 'node_modules',
    },

    /* conditions specifying which dependencies to exclude
       - path: a regular expression to match
       - dynamic: a boolean indicating whether to ignore dynamic (true) or static (false) dependencies.
          leave out if you want to exclude neither (recommended!)
    */
    // exclude : {
    //   path: '',
    //   dynamic: true
    // },

    /* pattern specifying which files to include (regular expression)
       dependency-cruiser will skip everything not matching this pattern
    */
    // includeOnly : '',

    /* dependency-cruiser will include modules matching against the focus
       regular expression in its output, as well as their neighbours (direct
       dependencies and dependents)
    */
    // focus : '',

    /* list of module systems to cruise */
    moduleSystems: ['cjs', 'es6', 'tsd'],

    /* prefix for links in html and svg output (e.g. 'https://github.com/you/yourrepo/blob/develop/'
       to open it on your online repo or `vscode://file/${process.cwd()}/` to
       open it in visual studio code),
     */
    // prefix: '',

    /* false (the default): ignore dependencies that only exist before typescript-to-javascript compilation
       true: also detect dependencies that only exist before typescript-to-javascript compilation
       "specify": for each dependency identify whether it only exists before compilation or also after
     */
    tsPreCompilationDeps: true,

    /*
       list of extensions to scan that aren't javascript or compile-to-javascript.
       Empty by default. Only put extensions in here that you want to take into
       account that are _not_ parsable.
    */
    // extraExtensionsToScan: [".json", ".jpg", ".png", ".svg", ".webp"],

    /* if true combines the package.jsons found from the module up to the base
       folder the cruise is initiated from. Useful for how (some) mono-repos
       manage dependencies & dependency definitions.
     */
    // combinedDependencies: false,

    /* if true leave symlinks untouched, otherwise use the realpath */
    // preserveSymlinks: false,

    /* TypeScript project file ('tsconfig.json') to use for
       (1) compilation and
       (2) resolution (e.g. with the paths property)

       The (optional) fileName attribute specifies which file to take (relative to
       dependency-cruiser's current working directory). When not provided
       defaults to './tsconfig.json'.
     */
    tsConfig: {
      fileName: 'tsconfig.global.json',
    },

    /* Webpack configuration to use to get resolve options from.

       The (optional) fileName attribute specifies which file to take (relative
       to dependency-cruiser's current working directory. When not provided defaults
       to './webpack.conf.js'.

       The (optional) `env` and `arguments` attributes contain the parameters to be passed if
       your webpack config is a function and takes them (see webpack documentation
       for details)
     */
    webpackConfig: {
      fileName: 'ui/packages/webpack/webpack.config.js',
    },

    /* Babel config ('.babelrc', '.babelrc.json', '.babelrc.json5', ...) to use
      for compilation (and whatever other naughty things babel plugins do to
      source code). This feature is well tested and usable, but might change
      behavior a bit over time (e.g. more precise results for used module
      systems) without dependency-cruiser getting a major version bump.
     */
    // babelConfig: {
    //   fileName: '.babelrc',
    // },

    /* List of strings you have in use in addition to cjs/ es6 requires
       & imports to declare module dependencies. Use this e.g. if you've
       re-declared require, use a require-wrapper or use window.require as
       a hack.
    */
    // exoticRequireStrings: [],
    /* options to pass on to enhanced-resolve, the package dependency-cruiser
       uses to resolve module references to disk. You can set most of these
       options in a webpack.conf.js - this section is here for those
       projects that don't have a separate webpack config file.

       Note: settings in webpack.conf.js override the ones specified here.
     */
    enhancedResolveOptions: {
      /* List of strings to consider as 'exports' fields in package.json. Use
         ['exports'] when you use packages that use such a field and your environment
         supports it (e.g. node ^12.19 || >=14.7 or recent versions of webpack).

         If you have an `exportsFields` attribute in your webpack config, that one
         will have precedence over the one specified here.
      */
      exportsFields: ['exports'],
      /* List of conditions to check for in the exports field. e.g. use ['imports']
         if you're only interested in exposed es6 modules, ['require'] for commonjs,
         or all conditions at once `(['import', 'require', 'node', 'default']`)
         if anything goes for you. Only works when the 'exportsFields' array is
         non-empty.

        If you have a 'conditionNames' attribute in your webpack config, that one will
        have precedence over the one specified here.
      */
      conditionNames: ['import', 'require', 'node', 'default'],
      /*
         The extensions, by default are the same as the ones dependency-cruiser
         can access (run `npx depcruise --info` to see which ones that are in
         _your_ environment. If that list is larger than what you need (e.g.
         it contains .js, .jsx, .ts, .tsx, .cts, .mts - but you don't use
         TypeScript you can pass just the extensions you actually use (e.g.
         [".js", ".jsx"]). This can speed up the most expensive step in
         dependency cruising (module resolution) quite a bit.
       */
      extensions: [
        '.ts',
        '.tsx',
        '.d.ts',
        '.js',
        '.jsx',
        '.cjs',
        '.cjsx',
        '.mjs',
        '.mjsx',
        '.cts',
        '.d.cts',
        '.mts',
        '.d.mts',
      ],
      /*
         If your TypeScript project makes use of types specified in 'types'
         fields in package.jsons of external dependencies, specify "types"
         in addition to "main" in here, so enhanced-resolve (the resolver
         dependency-cruiser uses) knows to also look there. You can also do
         this if you're not sure, but still use TypeScript. In a future version
         of dependency-cruiser this will likely become the default.
       */
      mainFields: ['main', 'types', 'typings'],
      /*
         A list of alias fields in manifests (package.jsons).
         Specify a field, such as browser, to be parsed according to
         [this specification](https://github.com/defunctzombie/package-browser-field-spec).
         Also see [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvealiasfields)
         in the webpack docs.

         Defaults to an empty array (don't use any alias fields).
       */
      // aliasFields: ["browser"],
    },
    reporterOptions: {
      dot: {
        /* pattern of modules that can be consolidated in the detailed
           graphical dependency graph. The default pattern in this configuration
           collapses everything in node_modules to one folder deep so you see
           the external modules, but not the innards your app depends upon.
         */
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',

        /* Options to tweak the appearance of your graph.See
           https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
           for details and some examples. If you don't specify a theme
           don't worry - dependency-cruiser will fall back to the default one.
        */
        // theme: {
        //   graph: {
        //     /* use splines: "ortho" for straight lines. Be aware though
        //       graphviz might take a long time calculating ortho(gonal)
        //       routings.
        //    */
        //     splines: "true"
        //   },
        //   modules: [
        //     {
        //       criteria: { matchesFocus: true },
        //       attributes: {
        //         fillcolor: "lime",
        //         penwidth: 2,
        //       },
        //     },
        //     {
        //       criteria: { matchesFocus: false },
        //       attributes: {
        //         fillcolor: "lightgrey",
        //       },
        //     },
        //     {
        //       criteria: { matchesReaches: true },
        //       attributes: {
        //         fillcolor: "lime",
        //         penwidth: 2,
        //       },
        //     },
        //     {
        //       criteria: { matchesReaches: false },
        //       attributes: {
        //         fillcolor: "lightgrey",
        //       },
        //     },
        //     {
        //       criteria: { source: "^src/model" },
        //       attributes: { fillcolor: "#ccccff" }
        //     },
        //     {
        //       criteria: { source: "^src/view" },
        //       attributes: { fillcolor: "#ccffcc" }
        //     },
        //   ],
        //   dependencies: [
        //     {
        //       criteria: { "rules[0].severity": "error" },
        //       attributes: { fontcolor: "red", color: "red" }
        //     },
        //     {
        //       criteria: { "rules[0].severity": "warn" },
        //       attributes: { fontcolor: "orange", color: "orange" }
        //     },
        //     {
        //       criteria: { "rules[0].severity": "info" },
        //       attributes: { fontcolor: "blue", color: "blue" }
        //     },
        //     {
        //       criteria: { resolved: "^src/model" },
        //       attributes: { color: "#0000ff77" }
        //     },
        //     {
        //       criteria: { resolved: "^src/view" },
        //       attributes: { color: "#00770077" }
        //     }
        //   ]
        // }
      },
      archi: {
        /* pattern of modules that can be consolidated in the high level
          graphical dependency graph. If you use the high level graphical
          dependency graph reporter (`archi`) you probably want to tweak
          this collapsePattern to your situation.
        */
        collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/(@[^/]+/[^/]+|[^/]+)',

        /* Options to tweak the appearance of your graph.See
           https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
           for details and some examples. If you don't specify a theme
           for 'archi' dependency-cruiser will use the one specified in the
           dot section (see above), if any, and otherwise use the default one.
         */
        // theme: {
        // },
      },
      text: {
        highlightFocused: true,
      },
    },
  },
}
// generated: dependency-cruiser@15.5.0 on 2023-12-08T13:13:20.295Z
