'use strict'

const {createHash} = require('node:crypto')
const fs = require('fs')
const path = require('path')

const THIS_FILE = fs.readFileSync(__filename)

module.exports = {
  process(file) {
    return {
      code: `
        if (typeof document !== 'undefined') {
          const css = \`${file.toString()}\`;

          // List of features that are currently not parseable by the internal version of jsdom managed by
          // jest-environment-jsdom
          const unsupportedFeatures = ['@layer', '@container'];
          const hasUnsupportedFeature = unsupportedFeatures.find((feature) => {
            return css.includes(feature);
          })

          if (!hasUnsupportedFeature) {
            const style = document.createElement('style')
            style.type = 'text/css'

            document.head.appendChild(style);
            style.appendChild(document.createTextNode(css))
          }
        }
      `,
    }
  },
  getCacheKey(sourceText, sourcePath, transformOptions) {
    const {config, configString, instrument} = transformOptions
    return createHash('md5')
      .update(THIS_FILE)
      .update('\0', 'utf8')
      .update(sourceText)
      .update('\0', 'utf8')
      .update(path.relative(config.rootDir, sourcePath))
      .update('\0', 'utf8')
      .update(configString)
      .update('\0', 'utf8')
      .update(instrument ? 'instrument' : '')
      .update('\0', 'utf8')
      .update(process.version)
      .digest('hex')
  },
}
