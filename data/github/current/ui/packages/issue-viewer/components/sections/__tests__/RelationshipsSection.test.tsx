import {act, screen, waitFor} from '@testing-library/react'
import {LABELS} from '../../../constants/labels'
import type {User} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {ThemeProvider} from '@primer/react'
import {IssuePickerSearchGraphQLQuery} from '@github-ui/item-picker/IssuePicker'
import type {IssuePickerSearchQuery} from '@github-ui/item-picker/IssuePickerSearchQuery.graphql'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import PRELOAD_CURRENT_REPOSITORY_QUERY from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {MockPayloadGenerator} from 'relay-test-utils'
import {RelationshipsSection, RelationshipsSectionGraphqlQuery} from '../relations-section/RelationshipsSection'
import type {RelationshipsSectionQuery} from '../relations-section/__generated__/RelationshipsSectionQuery.graphql'

const owner = 'owner'
const repo = 'repo'
const number = 10

const urlParams = {
  owner,
  repo,
  number,
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
    useParams: () => urlParams,
  }
})

const findAlertDialog = (): Promise<HTMLElement> => {
  return screen.findByRole('alertdialog')
}

const addNewParent = async (user: User): Promise<undefined> => {
  await user.click(screen.getByRole('button'))
  await user.click(screen.getByLabelText('Add parent'))

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })
  const option = screen.getByRole('option')
  await user.click(option)
}

function setupEnvironment(parentMock?: Record<string, unknown>) {
  const {relayMockEnvironment, user} = renderRelay<{
    relationsSectionQuery: RelationshipsSectionQuery
    issuePickerSearchGraphQLQuery: IssuePickerSearchQuery
    repositoryPickerCurrentRepoQuery: RepositoryPickerCurrentRepoQuery
    topRepositories: RepositoryPickerTopRepositoriesQuery
    preloadCurrentRepositoryQuery: RepositoryPickerCurrentRepoQuery
  }>(
    ({queryRefs: {relationsSectionQuery}}) => (
      <ThemeProvider>
        <RelationshipsSection queryRef={relationsSectionQuery} />
      </ThemeProvider>
    ),
    {
      relay: {
        queries: {
          preloadCurrentRepositoryQuery: {
            type: 'preloaded',
            query: PRELOAD_CURRENT_REPOSITORY_QUERY,
            variables: {owner: 'orgA', name: 'test-repo', includeTemplates: false},
          },
          topRepositories: {
            type: 'preloaded',
            query: TopRepositories,
            variables: {topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: null},
          },
          relationsSectionQuery: {
            type: 'preloaded',
            query: RelationshipsSectionGraphqlQuery,
            variables: {owner, repo, number},
          },
          issuePickerSearchGraphQLQuery: {
            type: 'preloaded',
            query: IssuePickerSearchGraphQLQuery,
            variables: {
              assignee: 'repo:orgA/test-repo commenter:@me',
              author: 'repo:orgA/test-repo commenter:@me',
              commenters: 'repo:orgA/test-repo commenter:@me',
              mentions: 'repo:orgA/test-repo commenter:@me',
              open: 'repo:orgA/test-repo commenter:@me',
              first: 10,
              resource: '',
              queryIsUrl: false,
            },
          },
          repositoryPickerCurrentRepoQuery: {
            type: 'preloaded',
            query: CurrentRepository,
            variables: {owner: 'orgA', name: 'test-repo'},
          },
        },
        mockResolvers: {
          RepositoryConnection() {
            return {
              edges: [
                {
                  node: {
                    id: mockRelayId(),
                    name: 'repoA',
                    owner: {
                      login: 'orgA',
                    },
                    isPrivate: false,
                    isArchived: parentMock?.repoIsArchived || false,
                    nameWithOwner: `orgA/repoA`,
                  },
                },
              ],
            }
          },
          Query() {
            return {
              commenters: {
                nodes: [{title: 'issueA', id: mockRelayId()}],
              },
              mentions: [],
              assignee: [],
              author: [],
              open: [],
            }
          },
          Issue({path, args}) {
            if (path?.includes('nodes')) {
              return {
                id: 'parent-issue-id',
                repository: {
                  id: 'repo-id',
                  nameWithOwner: 'orgA/test-repo',
                  owner: {
                    login: 'orgA',
                  },
                  isArchived: parentMock?.repoIsArchived || false,
                },
              }
            }
            if (path?.includes('parent')) {
              return parentMock
            }
            if (args?.number === urlParams.number) {
              return {
                id: '10',
                databaseId: 25,
                parent: parentMock || null,
                viewerCanUpdateMetadata: !parentMock?.userHasReadOnlyPermission,
                repository: {
                  isArchived: parentMock?.repoIsArchived || false,
                },
              }
            }
            return {id: path?.[0], title: path?.[0], __typename: 'Issue'}
          },
        },
      },
    },
  )

  return {environment: relayMockEnvironment, user}
}

describe('permissions', () => {
  test('renders header with actions when has permission', async () => {
    setupEnvironment({userHasReadOnlyPermission: false})

    expect(await screen.findByRole('button', {name: 'Edit Relationships'})).toBeInTheDocument()
  })

  test('renders readonly header when without permission', async () => {
    setupEnvironment({userHasReadOnlyPermission: true})

    await waitFor(() => expect(screen.queryByRole('button', {name: 'Edit Relationships'})).not.toBeInTheDocument())
  })

  test('renders readonly header when repo is archived', async () => {
    setupEnvironment({repoIsArchived: true})

    await waitFor(() => expect(screen.queryByRole('button', {name: 'Edit Relationships'})).not.toBeInTheDocument())
  })
})

test('renders the parent when present', async () => {
  setupEnvironment({title: 'parent title'})

  expect(await screen.findByLabelText('parent title')).toBeInTheDocument()
})

test('renders empty message when not present', async () => {
  setupEnvironment()

  expect(await screen.findByText(LABELS.emptySections.relationships)).toBeInTheDocument()
})

test('should only have one menu open at a time', async () => {
  const {user} = setupEnvironment()

  await user.click(screen.getByText('Edit Relationships'))

  expect(await screen.findByLabelText('Add parent')).toBeInTheDocument()

  await user.click(screen.getByLabelText('Add parent'))

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  await user.click(screen.getByText('Edit Relationships'))

  expect(await screen.findByLabelText('Add parent')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })
})

test('should be able to add new parent', async () => {
  const {environment, user} = setupEnvironment()

  await addNewParent(user)

  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('setParentMutation')
      expect(operation.fragment.variables.input.issueId).toEqual('parent-issue-id')
      expect(operation.fragment.variables.input.subIssueId).toEqual('10')
      return MockPayloadGenerator.generate(operation, {
        Issue({path}) {
          const parent = {id: operation.fragment.variables.input.issueId, title: 'new parent'}
          if (path?.includes('parent')) {
            return parent
          }
          return {
            id: operation.fragment.variables.input.subIssueId,
            parent,
          }
        },
      })
    })
  })
  await waitFor(() => {
    expect(screen.getByLabelText('new parent')).toBeInTheDocument()
  })
})

test('should be able to change parent', async () => {
  const {environment, user} = setupEnvironment({title: 'old parent', databaseId: Math.ceil(Math.random() * 1000)})

  await act(() => {
    screen.getByRole('button').click()
  })

  await act(() => {
    screen.getByLabelText('Change or remove parent').click()
  })

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })
  const option = screen.getByRole('option')
  await user.click(option)
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('setParentMutation')
      expect(operation.fragment.variables.input.issueId).toEqual('parent-issue-id')
      expect(operation.fragment.variables.input.subIssueId).toEqual('10')
      return MockPayloadGenerator.generate(operation, {
        Issue({path}) {
          const parent = {id: operation.fragment.variables.input.issueId, title: 'new parent'}
          if (path?.includes('parent')) {
            return parent
          }
          return {
            id: operation.fragment.variables.input.subIssueId,
            parent,
          }
        },
      })
    })
  })
  await waitFor(() => {
    expect(screen.getByLabelText('new parent')).toBeInTheDocument()
  })
})

test('should be able to switch between repository and issue pickers', async () => {
  const {user} = setupEnvironment({title: 'old parent'})

  await act(() => {
    screen.getByRole('button').click()
  })

  await act(() => {
    screen.getByLabelText('Change or remove parent').click()
  })

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })
  const backButton = await screen.findByRole('button', {name: 'Back to repository selection'})
  expect(backButton).toBeInTheDocument()

  await user.click(backButton)

  expect(await screen.findByRole('heading', {name: 'Select a repository'})).toBeInTheDocument()

  const repoOptions = await screen.findAllByRole('option')
  expect(repoOptions).toHaveLength(1)

  await user.click(repoOptions[0] as HTMLElement)

  await waitFor(() => {
    expect(screen.getByRole('button', {name: 'Back to repository selection'})).toBeInTheDocument()
  })
})

test('dialog is present when there is a breadth limit', async () => {
  const mockError = 'Parent cannot have more than 50 sub-issues'
  const {environment, user} = setupEnvironment()

  await addNewParent(user)
  await act(async () => {
    environment.mock.rejectMostRecentOperation(() => new Error(mockError))
  })

  const alert = await findAlertDialog()
  expect(alert).toBeInTheDocument()

  const heading = await screen.findByText('Sub-issue limit reached')
  expect(heading).toBeInTheDocument()
})

test('dialog is present when there is a depth limit error', async () => {
  const mockError =
    'You can’t add more than 7 layers of sub-issues. To add a sub-issue, remove a parent issue at any level.'
  const {environment, user} = setupEnvironment()

  await addNewParent(user)
  await act(async () => {
    environment.mock.rejectMostRecentOperation(() => new Error(mockError))
  })

  const alert = await findAlertDialog()
  expect(alert).toBeInTheDocument()

  const heading = await screen.findByText('Sub-issue limit reached')
  expect(heading).toBeInTheDocument()
})

test('dialog is present when there is a circular reference error', async () => {
  const mockError = 'Failed to add sub-issue: Sub issue may not create a circular dependency'
  const {environment, user} = setupEnvironment()

  await addNewParent(user)
  await act(async () => {
    environment.mock.rejectMostRecentOperation(() => new Error(mockError))
  })

  const alert = await findAlertDialog()
  expect(alert).toBeInTheDocument()

  const heading = await screen.findByText('Sub-issue circular dependency')
  expect(heading).toBeInTheDocument()
})
