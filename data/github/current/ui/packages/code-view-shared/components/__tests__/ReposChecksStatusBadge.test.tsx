import type {CheckRun} from '@github-ui/commit-checks-status'
import type {Repository} from '@github-ui/current-repository'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {ReposChecksStatusBadge} from '../ReposChecksStatusBadge'

const staleCheckRun = {state: 'stale', additionalContext: 'Marked stale'} as CheckRun
const skippedCheckRun = {state: 'skipped', additionalContext: 'Skipped'} as CheckRun

const responses: Record<string, unknown> = {
  '/monalisa/smile/commit/a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1/status-details': {
    checkRuns: [staleCheckRun, skippedCheckRun],
  },
}

jest.mock('@github-ui/verified-fetch', () => ({
  __esModule: true,
  verifiedFetchJSON: jest.fn((url: string) => {
    return Promise.resolve({
      json: () => Promise.resolve(responses[url]),
    })
  }),
}))

describe('ReposChecksStatusBadge', () => {
  test('displays badge when successful status is fetched', async () => {
    renderComponent('success')

    const icon = await screen.findByTestId('checks-status-badge-icon')
    expect(icon).toBeInTheDocument()
    await waitFor(() => expect(icon).toHaveAccessibleName('success'))
  })

  test('displays badge when failure status is fetched', async () => {
    renderComponent('failure')

    const icon = await screen.findByTestId('checks-status-badge-icon')
    expect(icon).toBeInTheDocument()
    await waitFor(async () => {
      expect(icon).toHaveAccessibleName('failure')
    })
  })

  test('no badge when no check statuses for the commit', async () => {
    renderComponent(undefined)

    return waitFor(async () => {
      const icon = screen.queryByTestId('checks-status-badge-icon')
      expect(icon).not.toBeInTheDocument()
    })
  })

  test('displays check runs', async () => {
    const {user} = renderComponent('success')

    const icon = await screen.findByTestId('checks-status-badge-icon')
    await user.click(icon)

    return waitFor(async () => {
      const runItems = screen.queryAllByTestId('check-run-item')
      expect(runItems.length).toBe(2)
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(runItems[0]!.textContent).toContain('Marked stale')
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(runItems[1]!.textContent).toContain('Skipped')
    })
  })
})

function renderComponent(status: string | undefined) {
  return render(
    <CurrentRepositoryProvider repository={{ownerLogin: 'monalisa', name: 'smile'} as Repository}>
      <ReposChecksStatusBadge oid="a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1" status={status} />
    </CurrentRepositoryProvider>,
  )
}
