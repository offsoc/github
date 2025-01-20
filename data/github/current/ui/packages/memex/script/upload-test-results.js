const {execSync} = require('child_process')

const fs = require('fs')

const pattern =
  /^(?<browser>chromium|firefox|webkit)-(?<os>windows|macos|ubuntu)-(latest|([0-9]+)\.([0-9]+))-shard-(?<shard>[0-9]+)-test-results$/

function uploadJUnitXMLReport() {
  const basePath = './artifacts'
  const artifacts = fs.readdirSync(basePath)

  for (const artifact of artifacts) {
    let testResults

    // Protect against command injection and
    // invalid datadog tags
    if (artifact.match(/^[^A-Za-z][^A-Za-z|\d|-]*/g)) {
      // Artifact names are defined by playwright-tests.yml
      throw Error(
        `Invalid artifact name: ${artifact}\nMust begin with a letter and contain only letters, numbers, or hyphens.`,
      )
    }

    try {
      testResults = `${basePath}/${artifact}/results.xml`
      if (!fs.existsSync(testResults)) {
        continue
      }
      const search = pattern.exec(artifact)
      const tags = `--tags os.platform:${search.groups.os} --tags artifact:${artifact} --tags browser:${search.groups.browser} --tags shard:${search.groups.shard}`

      execSync(`npx @datadog/datadog-ci junit upload ${tags} --service memex-tests ${testResults}`, {stdio: 'inherit'})
    } catch (e) {
      console.error(`Error uploading test result ${testResults} to datadog: ${e}`)
      process.exit(1)
    }
  }
}
uploadJUnitXMLReport()
