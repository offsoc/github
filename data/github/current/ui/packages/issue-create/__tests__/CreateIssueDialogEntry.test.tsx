import {render} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'
import {act, screen, waitFor} from '@testing-library/react'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {type OperationDescriptor, RelayEnvironmentProvider} from 'react-relay'

import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {VALUES} from '../constants/values'
import {CreateIssueDialogEntry} from '../dialog/CreateIssueDialogEntry'
import {DisplayMode} from '../utils/display-mode'
import {buildMockRepository} from './helpers'
import type {OptionConfig} from '../utils/option-config'

jest.setTimeout(5000)

const mockRepositories = [
  buildMockRepository({
    name: 'cool-repo',
    owner: 'cool-org',
  }),
  buildMockRepository({
    name: 'empty-repo',
    owner: 'cool-org',
    noTemplates: true,
    noContactLinks: true,
    hasSecurityPolicy: false,
  }),
]

type CreateIssueDialogEntryWrappedType = {
  navigate?: (url: string) => void
  optionConfig?: OptionConfig
}

const CreateIssueDialogEntryWrapped = ({navigate = noop, optionConfig}: CreateIssueDialogEntryWrappedType) => {
  let isOpen = true

  return (
    <CreateIssueDialogEntry
      navigate={navigate}
      isCreateDialogOpen={isOpen}
      setIsCreateDialogOpen={v => (isOpen = v)}
      optionConfig={optionConfig}
    />
  )
}

test('does not render the repo picker by default in issue creation mode', async () => {
  const environment = setupRelayEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogEntryWrapped
        optionConfig={{
          defaultDisplayMode: DisplayMode.IssueCreation,
          scopedRepository: {
            id: mockRepositories[0]!.id,
            owner: mockRepositories[0]!.owner.login,
            name: mockRepositories[0]!.name,
          },
        }}
      />
    </RelayEnvironmentProvider>,
  )
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )
  expect(screen.queryByTestId('template-picker-button')).toBeNull()
})

test('does render the repo picker is specified in issue creation mode', async () => {
  const environment = setupRelayEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogEntryWrapped
        optionConfig={{
          defaultDisplayMode: DisplayMode.IssueCreation,
          issueCreateArguments: {
            repository: {
              owner: mockRepositories[0]!.owner.login,
              name: mockRepositories[0]!.name,
            },
          },
        }}
      />
    </RelayEnvironmentProvider>,
  )

  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )
  await waitFor(() => {
    expect(screen.queryByTestId('template-picker-button')).toBeVisible()
  })
})

test('redirects to the fullscreen issue creation when we bypass the template selection on issues#repo index', async () => {
  const environment = setupRelayEnvironment()

  const navigateFn = jest.fn()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogEntryWrapped
        optionConfig={{
          defaultDisplayMode: DisplayMode.IssueCreation,
          scopedRepository: {
            id: mockRepositories[1]!.id,
            owner: mockRepositories[1]!.owner.login,
            name: mockRepositories[1]!.name,
          },
          navigateToFullScreenOnTemplateChoice: true,
        }}
        navigate={navigateFn}
      />
    </RelayEnvironmentProvider>,
  )

  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Repository: () => ({
          ...mockRepositories[1],
        }),
      }),
    ),
  )

  const dialogs = screen.queryAllByRole('dialog')

  await waitFor(() => {
    expect(dialogs.length).toBe(0)
  })

  expect(screen.queryByTestId('template-picker-button')).toBeNull()

  expect(navigateFn).toHaveBeenCalledWith(`/issues/new?template=Blank+issue`)
})

test('can render scoped assignees', async () => {
  const environment = setupRelayEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogEntryWrapped
        optionConfig={{
          defaultDisplayMode: DisplayMode.IssueCreation,
          scopedRepository: {
            id: mockRepositories[0]!.id,
            owner: mockRepositories[0]!.owner.login,
            name: mockRepositories[0]!.name,
          },
          scopedAssignees: [
            {avatarUrl: 'https://avatars.githubusercontent.com/u/1', login: 'octocat'},
            {avatarUrl: 'https://avatars.githubusercontent.com/u/2', login: 'copilot'},
          ],
        }}
      />
    </RelayEnvironmentProvider>,
  )
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )
  const button = screen.getByLabelText('Select assignees')
  expect(button).toBeDisabled()
  expect(button).toHaveTextContent(/octocat, copilot/)
})

function setupRelayEnvironment() {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(TopRepositories, {
    topRepositoriesFirst: VALUES.repositoriesPreloadCount,
    hasIssuesEnabled: true,
  })
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, {
      RepositoryConnection: () => ({
        edges: mockRepositories.map(repo => ({
          node: repo,
        })),
      }),
    }),
  )

  environment.mock.queuePendingOperation(CurrentRepository, {
    owner: mockRepositories[1]?.owner,
    name: mockRepositories[1]?.name,
    includeTemplates: false,
  })
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => MockPayloadGenerator.generate(operation))

  return environment
}
