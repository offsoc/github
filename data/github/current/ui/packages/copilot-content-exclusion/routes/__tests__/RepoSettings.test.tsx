import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import {makeContentExclusionRepoSettingsRoutePayload} from '../../test-utils/mock-data'
import {RepoSettings} from '../RepoSettings'

const useCopilotContentExclusionMutation = jest.fn(({onComplete}) => {
  onComplete(
    {
      organization: 'test-org',
      lastEdited: {
        login: 'test-new-user',
        time: '2021-09-09T15:00:00Z',
        link: undefined,
      },
      message: 'successful message',
    },
    200,
  )
})
jest.mock('../../hooks/use-fetchers', () => ({
  useCopilotContentExclusionMutation() {
    return [useCopilotContentExclusionMutation, false]
  },
}))

async function waitForCodeMirror(cb: () => void) {
  cb()
  await screen.findByTestId('codemirror-editor', undefined, {timeout: 10_000})
}

describe('RepoSettings', () => {
  test('renders the repo setting content exclusion page', async () => {
    await waitForCodeMirror(() =>
      render(<RepoSettings />, {routePayload: makeContentExclusionRepoSettingsRoutePayload()}),
    )

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Content exclusion')

    expect(screen.getByRole('button', {name: 'Save changes'})).toBeInTheDocument()
    expect(
      screen.getByText('Use separate lines to choose which folders and files will be excluded by GitHub Copilot'),
    ).toBeInTheDocument()
  })

  test('renders the link to audit log when available (user is an org admin)', async () => {
    const routePayload = makeContentExclusionRepoSettingsRoutePayload()
    routePayload.lastEdited.link =
      '/organizations/test-org/settings/audit-log?q=repo:test-org/test-repo+action:copilot.content_exclusion_changed'

    await waitForCodeMirror(() => render(<RepoSettings />, {routePayload}))

    expect(screen.getByRole('link', {name: 'View audit log'})).toHaveAttribute(
      'href',
      '/organizations/test-org/settings/audit-log?q=repo:test-org/test-repo+action:copilot.content_exclusion_changed',
    )
  })

  // Flakey test! See https://github.com/github/web-systems/issues/2277 for more information
  test.skip('renders no link to audit log when not available (user is a repo admin but not an org admin)', async () => {
    await waitForCodeMirror(() =>
      render(<RepoSettings />, {routePayload: makeContentExclusionRepoSettingsRoutePayload()}),
    )

    expect(screen.queryByRole('link', {name: 'View audit log'})).not.toBeInTheDocument()
  })

  test('shows a successful message and toast when changes have been saved successfully', async () => {
    await waitForCodeMirror(() =>
      render(<RepoSettings />, {routePayload: makeContentExclusionRepoSettingsRoutePayload()}),
    )
    screen.getByText('Use separate lines to choose which folders and files will be excluded by GitHub Copilot')

    fireEvent.click(screen.getByRole('button', {name: 'Save changes'}))

    screen.getByText('successful message')
    screen.getByTestId('ui-app-toast-success')
    expect(screen.getByTestId('ui-app-toast-success')).toHaveTextContent(/Excluded paths updated/)
  })

  test('update the last edited by when changes have been saved successfully', async () => {
    await waitForCodeMirror(() =>
      render(<RepoSettings />, {routePayload: makeContentExclusionRepoSettingsRoutePayload()}),
    )
    const lastEditedBy = screen.getByTestId('copilot-content-exclusion-last-edited-by')
    expect(lastEditedBy.textContent).toContain('test-user last edited')

    fireEvent.click(screen.getByRole('button', {name: 'Save changes'}))

    expect(lastEditedBy.textContent).not.toContain('test-user last edited')
    expect(lastEditedBy.textContent).toContain('test-new-user last edited')
  })

  test('shows an error message and toast when changes did not get saved successfully', async () => {
    useCopilotContentExclusionMutation.mockImplementationOnce(({onError}) => {
      onError(new Error('Error in line 2 (Unexpected character)'))
    })
    await waitForCodeMirror(() =>
      render(<RepoSettings />, {routePayload: makeContentExclusionRepoSettingsRoutePayload()}),
    )
    screen.getByText('Use separate lines to choose which folders and files will be excluded by GitHub Copilot')

    fireEvent.click(screen.getByRole('button', {name: 'Save changes'}))

    screen.getByText('Error in line 2 (Unexpected character)')
    screen.getByTestId('ui-app-toast-error')
    expect(screen.getByTestId('ui-app-toast-error')).toHaveTextContent(
      /Excluded paths not updated, check the errors and try again./,
    )
  })
})
