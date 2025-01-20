import {createHmac} from 'crypto'
import {parse as parseStacktrace} from 'stacktrace-parser'
import {relative} from 'path'

// This function is borrowed from the default reporter of the test-runner package
function getFlattenedTestResults(testResults) {
  const flattened = []

  function collectTests(suiteNames, tests) {
    for (const test of tests) {
      flattened.push({...test, suite: suiteNames.join(' > ')})
    }
  }

  function collectSuite(suiteNames, suite) {
    collectTests(suiteNames, suite.tests)

    for (const childSuite of suite.suites) {
      collectSuite([...suiteNames, childSuite.name], childSuite)
    }
  }

  collectSuite([], testResults)
  return flattened
}

function reportJankyError(logger, {suite, name, error}) {
  const {message, stack: backtrace} = error
  const stacktrace = parseStacktrace(backtrace || '')
  const [{file, lineNumber}] = stacktrace.length > 0 ? stacktrace : [{file: 'unknown', lineNumber: 0}]
  const location = `${file}:${lineNumber}`

  const jankyResult = {
    suite,
    name,
    message,
    location,
    backtrace,
  }

  const fingerprintInput = [jankyResult.suite, jankyResult.name, jankyResult.message, jankyResult.backtrace].join('::')
  jankyResult.fingerprint = createHmac('sha256', 'secret seed').update(fingerprintInput).digest('hex').slice(32)

  logger.log(`===FAILURE===
${JSON.stringify(jankyResult, null, 4)}
===END FAILURE===`)
}

export const testRunnerJankyReporter = {
  reportTestFileResults(result) {
    try {
      const {logger, sessionsForTestFile, testFile} = result
      const failedSessions = sessionsForTestFile.filter(s => !s.passed)
      if (failedSessions.length > 0) {
        for (const session of failedSessions) {
          // log any errors that occurred at the file level
          for (const error of session.errors) {
            reportJankyError(logger, {suite: relative('./', testFile), name: 'setup/teardown', error})
          }

          // log any errors that occurred in the test suites
          if (session.testResults) {
            const flattenedTests = getFlattenedTestResults(session.testResults)
            for (const test of flattenedTests) {
              if (test.error) {
                reportJankyError(logger, test)
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  },
}
