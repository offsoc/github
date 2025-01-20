import {screen} from '@testing-library/react'

import {setupMockEnvironment} from '../../test-utils/components/IssueViewerTestComponent'
import {TEST_IDS} from '../../constants/test-ids'

jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: () => ['', jest.fn()],
}))

jest.setTimeout(5000)
jest.mock('@github-ui/react-core/use-app-payload')

describe('error boundaries', () => {
  // This test was skipped as part of https://github.com/github/github/pull/333365
  // When running alone it always passes.  However, when running with certain other tests it sometimes fails
  // Since the failure is only due to the tests' environment/state, skipping it for the time being
  test.skip('shows a timeline error boundary when timeline fails to load', async () => {
    jest.spyOn(console, 'error').mockImplementation() // suppress console.error which we rethrow in the error boundary
    await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            frontTimeline: null, // this will cause the timeline to fail to load
          }
        },
      },
    })

    // Check that issue viewer was rendered
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    // check that the fallback was rendered
    expect(screen.getByText('Timeline cannot be loaded')).toBeInTheDocument()
  })
})
