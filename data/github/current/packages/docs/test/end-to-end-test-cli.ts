#!/usr/bin/env node

import {existsSync, readFileSync, writeFileSync, unlinkSync} from 'fs'
import {strict as assert} from 'node:assert'
import {execFileSync} from 'child_process'

const SCRIPT = process.env.SCRIPT_PATH || 'script/add-docs-url'
const ENV = {
  DOCS_URLS_CONFIG_PATH: '/tmp/docs-urls.json',
}
const VERBOSE = Boolean(JSON.parse(process.env.VERBOSE || 'false'))

// By default in Codespaces safe-ruby is installed
// in `/workspaces/github/bin/`. In CI it's `/workspace/github/bin/`
// If unsure, the simplest and safest is to execute
// `export SAFE_RUBY_PATH=$(which safe-ruby)` which avoids needing to know.
const SAFE_RUBY = process.env.SAFE_RUBY_PATH || '/workspaces/github/bin/safe-ruby'

// The CLI script we're testing is depending on network and the
// slowness of starting to load in all the Ruby modules.
const DEFAULT_TIMEOUT = 5 * 1000

type Result = {
  code: number
  stdout: string
  stderr: string
  error: Error | null
}

function runScript(args: string[] | string, {input = undefined}: {input?: string} = {}): Result {
  const command = [SCRIPT, ...(Array.isArray(args) ? args : [args])]
  try {
    const stdoutBuffer = execFileSync(SAFE_RUBY, command, {
      env: ENV,
      input,
      stdio: 'pipe',
      timeout: DEFAULT_TIMEOUT,
    })
    if (VERBOSE) {
      console.log('COMMAND:', command)
      console.log('STDERR:', '')
      console.log('STDOUT:', stdoutBuffer.toString())
    }
    return {
      code: 0,
      stderr: '',
      stdout: stdoutBuffer.toString(),
      error: null,
    }
  } catch (error) {
    if (
      error instanceof Error &&
      'status' in error &&
      // If it didn't work at all, the status would be null.
      // I.e. the execFileSync() call fails, not the command it ran.
      error.status !== null &&
      'stdout' in error &&
      'stderr' in error
    ) {
      const code = error.status as number
      const stdout = (error.stdout as Buffer).toString()
      const stderr = (error.stderr as Buffer).toString()
      if (VERBOSE) {
        console.log('COMMAND:', command)
        console.log('STDERR:', stderr)
        console.log('STDOUT:', stdout)
      }
      return {
        code,
        stdout,
        stderr,
        error,
      }
    }

    throw error
  }
}

function testPreconditions() {
  if (!existsSync(SAFE_RUBY)) {
    throw new Error(
      `
    The path to \`safe-ruby\` is not know.
    ${
      process.env.SAFE_RUBY_PATH === undefined
        ? `$SAFE_RUBY_PATH env variable was not set so by default became \`${SAFE_RUBY}\``
        : `$SAFE_RUBY_PATH env variable was set to \`${process.env.SAFE_RUBY_PATH}\` which appears to not exist on disk.`
    }
    To resolve, consider running \`export SAFE_RUBY_PATH=$(which safe-ruby)\`
    `
        .trim()
        .replace(/\s+\n/g, '\n'),
    )
  }

  if (!existsSync(SCRIPT)) {
    throw new Error(
      `
    The path to \`add-docs-url\` is not found.
    ${
      process.env.SCRIPT_PATH === undefined
        ? `$SCRIPT_PATH env variable was not set so by default became \`${SCRIPT}\``
        : `$SCRIPT_PATH env variable was set to \`${process.env.SCRIPT_PATH}\` which appears to not exist on disk.`
    }
    To resolve, if you know the exact location of add-docs-url run \`export SCRIPT_PATH=/known/path/to/scripts/script/add-docs-url\`
    If you're in Codespaces, the default path should be: \`export SCRIPT_PATH=/workspaces/github/script/add-docs-url\`
    `
        .trim()
        .replace(/\s+\n/g, '\n'),
    )
  }
}

function assertEqual(a: any, b: any) {
  if (a !== b) {
    throw new Error(`assertion failed: \`${a}\`  !==  \`${b}\``)
  }
}

function reset() {
  writeFileSync(ENV.DOCS_URLS_CONFIG_PATH, '{}')
}

function cleanup() {
  if (existsSync(ENV.DOCS_URLS_CONFIG_PATH)) unlinkSync(ENV.DOCS_URLS_CONFIG_PATH)
}

function readRaw() {
  return readFileSync(ENV.DOCS_URLS_CONFIG_PATH, 'utf-8')
}

function read() {
  return JSON.parse(readRaw())
}

const TESTS = {
  testHelp: () => {
    const {code, stdout, stderr} = runScript('--help')
    // This is the first test and can go wrong. Not necessarily because
    // the code is wrong but sometimes other tooling is preventing it
    // from working. For example, the first time you execute safe-ruby
    // it might need you to run a boostrap script
    if (code) {
      console.log('STDOUT', stdout)
      console.log('STDERR', stderr)
    }

    assert(!code)
    assert(stdout.includes('Usage: '), `Unexpected stdout ${stdout}`)
  },

  testHappyPathPlainArgs: () => {
    const {code, stdout} = runScript(['/articles/about-two-factor-authentication/', 'authentication/about-two-factor'])
    assert(!code, "didn't get exit code 0")
    assert(stdout.includes('Awesome'))
    const data = read()
    assertEqual(
      data['authentication/about-two-factor'],
      '/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication',
    )
  },

  testHappyPathPlainArgsWithHash: () => {
    const {code, stdout} = runScript([
      '/articles/about-two-factor-authentication/#access',
      'authentication/about-two-factor-access',
    ])
    assert(!code, "didn't get exit code 0")
    assert(stdout.includes('Awesome'))
    const data = read()
    assertEqual(
      data['authentication/about-two-factor-access'],
      '/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication#access',
    )
  },

  testSameInputTwiceWithoutAnchor: () => {
    const url = '/articles/about-two-factor-authentication/'
    const identifier = 'authentication/about-two-factor-access'
    // First time
    {
      const {code} = runScript([url, identifier])
      assert(!code)
    }
    // Second time
    const {code, stderr} = runScript([url, identifier])
    assert(code)
    assert(stderr.includes('already exists'))
  },

  testSameInputTwiceWithAnchor: () => {
    const url = '/articles/about-two-factor-authentication/#foo'
    const identifier = 'authentication/about-two-factor-access'
    // First time
    {
      const {code} = runScript([url, identifier])
      assert(!code)
    }
    // Second time
    const {code, stderr} = runScript([url, identifier])
    assert(code)
    assert(stderr.includes('already exists'))
  },

  testSameInputTwiceWithAnchorWithDifferentIdentifier: () => {
    const url = '/articles/about-two-factor-authentication/#foo'
    // First time
    {
      const identifier = 'authentication/about-two-factor-access'
      const {code} = runScript([url, identifier])
      assert(!code)
    }
    // Second time
    {
      const identifier = 'authentication/2fa'
      const {code, stderr} = runScript([url, identifier])
      assert(code)
      assert(stderr.includes('already exists'))
    }
  },

  testSameURLDifferentIdentifiers: () => {
    const url = '/articles/about-two-factor-authentication/'
    // First time
    {
      const {code} = runScript([url, 'original/identifier'])
      assert(!code)
    }
    // Second time
    const {code, stderr} = runScript([url, 'deliberately/different'])
    assert(code)
    assert(stderr.includes('already exists in the config'))
    assert(stderr.includes('original/identifier'))
  },

  testSameIdentifierDifferentURL: () => {
    const identifier = 'authentication/about-two-factor-access'
    // First time
    {
      const {code} = runScript(['/articles/about-two-factor-authentication/', identifier])
      assert(!code)
    }
    // Second time
    const {code, stderr} = runScript(['/github/authenticating-to-github', identifier])
    assert(code)
    assert(stderr.includes('already exists in the config'))
  },

  testDifferentIdentifierActuallySameURL: () => {
    // These two are actually redirecting to the same final URL
    const url1 = '/articles/about-two-factor-authentication/'
    const url2 = '/github/authenticating-to-github/about-two-factor-authentication'
    // First time
    {
      const {code} = runScript([url1, 'original/identifier'])
      assert(!code)
    }
    // second time
    {
      const {code, stderr} = runScript([url2, 'different/identifier'])
      assert(code)
      assert(stderr.includes('already exists in the config'))
    }
  },

  testIdentifiersSortedAlphabetically: () => {
    // First time
    {
      const {code} = runScript(['/articles/about-two-factor-authentication/', 'auth/one'])
      assert(!code)
    }
    // Second time
    {
      const {code} = runScript(['/en/actions', 'aaaactions/two'])
      assert(!code)
    }
    const keys = Object.keys(read())
    const indexFirst = keys.indexOf('auth/one')
    assert(indexFirst > -1)
    const indexSecond = keys.indexOf('aaaactions/two')
    assert(indexSecond > -1)
    // Meaning 'auth/one' should come after 'aaactions/two'
    assert(indexFirst > indexSecond, 'not sorted alphabetically')
  },

  testFullDomainHasToBeDocs: () => {
    const identifier = 'authentication/about-two-factor-access'
    // First time, with an invalid domain
    {
      const url = 'https://www.peterbe.com/articles/about-two-factor-authentication/'
      const {code, stderr} = runScript([url, identifier])
      assert(code)
      assert(stderr.includes('Host has to be docs.github.com'))
    }
    // Second time, with a valid domain
    {
      const url = 'https://docs.github.com/articles/about-two-factor-authentication/'
      const {code} = runScript([url, identifier])
      assert(!code)
      const data = read()
      // When stored, the absolute URL becomes just the pathname
      assert(data['authentication/about-two-factor-access'].startsWith('/'))
    }
  },

  testPathnameCanStartWithoutSlash: () => {
    const {code} = runScript(['articles/about-two-factor-authentication', 'authentication/about-two-factor'])
    assert(!code)
    const data = read()
    assert(data['authentication/about-two-factor'].startsWith('/'))
  },

  testIdentifierCantContainWhitespace: () => {
    const {code, stderr} = runScript(['/articles/about-two-factor-authentication', 'authentication about-two-factor'])
    assert(code)
    assert(stderr.includes('Identifier cannot contain spaces'))
  },

  testInteractivePromptForIdentifierDefault: () => {
    const {code, stdout} = runScript(['/articles/about-two-factor-authentication/'], {
      // This means, when asked, we just hit Enter
      input: '\n',
    })
    assert(!code)
    assert(/Identifier \(default: '.*'\): /.test(stdout))
    const data = read()
    assert(Object.keys(data)[0])
    assert(/\w+\/\w+/.test(Object.keys(data)[0]))
  },

  testInteractivePromptForIdentifierWithHash: () => {
    const {code, stdout} = runScript(['/organizations/organizing-members-into-teams/about-teams#nested-teams'], {
      // This means, when asked, we just hit Enter
      input: '\n',
    })
    assert(!code)
    assert(/Identifier \(default: '.*'\): /.test(stdout))
    const data = read()
    const identifier = Object.keys(data)[0]
    // The identifier takes the first part of the pathname, the last part of the pathname,
    // and if it has a hash, add that too.
    assertEqual(identifier, 'organizations/about-teams-nested-teams')
  },

  testInteractivePromptForIdentifierProvided: () => {
    const {code} = runScript(['/articles/about-two-factor-authentication/'], {
      // This means, when asked, we just hit Enter
      input: ' my/precious  \n',
    })
    assert(!code)
    const data = read()
    assertEqual(Object.keys(data)[0], 'my/precious')
  },

  testFullInteractivePrompt: () => {
    const {code} = runScript([], {
      // We type in a URL and Enter and an identifier
      input: '/articles/about-two-factor-authentication/\nmy/precious  \n',
    })
    assert(!code)
    const data = read()
    assertEqual(Object.keys(data)[0], 'my/precious')
    assert((Object.values(data)[0] as string).startsWith('/'))
  },

  testInteractivePromptEnterNothing: () => {
    const {code, stderr} = runScript([], {
      // We enter an Enter only
      input: '\n',
    })
    assert(code)
    assert(stderr.includes('Fine! Be that way'))
  },

  testEnterprisePrefixes: () => {
    // If a URL has an enterprise prefix, that should get stripped from
    // the suggested identifier. Similar to if it has a language prefix.
    // We can't "unit test" what the identifier becomes but by only
    // hitting Enter on the identifier prompt, we get the default an
    // and we can look at that.

    // enterprise-server
    {
      const url =
        'https://docs.github.com/en/enterprise-cloud@latest/account-and-profile/managing-subscriptions-and-notifications-on-github'
      const {code, stdout} = runScript([url], {
        // This means, when asked, we just hit Enter
        input: '\n',
      })
      assert(!code)
      assert(/Identifier \(default: '.*'\): /.test(stdout))
      const data = read()
      const identifier = Object.keys(data)[0]
      assert(identifier.startsWith('account-and-profile/'))
      const cleanedURL = Object.values(data)[0] as string
      assert(cleanedURL.startsWith('/account-and-profile/'))
    }

    reset()
    // enterprise-cloud
    {
      const url =
        'https://docs.github.com/enterprise-server@latest/account-and-profile/managing-subscriptions-and-notifications-on-github'
      const {code, stdout} = runScript([url], {
        // This means, when asked, we just hit Enter
        input: '\n',
      })
      assert(!code)
      assert(/Identifier \(default: '.*'\): /.test(stdout))
      const data = read()
      const identifier = Object.keys(data)[0]
      assert(identifier.startsWith('account-and-profile/'))
      const cleanedURL = Object.values(data)[0] as string
      assert(cleanedURL.startsWith('/account-and-profile/'))
    }
  },

  testURL404s: () => {
    const identifier = 'ldap/plusplus'
    const url = '/articles/ldap/plusplus'
    const {code, stderr} = runScript([url, identifier])
    assert(code)
    assert(/If you use --force/.test(stderr))
    assert(/does not exist \(404\)/.test(stderr))
  },

  testIgnoreURL404s: () => {
    const identifier = 'ldap/plusplus'
    const url = '/articles/ldap/plusplus'
    const {code, stdout} = runScript([url, identifier, '--force'])
    assert(!code)
    assert(/Ignoring the fact that/.test(stdout))
    const data = read()
    assertEqual(data[identifier], url)
  },
}

async function main(search: string[]) {
  try {
    testPreconditions()
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      process.exit(1)
    } else {
      throw error
    }
  }

  try {
    let countTests = 0
    for (const [testName, testFunction] of Object.entries(TESTS)) {
      if (search.length && !search.find(s => testName.toLowerCase().includes(s.toLowerCase()))) {
        continue
      }
      reset()
      console.log(`Test '${testName}'`)
      console.time('took')
      testFunction()
      console.timeEnd('took')
      console.log('')
      countTests++
    }

    if (search.length && !countTests) {
      throw new Error(`No matching tests for ${JSON.stringify(search)} `)
    }

    console.log(`All ${countTests} tests pass! 🎉 🚀`)
  } finally {
    cleanup()
  }
}

main(process.argv.slice(2))
