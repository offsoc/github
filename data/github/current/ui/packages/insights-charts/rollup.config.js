/* eslint import/no-extraneous-dependencies: off */
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import analyze from 'rollup-plugin-analyzer'

/*
  Do not minify our outputs - minification will be the purview of our consumers
  Only exporting ESM build as all our consumers are capable of ESM-compatible bundling
*/
const config = argv => {
  const plugins = [
    json(),
    resolve(),
    typescript(),
    analyze({
      stdout: true,
    }),
  ]

  // do dev stuff
  if (!argv.dev) {
    // nothing to do now, but keeping this around for the future
  }

  return [
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.js',
        format: 'es',
      },
      plugins,
    },
  ]
}

export default config
