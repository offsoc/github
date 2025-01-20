import {act, render, screen} from '@testing-library/react'

import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {RelayEnvironmentProvider} from 'react-relay'
import {IssueViewer} from '../IssueViewer'

jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: () => ['', jest.fn()],
}))

jest.setTimeout(5000)
jest.mock('@github-ui/react-core/use-app-payload')

describe('error boundaries', () => {
  test('shows not found page when issue is not loadable', async () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn()
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <IssueViewer itemIdentifier={{type: 'Issue', number: 0, owner: 'no-one', repo: 'empty'}} />
      </RelayEnvironmentProvider>,
    )

    await act(async () => {
      environment.mock.rejectMostRecentOperation(new Error('NOT_FOUND'))
    })

    expect(await screen.findByText('Issue not found')).toBeInTheDocument()
    expect(screen.queryByText("Couldn't load")).not.toBeInTheDocument()
  })

  test('shows generic error on uncaught error', async () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn()
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <IssueViewer itemIdentifier={{type: 'Issue', number: 0, owner: 'no-one', repo: 'empty'}} />
      </RelayEnvironmentProvider>,
    )

    await act(async () => {
      environment.mock.rejectMostRecentOperation(new Error())
    })

    expect(await screen.findByText("Couldn't load")).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
  })
})
