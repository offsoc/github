const {resolve} = require('node:path')
const writeCommandFiles = require('./write-command-files')

writeCommandFiles(resolve(__dirname, '../../../'), console, {
  path: 'ui/packages/ui-commands/__generated__',
  file: 'ui-commands',
  env: process.env.NODE_ENV,
})
