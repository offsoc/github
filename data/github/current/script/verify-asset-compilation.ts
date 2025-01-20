import path from 'path'
import { createHash } from 'crypto'
import { exec } from 'child_process'
import { getIntegrities } from '../lib/parse-integrities'
import { promisify } from 'util'
import { readdir, stat } from 'fs'
import { readFileSync } from 'fs'
// Verifies that the JavaScript and CSS bundles produced by the compiler
// are deterministic. Between two runs of the compiler, given the same
// input files, we expect:
//
// - The same set of output files to be created
// - Each file has the same content addressable fingerprint in its name
// - Each file has the same on-disk bytes
//
// If these conditions are not met, we have a broken compiler that is
// producing different output given the same input. The branch being
// tested must not be deployed to production until the compiler is fixed.

const execAsync = promisify(exec)
const readdirAsync = promisify(readdir)
const statAsync = promisify(stat)

// Removes the fingerprint hash from the file name.
//
//   github-bootstrap-deadbeef.js -> github-bootstrap.js
//
// Returns the file name minus its fingerprint.
function stripFingerprint(name) {
  return name.replace(/-[0-9a-fA-F]{8,}\./, '.')
}

// Returns true if this is a compiler output file we want to diff.
function isBundle(entry) {
  const ext = path.extname(entry.name)
  return entry.isFile() && (ext === '.js' || ext === '.css')
}

// Runs the compiler and captures metadata about the output files.
//
// Returns a Map<id: String, {file: String, size: number, integrity: String}>.
async function compile() {
  console.log('Compiling assets...')
  await execAsync('./script/precompile-assets', {env: {RAILS_ENV: 'production'}})
  console.log('Done compiling assets')

  const pairs = (await readdirAsync('public/assets', {withFileTypes: true})).filter(isBundle).map(async entry => {
    const file = path.join('public/assets', entry.name)
    const {size} = await statAsync(file)
    const id = stripFingerprint(path.basename(file))
    const bundle = {id, file, size}
    return [id, bundle] as const
  })

  return new Map(await Promise.all(pairs))
}

// Combines two Maps into an array of paired values, discarding the keys. If
// the map is missing a key, its paired value is undefined: [value, undefined].
//
// Returns Array<[value1, value2]>.
function zipMaps(map1, map2) {
  return [...map1.entries()].map(([k, v]) => [v, map2.get(k)])
}

// Finds the difference between two maps of bundle metadata. The expected
// length of the returned array is zero when the compiler is functioning
// properly.
//
// Returns Array<[bundle, bundle]> of bundles that do not match.
function compare(expected, actual) {
  const pairs = zipMaps(expected, actual)
  return pairs.filter(([b1, b2]) => !isBundleEqual(b1, b2))
}

// Returns true if the two bundles have the same names, on-disk bytes and
// integrity hashes. This indicates the compiler is deterministic, producing
// the same output bundles given the same input files.
function isBundleEqual(a, b) {
  return a && b && b.id === a.id && b.file === a.file && b.size === a.size && b.integrity === a.integrity
}

function difference(set1, set2) {
  return new Set([...set1].filter(x => !set2.has(x)))
}

// Are there some output files in one build but not the other?
//
// Returns the Array<bundle> of missing files.
function missingBundles(expected, actual) {
  const k1 = new Set(expected.keys())
  const k2 = new Set(actual.keys())
  const diff = new Set([...difference(k1, k2), ...difference(k2, k1)])
  return [...diff]
}

// Runs the compiler several times, comparing the output of the previous build
// with the current build. If there are any differences between builds, the
// process fails and reports the errors.
//
// Returns nothing.
async function main(iterations) {
  console.log(`Comparing ${iterations} builds. This will take a while.`)
  let baseline = await compile()

  for (let i = 0; i < iterations - 1; i++) {
    const results = await compile()

    const missing = missingBundles(baseline, results)
    if (missing.length) {
      console.error('FAILED: builds produced files missing in the other', missing)
      process.exit(1)
    }

    const diff = compare(baseline, results)
    if (diff.length) {
      console.error('FAILED: non-deterministic build detected', diff)
      process.exit(1)
    }
    console.log(`PASSED: build ${i} was identical to build ${i + 1}`)
    baseline = results
  }
}

const builds = parseInt(process.argv[2], 10) || 5
main(builds)
