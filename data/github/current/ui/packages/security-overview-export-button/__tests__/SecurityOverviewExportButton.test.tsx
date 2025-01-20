import {announce} from '@github-ui/aria-live'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Flash} from '@primer/react'
import {act, screen} from '@testing-library/react'

import type {CreateExportResponse} from '../SecurityOverviewExportButton'
import {ExportError, SecurityOverviewExportButton} from '../SecurityOverviewExportButton'
import {getSecurityOverviewExportButtonProps} from '../test-utils/mock-data'

jest.useFakeTimers()
jest.mock('@github-ui/verified-fetch')
jest.mock('@github-ui/aria-live')

const oldWindowLocation = window.location

beforeAll(() => {
  // window.location.assign doesn't work in tests, so we need to mock it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const w = window as any
  delete w.location
  w.location = {assign: jest.fn()}
})

afterAll(() => {
  window.location = oldWindowLocation
})

beforeEach(() => {
  for (const m of [announce, verifiedFetch, window.location.assign]) {
    ;(m as jest.Mock).mockClear()
  }
})

afterEach(() => jest.runAllTimers())

test('Renders in stopped state', () => {
  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')
  expect(button).toHaveTextContent('Export CSV')
  expect(button.getAttribute('data-state')).toBe('stopped')
  // eslint-disable-next-line testing-library/no-node-access
  expect(button.querySelector('[data-component="leadingVisual"] .octicon-download')).not.toBeNull()

  expect(verifiedFetch).toHaveBeenCalledTimes(0)
})

test('Renders loading state when clicked', async () => {
  // Prevent component from progressing past the first fetch
  stubFetchAsUnresolved()

  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')
  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

  expect(button).toHaveTextContent('Export CSV')
  expect(button.getAttribute('data-state')).toBe('loading')
  // eslint-disable-next-line testing-library/no-node-access
  expect(button.querySelector('[data-component="leadingVisual"] [class^="Spinner"]')).not.toBeNull()

  expect(verifiedFetch).toHaveBeenCalledTimes(1)
})

test('Only executes once when clicked multiple times', async () => {
  // Prevent component from progressing past the first fetch
  stubFetchAsUnresolved()

  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')
  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement
  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement
  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

  expect(button).toHaveTextContent('Export CSV')
  expect(button.getAttribute('data-state')).toBe('loading')
  // eslint-disable-next-line testing-library/no-node-access
  expect(button.querySelector('[data-component="leadingVisual"] [class^="Spinner"]')).not.toBeNull()

  expect(verifiedFetch).toHaveBeenCalledTimes(1)
})

test('Polls job status until complete', async () => {
  stubCreateExportResponse()
  stubPollJobStatusResponse(202)
  stubPollJobStatusResponse(202)
  stubPollJobStatusResponse(200)

  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')

  // createExport and pollJobStatus(202)
  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement
  expect(verifiedFetch).toHaveBeenCalledTimes(2)
  expect(button.getAttribute('data-state')).toBe('loading')

  // pollJobStatus(202)
  await act(() => jest.runOnlyPendingTimers())
  expect(verifiedFetch).toHaveBeenCalledTimes(3)
  expect(button.getAttribute('data-state')).toBe('loading')

  // pollJobStatus(200)
  await act(() => jest.runOnlyPendingTimers())
  expect(verifiedFetch).toHaveBeenCalledTimes(4)
  expect(button.getAttribute('data-state')).toBe('stopped')

  await act(() => jest.runAllTimers())
  expect(verifiedFetch).toHaveBeenCalledTimes(4)
})

test('Navigates to download link', async () => {
  stubCreateExportResponse()
  stubPollJobStatusResponse(200)

  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')

  await act(() => button.click())
  await act(() => jest.runAllTimers())

  expect(verifiedFetch).toHaveBeenCalledTimes(2)
  expect(window.location.assign).toHaveBeenCalledTimes(1)
  expect(button.getAttribute('data-state')).toBe('stopped')
})

test('Announces export process ending in success', async () => {
  stubCreateExportResponse()
  stubPollJobStatusResponse(200)

  const props = getSecurityOverviewExportButtonProps()
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')

  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

  expect(announce).toHaveBeenCalledTimes(2)
  expect(announce).toHaveBeenNthCalledWith(
    1,
    'Generating your report. Stay on this page to automatically download the report.',
  )
  expect(announce).toHaveBeenNthCalledWith(2, 'Your report is ready and the download has started.')
})

test('Announces export process ending in success and email', async () => {
  stubCreateExportResponse()
  stubPollJobStatusResponse(200)

  const props = getSecurityOverviewExportButtonProps({startedBannerId: 'security-center-export-started-banner'})
  render(<SecurityOverviewExportButton {...props} />)

  const button = screen.getByRole('button')

  await act(() => button.click())
  await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

  expect(announce).toHaveBeenCalledTimes(2)
  expect(announce).toHaveBeenNthCalledWith(
    1,
    "Generating your report. You will receive an email when it's ready. Stay on this page to automatically download the report.",
  )
  expect(announce).toHaveBeenNthCalledWith(
    2,
    'Your report is ready and the download has started. An email with the report has also been sent to you.',
  )
})

describe('Error handling', () => {
  test('Announces export process ending in error', async () => {
    stubFetchAsRejected('Whoops!')

    const props = getSecurityOverviewExportButtonProps()
    render(<SecurityOverviewExportButton {...props} />)

    const button = screen.getByRole('button')

    await act(() => button.click())
    await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

    expect(announce).toHaveBeenCalledTimes(2)
    expect(announce).toHaveBeenNthCalledWith(
      1,
      'Generating your report. Stay on this page to automatically download the report.',
    )
    expect(announce).toHaveBeenNthCalledWith(2, 'Whoops!')
  })

  test('Hides error banner when clicked', async () => {
    // Prevent component from progressing past the first fetch
    stubFetchAsUnresolved()

    const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
    render(
      <>
        <Flash id="error-banner" data-testid="error-banner">
          <p>Error message</p>
        </Flash>
        <SecurityOverviewExportButton {...props} />
      </>,
    )

    const button = screen.getByRole('button')
    const banner = screen.getByTestId('error-banner')

    expect(banner).toBeVisible()

    await act(async () => button.click())
    await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

    expect(verifiedFetch).toHaveBeenCalledTimes(1)
    expect(banner).not.toBeVisible()
  })

  test("Doesn't hide error banners when clicked if there are no banners matching the provided ID", async () => {
    // Prevent component from progressing past the first fetch
    stubFetchAsUnresolved()

    const props = getSecurityOverviewExportButtonProps({errorBannerId: 'mismatch'})
    render(
      <>
        <Flash id="error-banner" data-testid="error-banner">
          <p>Error message</p>
        </Flash>
        <SecurityOverviewExportButton {...props} />
      </>,
    )

    const button = screen.getByRole('button')
    const banner = screen.getByTestId('error-banner')

    expect(banner).toBeVisible()

    await act(async () => button.click())
    await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

    expect(verifiedFetch).toHaveBeenCalledTimes(1)
    expect(banner).toBeVisible()
  })

  describe('Create export request fails', () => {
    test('Sets stopped state if creating the export results in a rejected promise', async () => {
      stubFetchAsRejected('BOOM!')

      const props = getSecurityOverviewExportButtonProps()
      render(<SecurityOverviewExportButton {...props} />)

      const button = screen.getByRole('button')

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(button.getAttribute('data-state')).toBe('stopped')
    })

    test('Shows error banner with expected message', async () => {
      stubFetchAsRejected('BOOM!')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')

      expect(banner).not.toBeVisible()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(banner).toBeVisible()
      // eslint-disable-next-line testing-library/no-node-access
      expect(banner.querySelector('* > p')?.textContent).toBe('BOOM!')
    })

    test("Doesn't show error banner if there's no banner with an ID that matches the provided one", async () => {
      stubFetchAsRejected('BOOM!')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'mismatch'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')
      // eslint-disable-next-line testing-library/no-node-access
      const mismatchBanner = document.getElementById('mismatch')

      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()
    })
  })

  describe('Create export request returns error in response', () => {
    test('Sets stopped state', async () => {
      stubCreateExportResponse('test error')

      const props = getSecurityOverviewExportButtonProps()
      render(<SecurityOverviewExportButton {...props} />)

      const button = screen.getByRole('button')

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(button.getAttribute('data-state')).toBe('stopped')
    })

    test('Shows error banner with expected message', async () => {
      stubCreateExportResponse('Dagnabbit')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')

      expect(banner).not.toBeVisible()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(banner).toBeVisible()
      // eslint-disable-next-line testing-library/no-node-access
      expect(banner.querySelector('* > p')?.textContent).toBe('Dagnabbit')
    })

    test("Doesn't show error banner if there's no banner with an ID that matches the provided one", async () => {
      stubCreateExportResponse('test error')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'mismatch'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')
      // eslint-disable-next-line testing-library/no-node-access
      const mismatchBanner = document.getElementById('mismatch')

      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(1)
      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()
    })
  })

  describe('Poll job status fails', () => {
    test('Returns to stopped state', async () => {
      stubCreateExportResponse()
      stubFetchAsRejected('BOOM!')

      const props = getSecurityOverviewExportButtonProps()
      render(<SecurityOverviewExportButton {...props} />)

      const button = screen.getByRole('button')

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(2)
      expect(button.getAttribute('data-state')).toBe('stopped')
    })

    test('Shows error banner with expected message', async () => {
      stubCreateExportResponse()
      stubFetchAsRejected('Something went wrong')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')

      expect(banner).not.toBeVisible()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(2)
      expect(banner).toBeVisible()
      // eslint-disable-next-line testing-library/no-node-access
      expect(banner.querySelector('* > p')?.textContent).toBe('Something went wrong')
    })

    test('Handles unexpected response gracefully', async () => {
      stubCreateExportResponse()
      stubFetchAsNonJsonResponse(429)

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')

      expect(banner).not.toBeVisible()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(2)
      expect(banner).toBeVisible()
      // eslint-disable-next-line testing-library/no-node-access
      expect(banner.querySelector('* > p')?.textContent).toBe(
        'Something went wrong while exporting your data. Please try again later. If the problem persists, please contact support.',
      )
    })

    test("Doesn't show error banner if there's no banner with an ID that matches the provided one", async () => {
      stubCreateExportResponse()
      stubFetchAsRejected('BOOM!')

      const props = getSecurityOverviewExportButtonProps({errorBannerId: 'mismatch'})
      render(
        <>
          <Flash id="error-banner" data-testid="error-banner" hidden={true}>
            <p>Error message</p>
          </Flash>
          <SecurityOverviewExportButton {...props} />
        </>,
      )

      const button = screen.getByRole('button')
      const banner = screen.getByTestId('error-banner')
      // eslint-disable-next-line testing-library/no-node-access
      const mismatchBanner = document.getElementById('mismatch')

      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()

      await act(async () => button.click())
      await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

      expect(verifiedFetch).toHaveBeenCalledTimes(2)
      expect(banner).not.toBeVisible()
      expect(mismatchBanner).toBeNull()
    })
  })

  describe('Poll job status returns error status code', () => {
    for (const code of [404, 500]) {
      test(`Returns to stopped state for response code ${code}`, async () => {
        stubCreateExportResponse()
        stubPollJobStatusResponse(code)

        const props = getSecurityOverviewExportButtonProps()
        render(<SecurityOverviewExportButton {...props} />)

        const button = screen.getByRole('button')

        await act(async () => button.click())
        await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

        expect(verifiedFetch).toHaveBeenCalledTimes(2)
        expect(button.getAttribute('data-state')).toBe('stopped')
      })

      test(`Shows error banner with expected message for response code ${code}`, async () => {
        stubCreateExportResponse()
        stubPollJobStatusResponse(code, "We've encountered a problem")

        const props = getSecurityOverviewExportButtonProps({errorBannerId: 'error-banner'})
        render(
          <>
            <Flash id="error-banner" data-testid="error-banner" hidden={true}>
              <p>Error message</p>
            </Flash>
            <SecurityOverviewExportButton {...props} />
          </>,
        )

        const button = screen.getByRole('button')
        const banner = screen.getByTestId('error-banner')

        expect(banner).not.toBeVisible()

        await act(async () => button.click())
        await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

        expect(verifiedFetch).toHaveBeenCalledTimes(2)
        expect(banner).toBeVisible()
        // eslint-disable-next-line testing-library/no-node-access
        expect(banner.querySelector('* > p')?.textContent).toBe("We've encountered a problem")
      })

      test(`Doesn't show error banner if there's no banner with an ID that matches the provided one for response code ${code}`, async () => {
        stubCreateExportResponse()
        stubPollJobStatusResponse(code)

        const props = getSecurityOverviewExportButtonProps({errorBannerId: 'mismatch'})
        render(
          <>
            <Flash id="error-banner" data-testid="error-banner" hidden={true}>
              <p>Error message</p>
            </Flash>
            <SecurityOverviewExportButton {...props} />
          </>,
        )

        const button = screen.getByRole('button')
        const banner = screen.getByTestId('error-banner')
        // eslint-disable-next-line testing-library/no-node-access
        const mismatchBanner = document.getElementById('mismatch')

        expect(banner).not.toBeVisible()
        expect(mismatchBanner).toBeNull()

        await act(async () => button.click())
        await act(() => jest.runOnlyPendingTimers()) // move past setTimeout "hack" after loading announcement

        expect(verifiedFetch).toHaveBeenCalledTimes(2)
        expect(banner).not.toBeVisible()
        expect(mismatchBanner).toBeNull()
      })
    }
  })
})

function stubFetchAsRejected(error: string): void {
  ;(verifiedFetch as jest.Mock).mockImplementation(() => Promise.reject(new ExportError(error)))
}

function stubFetchAsUnresolved(): void {
  ;(verifiedFetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
}

function stubCreateExportResponse(error?: string): void {
  ;(verifiedFetch as jest.Mock).mockResolvedValueOnce({
    json: () =>
      Promise.resolve<CreateExportResponse>({
        jobStatusUrl: '/_job/1234',
        downloadExportUrl: '/orgs/test-org/security/risk/export?token=1234',
        error,
      }),
  })
}

function stubFetchAsNonJsonResponse(code: number): void {
  ;(verifiedFetch as jest.Mock).mockResolvedValueOnce({
    status: code,
    html: `-<h1>Whoa there!</h1>`,
  })
}

function stubPollJobStatusResponse(code: number, error?: string): void {
  ;(verifiedFetch as jest.Mock).mockResolvedValueOnce({
    status: code,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    json: () => Promise.resolve({job: {error_message: error}}),
  })
}
