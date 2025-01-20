import type {StorybookConfig} from '@storybook/react-webpack5'
import type {IndexerOptions} from '@storybook/types'
import UICommandsPlugin from '@github-ui/ui-commands-scripts/plugin'
import swcConfig from '@github-ui/swc/config'
import {readFileSync} from 'fs'
import {join, dirname} from 'path'
import {loadCsf} from '@storybook/csf-tools'

require('@github-ui/relay-build/compile-relay')

// matches prefixes 'ui/packages/', '@github-ui/', or any number of '../'
const packagePrefixRegex = /^((ui\/packages\/)|@github-ui\/)|(..\/)+/

const __root = join(__dirname, '../../../../')

const stories = (() => {
  const [packages, pattern] = process.argv.slice(-2)
  console.log('👀', 'received packages pattern:', pattern)

  /**
   * Pass a custom pattern to `npm run storybook` to only load stories from the specified packages.
   *
   * Note we will parse the package names and remove any prefixes like 'ui/packages/' or '@github-ui/'.
   * @example
   * ```
   * npm run storybook -- packages "global-user-nav-drawer, @github-ui/global-create-menu,ui/packages/react-core"
   * ```
   */
  if (packages === 'packages' && pattern) {
    const storyGlob = pattern
      .split(',')
      .map((p: string) => `../../${p.trim().replace(packagePrefixRegex, '')}/**/*.stories.@(tsx|ts|jsx|js)`)
    console.log('👉 Using custom story glob pattern:', storyGlob)
    return storyGlob
  } else {
    return [
      '../../../../app/assets/modules/**/*.stories.@(tsx|ts|jsx|js)',
      '../../**/*.@(mdx|stories.@(tsx|ts|jsx|js))',
    ]
  }
})()

const config: StorybookConfig = {
  stories,

  staticDirs: [
    join(__root, '/public/'),
    // contains the `mockServiceWorker.js` file used by `msw` to mock network requests
    join(__root, '/test/assets/'),
  ],

  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-storysource'),
    getAbsolutePath('@storybook/addon-mdx-gfm'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
    getAbsolutePath('@storybook/addon-mdx-gfm'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {
      fastRefresh: true,
      strictMode: true,
      useSwc: true,
    },
  },

  refs: {
    primer: {
      title: 'Primer React Components',
      url: 'https://primer.style/react/storybook/',
      expanded: false,
    },
  },

  experimental_indexers: indexers => {
    if (process.env.SKIP_CUSTOM_INDEX) {
      return [...(indexers || [])]
    }

    const storybookCategoryTitles = ['Templates', 'Recipes', 'Utilities', 'Apps']

    const createIndex = async (fileName: string, compilationOptions: IndexerOptions) => {
      const code = readFileSync(fileName, {encoding: 'utf-8'})

      const makeTitle = (userTitle: string) => {
        if (storybookCategoryTitles.includes(userTitle.split('/')[0] || '')) {
          return userTitle
        }
        return `Others/${userTitle}`
      }

      // Using the modified title when parsing the story.
      return loadCsf(code, {...compilationOptions, makeTitle, fileName}).parse().indexInputs
    }

    return [
      {
        test: /\.(tsx|ts|jsx|js|mdx)$/,
        createIndex,
      },
      ...(indexers || []),
    ]
  },

  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }

    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules ?? []).map(ruleset => {
            if (
              ruleset &&
              typeof ruleset === 'object' &&
              'test' in ruleset &&
              ruleset.test &&
              ruleset.test.toString() === '/\\.css$/'
            ) {
              ruleset.exclude = /\.module\.css$/
            }

            return ruleset
          }),
          {
            /**
             * We have a custom loader that will dynamically find and update the element registry to reference
             * all custom elements in the `app/components` directory. The js code for these
             * custom elements will be dynamically loaded on the page whenever the element tag is added to the DOM.
             */
            test: /element-registry\.ts?$/,
            loader: '@github-ui/webpack/loaders/dynamic-elements-loader',
          },
          {
            test: /\.scss$/,
            exclude: /\.module\.scss$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  url: false,
                },
              },
              'postcss-loader',
            ],
          },
          {
            test: /\.module\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  url: false,
                  modules: {
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                    namedExport: false,
                    exportLocalsConvention: 'as-is',
                  },
                },
              },
            ],
          },
        ],
      },
      plugins: [
        ...(config.plugins ?? []),
        new UICommandsPlugin({
          env: 'development',
        }),
      ],
    }
  },

  core: {
    disableWhatsNewNotifications: true,
  },

  docs: {
    autodocs: true,
  },

  swc: () => {
    return {
      ...swcConfig,
      jsc: {
        ...swcConfig.jsc,
        target: undefined,
        transform: {
          ...swcConfig.jsc?.transform,
          react: {
            ...swcConfig.jsc?.transform?.react,
            refresh: false,
          },
        },
      },
    }
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(__root, 'node_modules', value, 'package.json')))
}
