/**
 * This script takes in the path to a docs URLs config file. The default is `config/docs-urls.json`.
 * It does various integrity checks on the content of the parsed JSON. The specific checks
 * are described inside the code with numbered code comments.
 *
 * The purpose of this script is to validate, from a CI workflow, that the `config/docs-urls.json`
 * never corrupts. Ideally, humans should use the CLI script (`script/add-docs-url`) which
 * will make sure these rules are followed.
 *
 * To run this locally, use bunx or node:
 *
 *    node packages/docs/test/validate-docs-urls-json.mjs config/docs-urls.json
 *
 * If there's anything wrong, it will exit non-zero and print the error on stderr.
 *
 */
import {readFileSync} from 'fs'

const DEFAULT_LOCATION = 'config/docs-urls.json'

main()

function main() {
  const filePath = process.argv[2] || DEFAULT_LOCATION
  const fileContent = readFileSync(filePath, 'utf8')

  // 1. Is the JSON valid JSON?
  let data
  try {
    data = JSON.parse(fileContent)
  } catch (error) {
    console.error(error)
    console.error(`The ${filePath} file is not valid JSON.`)
    process.exit(1)
  }

  // 2. Are the keys sorted alphabetically?
  const keys = Object.keys(data)
  const sortedKeys = [...keys].sort()
  if (keys.join() !== sortedKeys.join()) {
    const guiltyIndex = keys.findIndex((key, index) => key !== sortedKeys[index])
    const guilty = keys.find((key, index) => key !== sortedKeys[index])
    console.warn(`The key "${guilty}" should be sorted after "${sortedKeys[guiltyIndex]}".`)
    console.error(`The keys in ${filePath} are not sorted alphabetically.`)
    process.exit(2)
  }

  // 3. None of the values can be repeated.
  // If they are, it means the different identifiers are used instead of
  // "sharing" the same one.
  const values = Object.values(data)
  if (new Set(values).size !== values.length) {
    const seen = new Set()
    const guilty = values.find(value => seen.has(value) || seen.add(value))
    const identifiers = Object.entries(data)
      .filter(([, url]) => url === guilty)
      .map(([identifier]) => identifier)
    console.warn(`The URL value '${guilty}' is used by: ${identifiers.map(s => `'${s}'`).join(' and ')}`)
    // const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
    console.error(`The values in ${filePath} are not unique.`)
    process.exit(3)
  }

  // 4. No URL value should start with the `/en/` prefix.
  if (values.some(value => value.startsWith('/en/'))) {
    const guilty = Object.entries(data).filter(([, url]) => url.startsWith('/en/'))
    for (const [identifier, url] of guilty) {
      console.error(`The value for "${identifier}" starts with "/en/" ('${url}')`)
    }
    console.error(`The values in ${filePath} should not start with '/en/'.`)
    process.exit(4)
  }

  // 5. All URL values should start with / and should not contain ://
  if (values.some(value => !value.startsWith('/') || value.includes('://'))) {
    const guilty = Object.entries(data).filter(([, url]) => !url.startsWith('/') || url.includes('://'))
    for (const [identifier, url] of guilty) {
      const fault = url.includes('://') ? 'contains "://"' : 'does not start with "/"'
      console.error(`The value for "${identifier}" ${fault} ('${url}')`)
    }
    console.error(`The values in ${filePath} should start with '/' and should not contain '://'.`)
    process.exit(5)
  }

  // 6. No URL value should end with a slash
  if (
    Object.entries(data).some(
      ([identifier, value]) => value.split('?')[0].split('#')[0].endsWith('/') && identifier !== 'homepage',
    )
  ) {
    const guilty = Object.entries(data).filter(
      ([identifier, url]) => url.split('?')[0].split('#')[0].endsWith('/') && identifier !== 'homepage',
    )
    for (const [identifier, url] of guilty) {
      const fault = 'ends with a /'
      console.error(`The value for "${identifier}" ${fault} ('${url}')`)
    }
    console.error(`The values in ${filePath} should not end with '/'.`)
    process.exit(6)
  }

  console.log(`${filePath} looks great! 🎉`)
}
