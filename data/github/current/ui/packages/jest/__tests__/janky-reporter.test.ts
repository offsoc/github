/**
 * @jest-environment node
 */
import JestJankyReporter from '../reporters/janky-reporter.mjs'
import passedResult from './fixtures/passed-test-results.json'
import failedResult from './fixtures/failed-test-results.json'
import flakyResult from './fixtures/flaky-test-results.json'

/**
 * Override the base url to account for CI potentially mounting the repo at different levels
 * compared to where it mounts in a codespace.
 *
 * This is only necessary for this test to ensure consistency between the output locations which
 * are asserted on in these tests.  In actual CI checks this is not an issue
 */
process.env.TEST_JANKY_REPORTER_BASE_DIRECTORY = '/workspaces/github'

describe('JestJankyReporter', () => {
  let reporter: JestJankyReporter
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    reporter = new JestJankyReporter()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('onRunComplete', () => {
    beforeEach(() => {
      jest
        .spyOn(JestJankyReporter.prototype, 'findOwners')
        .mockImplementation(() => ['@github/heart-services-reviewers'])
    })

    it('should not log anything if there are no failed or retried tests', () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      reporter.onRunComplete({}, passedResult as any)

      expect(consoleLogSpy).toHaveBeenCalledWith('no failures and flakes to report')
    })

    it('should log results if there are failed tests', () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      reporter.onRunComplete({}, failedResult as any)

      const expectedFailure = {
        suite: 'RepoSettings',
        name: 'renders no link to audit log when not available (user is a repo admin but not an org admin)',
        exception_class: 'Error',
        message:
          'Error: boom\n    at Object.<anonymous> (/workspaces/github/ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:59:11)',
        backtrace:
          'Error: boom\n    at Object.<anonymous> (/workspaces/github/ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:59:11)',
        location: 'ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:59',

        duration: expect.closeTo(0.034),
        fingerprint: expect.any(String),
        passed: false,
        skipped: false,
        failed: true,
        executions: {
          first_run: 'failed',
          same_worker: 'failed',
        },
        assertions: 0,
        codeowners: ['@github/heart-services-reviewers'],
      }

      const arg = consoleLogSpy.mock.calls[0][0] as string
      expect(arg.startsWith('\n===FAILURE===\n')).toBeTruthy()
      expect(arg.endsWith('\n===END FAILURE===\n')).toBeTruthy()
      expect(JSON.parse(arg.replace('\n===FAILURE===\n', '').replace('\n===END FAILURE===\n', ''))).toEqual(
        expect.objectContaining(expectedFailure),
      )
    })

    it('should log results if there are retried (flaky) tests', () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      reporter.onRunComplete({}, flakyResult as any)

      const expectedFailure = {
        suite: 'RepoSettings',
        name: 'renders no link to audit log when not available (user is a repo admin but not an org admin)',
        exception_class: 'Error',
        message:
          'Error: random error\n    at Object.<anonymous> (/workspaces/github/ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:61:13)',
        backtrace:
          'Error: random error\n    at Object.<anonymous> (/workspaces/github/ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:61:13)',
        location: 'ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:61',

        duration: expect.closeTo(0.106),
        fingerprint: expect.any(String),
        passed: true,
        skipped: false,
        failed: false,
        executions: {
          first_run: 'failed',
          same_worker: 'passed',
        },
        assertions: 1,
        codeowners: ['@github/heart-services-reviewers'],
        flaky: true,
      }
      const arg = consoleLogSpy.mock.calls[0][0] as string

      expect(arg.startsWith('\n===FAILURE===\n')).toBeTruthy()
      expect(arg.endsWith('\n===END FAILURE===\n')).toBeTruthy()
      expect(JSON.parse(arg.replace('\n===FAILURE===\n', '').replace('\n===END FAILURE===\n', ''))).toEqual(
        expect.objectContaining(expectedFailure),
      )
    })
  })

  describe('findOwners', () => {
    it('should return the all owners found in the CODEOWNERS file', () => {
      const codeowners = `# This is a comment
**/copilot* @github/copilot-foundations-reviewers
/ui/packages/copilot-common-types/ @github/heart-services-reviewers
/ui/packages/copilot-content-exclusion/ @github/heart-services-reviewers @github/copilot-foundations-reviewers
/ui/packages/copilot-custom-models/ @github/copilot-foundations-reviewers
`

      jest.spyOn(JestJankyReporter.prototype, 'codeowners').mockImplementation(() => codeowners.split('\n').reverse())

      const owners = reporter.findOwners(
        'ui/packages/copilot-content-exclusion/routes/__tests__/copilotRepoSettings.test.tsx',
      )

      expect(owners).toEqual(['@github/heart-services-reviewers', '@github/copilot-foundations-reviewers'])
    })
  })

  describe('getFingerprint', () => {
    const expectedFingerprint = 'c38a553c88ef719ff04c1a3c2dc8f6fcd9c6e441c0f7c9b0a75d3eed26b1d985'
    it('should return a sha256 hash of the suite, name, location, and exception_class', () => {
      const failure = {
        suite: 'RepoSettings',
        name: 'renders no link to audit log when not available (user is a repo admin but not an org admin)',
        exception_class: 'Error',
        location: 'ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:59',
      }

      const fingerprint = reporter.getFingerprint(failure)

      expect(fingerprint).toEqual(expectedFingerprint)
    })

    it('should not take the line number into calculation', () => {
      const failure = {
        suite: 'RepoSettings',
        name: 'renders no link to audit log when not available (user is a repo admin but not an org admin)',
        exception_class: 'Error',
        location: 'ui/packages/copilot-content-exclusion/routes/__tests__/RepoSettings.test.tsx:123',
      }

      const fingerprint = reporter.getFingerprint(failure)

      expect(fingerprint).toEqual(expectedFingerprint)
    })
  })
})
