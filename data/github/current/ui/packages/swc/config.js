// @ts-check
const relayConfig = require('@github-ui/relay-build/config')
const tsconfig = require('@github-ui/tsconfig/base.json')

/**
 * @type {import('@swc/core').Config}
 */
const config = {
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
      tsx: true,
    },
    transform: {
      useDefineForClassFields: false, // Needed to keep annotations for catalyst working on class fields
      react: {
        runtime: 'automatic',
        /**
         * Refresh is only applied by swc-loader when
         * the `refresh` option is set to `true` _and_
         * the webpack mode is development.
         *
         * The development  mode, not added explicitly here
         * is also controlled by swc-loader, and mirrors the
         * webpack mode.
         *
         * Note that Alloy's webpack config overwrites the
         * refresh option to false.
         */
        refresh: true,
      },
    },
    experimental: {
      plugins: [
        [
          '@swc/plugin-relay',
          {
            rootDir: __dirname,
            pagesDir: 'unused/option', // this is a nextjs-specific thing, which is required but not used
            src: relayConfig.src,
          },
        ],
        [
          '@swc/plugin-styled-components',
          {
            ssr: true,
            displayName: true,
          },
        ],
      ],
    },
    keepClassNames: true, // keep class names for catalyst
    // @ts-expect-error this is inferred as a string and not an enum
    target: tsconfig.compilerOptions.target,
  },
  module: {
    type: 'es6',
  },
}

module.exports = config
