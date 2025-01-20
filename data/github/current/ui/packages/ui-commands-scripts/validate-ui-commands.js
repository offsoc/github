const {loadMetadata} = require('./load-commands-and-services')
const {join} = require('node:path')
const {Draft07} = require('json-schema-library')

const schemaJson = require('@github-ui/ui-commands/schema.json')

;(async () => {
  console.log('::: Validating commands.json files :::')

  console.time('\nValidated commands metadata')

  const allMetadata = await loadMetadata(join(__dirname, '../../../'), 'development')

  const schema = new Draft07(schemaJson)

  let anyFailures = false

  for (const {path, json} of allMetadata) {
    const errors = schema.validate(json)

    if (errors.length) {
      anyFailures = true

      console.error(`\n  ERROR: Invalid metadata at "${path}":`)

      for (const error of errors) console.error(`    - ${error.name}: ${error.message}`)
    } else {
      console.debug(`\n  ✔ Validated "${path}"`)
    }
  }

  console.timeEnd('\nValidated commands metadata')

  if (anyFailures) {
    process.exit(1)
  } else {
    console.log('\n✔︎ All commands metadata is valid')
    process.exit(0)
  }
})()
