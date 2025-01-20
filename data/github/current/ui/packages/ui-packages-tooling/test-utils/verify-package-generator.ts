import {tmpdir} from 'node:os'
import nodePlop from 'node-plop'
import {resolve, relative} from 'node:path'
import {readFile, rm} from 'node:fs/promises'
import glob from 'glob'

async function getFileTree(directory: string) {
  const filePaths = glob.sync(`${directory}/**/*.*`)
  const files: Record<string, string> = {}

  for (const filePath of filePaths) {
    const contents = await readFile(filePath)
    const relativePath = relative(directory, filePath)

    files[relativePath] = contents.toString()
  }

  return files
}

export async function verifyPackageGenerator({
  name,
  answers,
  fixture,
}: {
  name: string
  answers: Record<string, string | boolean>
  fixture: string
}) {
  const destination = resolve(tmpdir(), './plop-test-output')
  const packageName = answers.packageName as string
  const outputDirectory = resolve(destination, packageName)

  // Make sure the target directory doesn't already contain files from a previous test run
  await rm(outputDirectory, {recursive: true, force: true})

  // Create a plop instance and get the generator
  const plop = await nodePlop(resolve(__dirname, '../plopfile.js'), {
    force: true,
    destBasePath: resolve(destination, './x'), // need extra layer to get plop to properly use the base path
  })
  const generator = plop.getGenerator(name)

  // Run the generator with a valid set of answers
  const {failures} = await generator.runActions(answers)

  // If there are failures from the generator, fail the test immediately
  expect(failures).toEqual([])

  // Compare the generated files to the expected files
  const results = await getFileTree(`${destination}/${packageName}`)
  const expectedResults = await getFileTree(resolve(__dirname, `../__fixtures__/${fixture}`))
  expect(results).toEqual(expectedResults)
}
