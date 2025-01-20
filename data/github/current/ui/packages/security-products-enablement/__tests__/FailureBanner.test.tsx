import FailureBanner from '../components/FailureBanner'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {ENABLEMENT_FAILURES_MAP} from '../utils/helpers'

const mockCloseFn = jest.fn()
const mockSearchFn = jest.fn()
const defaultProps = {
  closeFn: mockCloseFn,
  searchFn: mockSearchFn,
  failureCounts: {'of an unknown reason': 1},
}

describe('FailureBanner', () => {
  // Copied from https://github.com/primer/react/blob/main/packages/react/src/Banner/Banner.test.tsx:
  beforeEach(() => {
    // Note: this error occurs due to our usage of `@container` within a
    // `<style>` tag in Banner. The CSS parser for jsdom does not support this
    // syntax and will fail with an error containing the message below.
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error
    jest.spyOn(console, 'error').mockImplementation((value, ...args) => {
      if (!value?.message?.includes('Could not parse CSS stylesheet')) {
        originalConsoleError(value, ...args)
      }
    })
  })

  beforeEach(() => {
    mockCloseFn.mockClear
    mockSearchFn.mockClear
  })

  it('does not render if failureCounts is empty', async () => {
    const props = {...defaultProps, failureCounts: {}}
    render(<FailureBanner {...props} />)

    // Use queryByTestId so we don't fail when the element isn't found:
    const element = screen.queryByTestId('failure-banner')
    expect(element).not.toBeInTheDocument()
  })

  it('calls closeFn when the X is clicked', async () => {
    const {user} = render(<FailureBanner {...defaultProps} />)

    const dismissButton = screen.getByLabelText('Dismiss banner')
    await user.click(dismissButton)
    expect(mockCloseFn).toHaveBeenCalled()
  })

  it('renders one failure when only one is passed', async () => {
    render(<FailureBanner {...defaultProps} />)

    const element = screen.getByTestId('failure-banner')
    expect(element).toHaveTextContent(
      '1 repository failed to apply because of an unknown reason. View all failed repositories.',
    )
  })

  it('renders multiple failure as separate lines', async () => {
    const failureCounts = {
      'of an unknown reason': 1,
      'of an Enterprise policy': 2,
      'of a code scanning conflict': 999,
    }
    const props = {...defaultProps, failureCounts}
    render(<FailureBanner {...props} />)

    const element = screen.getByTestId('failure-banner')
    expect(element).toHaveTextContent('1002 repositories failed to apply:')
    expect(element).toHaveTextContent('1 repository failed because of an unknown reason.')
    expect(element).toHaveTextContent('2 repositories failed because of an Enterprise policy.')
    expect(element).toHaveTextContent('999 repositories failed because of a code scanning conflict')
    expect(element).toHaveTextContent('View all failed repositories')
  })

  it('sets the search query to `config-status:failed` when `View all failed repositories` is clicked', async () => {
    const {user} = render(<FailureBanner {...defaultProps} />)

    const link = screen.getByText('View all failed repositories')
    await user.click(link)
    expect(mockSearchFn).toHaveBeenCalled()
  })

  // This test is meant to ensure that the ENABLEMENT_FAILURES_MAP always contains a frontend_banner_reason.
  // If you're seeing a failure here it might be because you updated the ENABLEMENT_FAILURES_MAP and did not add a
  // frontend_banner_reason. Please add one so nothing breaks. :) <3
  it('ENABLEMENT_FAILURES_MAP has frontend_banner_reason definitions for all failures!', async () => {
    const mapKeys = new Set(ENABLEMENT_FAILURES_MAP.keys())
    for (const key of mapKeys) {
      const bannerMapValue: {frontend_banner_reason?: string} | undefined = ENABLEMENT_FAILURES_MAP.get(key)
      expect(bannerMapValue).toBeTruthy()
      expect(bannerMapValue!['frontend_banner_reason']!).toBeTruthy()
    }
  })
})
