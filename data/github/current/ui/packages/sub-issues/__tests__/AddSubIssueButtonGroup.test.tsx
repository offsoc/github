import {act, screen, waitFor, within} from '@testing-library/react'
import {AddSubIssueButtonGroup} from '../components/AddSubIssueButtonGroup'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {User} from '@github-ui/react-core/test-utils'
import {ThemeProvider} from '@primer/react'
import {graphql} from 'react-relay'
import type {AddSubIssueButtonGroupTestQuery} from './__generated__/AddSubIssueButtonGroupTestQuery.graphql'
import {TopRepositories, CurrentRepository} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {IssuePickerSearchQuery} from '@github-ui/item-picker/IssuePickerSearchQuery.graphql'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {buildIssue, buildRepository} from '../test-utils/helpers'
import {IssuePickerSearchGraphQLQuery} from '@github-ui/item-picker/IssuePicker'
import PRELOAD_CURRENT_REPOSITORY_QUERY from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {SubIssueStateProvider} from '../components/SubIssueStateContext'
import type {AddSubIssueButtonGroupQuery} from '../components/__generated__/AddSubIssueButtonGroupQuery.graphql'

const findMoreOptionsButton = (): Promise<HTMLElement> => {
  return screen.findByLabelText('View more sub-issue options')
}

const findAddExistingButton = (): Promise<HTMLElement> => {
  return screen.findByText('Add existing issue')
}

const findCreateSubIssueButton = (): Promise<HTMLElement> => {
  return screen.findByRole('button', {name: 'Create sub-issue'})
}

const findAlertDialog = (): Promise<HTMLElement> => {
  return screen.findByRole('alertdialog')
}

const findDialogCloseButton = (): Promise<HTMLElement> => {
  return screen.findByLabelText('Close')
}

const findIssuePicker = (): HTMLElement | null => {
  return screen.queryByLabelText('Back to repository selection')
}

const getIssueListItem = async (index: number): Promise<HTMLElement | undefined> => {
  const issueList = await screen.findByLabelText('issue results')
  return (await within(issueList).findAllByRole('option'))[index]
}

const addExistingItem = async (user: User): Promise<undefined> => {
  const moreOptionsButton = await findMoreOptionsButton()
  expect(moreOptionsButton).toBeInTheDocument()
  await user.click(moreOptionsButton)

  const addExistingButton = await findAddExistingButton()
  expect(addExistingButton).toBeInTheDocument()
  await user.click(addExistingButton)

  const picker = findIssuePicker()
  expect(picker).toBeInTheDocument()

  const issueItem = await getIssueListItem(0)
  expect(issueItem).toBeInTheDocument()

  if (issueItem) {
    await user.click(issueItem)
  }
}

type renderOpts = {
  includeParent?: boolean
  childIssueCount?: number
  fetchSubIssues?: boolean
}

const defaultRenderOpts = {
  includeParent: false,
  childIssueCount: 0,
  fetchSubIssues: true,
}

const renderButtonGroup = ({includeParent, childIssueCount, fetchSubIssues}: renderOpts = defaultRenderOpts) => {
  const {relayMockEnvironment, user} = renderRelay<{
    addSubIssueButtonGroupTestQuery: AddSubIssueButtonGroupTestQuery
    addSubIssueButtonGroupQuery: AddSubIssueButtonGroupQuery
    topRepositories: RepositoryPickerTopRepositoriesQuery
    issuePickerSearchGraphQLQuery: IssuePickerSearchQuery
    repositoryPickerCurrentRepoQuery: RepositoryPickerCurrentRepoQuery
    preloadCurrentRepositoryQuery: RepositoryPickerCurrentRepoQuery
  }>(
    ({queryData}) => (
      <ThemeProvider>
        <SubIssueStateProvider>
          <AddSubIssueButtonGroup issue={queryData.addSubIssueButtonGroupTestQuery.node!} />{' '}
        </SubIssueStateProvider>
      </ThemeProvider>
    ),
    {
      relay: {
        queries: {
          addSubIssueButtonGroupTestQuery: {
            type: 'fragment',
            query: graphql`
              query AddSubIssueButtonGroupTestQuery($fetchSubIssues: Boolean!) @relay_test_operation {
                node(id: "I_123") {
                  ... on Issue {
                    ...AddSubIssueButtonGroup @arguments(fetchSubIssues: $fetchSubIssues)
                  }
                }
              }
            `,
            variables: {fetchSubIssues: fetchSubIssues ?? true},
          },
          topRepositories: {
            type: 'preloaded',
            query: TopRepositories,
            variables: {topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: null},
          },
          addSubIssueButtonGroupQuery: {
            type: 'lazy',
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
          preloadCurrentRepositoryQuery: {
            type: 'preloaded',
            query: PRELOAD_CURRENT_REPOSITORY_QUERY,
            variables: {owner: 'orgA', name: 'test-repo', includeTemplates: false},
          },
        },
        mockResolvers: {
          RepositoryConnection() {
            return {
              edges: [
                {node: buildRepository({owner: 'orgA', name: 'repoA'})},
                {node: buildRepository({owner: 'orgA', name: 'repoB'})},
                {node: buildRepository({owner: 'orgB', name: 'repoC'})},
              ],
            }
          },
          Query() {
            return {
              commenters: {
                nodes: [buildIssue({title: 'issueA', databaseId: 1})],
              },
              mentions: {
                nodes: [buildIssue({title: 'mentions', databaseId: 2})],
              },
              assignee: {
                nodes: [buildIssue({title: 'assignee', databaseId: 3})],
              },
              author: {
                nodes: [buildIssue({title: 'author', databaseId: 4})],
              },
              open: {
                nodes: [buildIssue({title: 'open', databaseId: 5})],
              },
            }
          },
          Issue({path}) {
            // Already selected issue
            if (path?.includes('subIssues')) {
              return {
                id: 'initial-sub-issue-id',
                repository: {
                  id: 'repo-id',
                  nameWithOwner: 'orgA/test-repo',
                  owner: {
                    login: 'orgA',
                  },
                },
              }
            }
            // Parent issue, if needed for confirming parent replacement
            if (path?.includes('parent')) {
              return {
                // Why not just return null if  includeParent is false? Because, the mock resolvers
                // need to be set for the specific path to be able to properly return null. Doing this at a higher
                // level would result in the default mock data like <issue-mock-id-1> being returned.
                id: includeParent ? 'parent-issue-id' : null,
              }
            }

            // Issues to be shown in the picker
            if (path?.includes('nodes')) {
              return {
                id: 'sub-issue-id',
                repository: {
                  id: 'repo-id',
                  nameWithOwner: 'orgA/test-repo',
                  owner: {
                    login: 'orgA',
                  },
                },
              }
            }

            if (childIssueCount && childIssueCount > 0) {
              return {
                id: 'issue-id',
                repository: {
                  id: 'repo-id',
                  nameWithOwner: 'orgA/test-repo',
                  owner: {
                    login: 'orgA',
                  },
                },
                subIssues: {
                  nodes: new Array(childIssueCount).fill({}),
                },
              }
            }

            return {
              id: 'issue-id',
              repository: {
                id: 'repo-id',
                nameWithOwner: 'orgA/test-repo',
                owner: {
                  login: 'orgA',
                },
              },
              subIssues: {},
            }
          },
        },
      },
    },
  )

  return {environment: relayMockEnvironment, user}
}

describe('AddSubIssueButtonGroup', () => {
  beforeEach(() => {
    mockClientEnv({
      featureFlags: ['sub_issues'],
    })
  })

  test('can render the AddSubIssueButtonGroup', async () => {
    renderButtonGroup()
    expect(await findCreateSubIssueButton()).toBeInTheDocument()
  })

  test('can render the AddSubIssueButtonGroup without fetching sub-issues', async () => {
    renderButtonGroup({fetchSubIssues: false})
    expect(await findCreateSubIssueButton()).toBeInTheDocument()
  })

  test('can show and hide the picker', async () => {
    const {user} = renderButtonGroup()
    const moreOptionsButton = await findMoreOptionsButton()
    expect(moreOptionsButton).toBeInTheDocument()
    await user.click(moreOptionsButton)

    const addExistingButton = await findAddExistingButton()
    expect(addExistingButton).toBeInTheDocument()
    await user.click(addExistingButton)

    let picker = findIssuePicker()
    expect(picker).toBeInTheDocument()

    await user.keyboard('{Escape}')

    picker = findIssuePicker()
    expect(picker).not.toBeInTheDocument()
  })

  test('can show picker with Alt+Shift+A', async () => {
    const {user} = renderButtonGroup()

    const moreOptionsButton = await findMoreOptionsButton()
    expect(moreOptionsButton).toBeInTheDocument()

    await user.keyboard('{Alt>}{Shift>}A{/Shift}{/Alt}')

    const picker = findIssuePicker()
    expect(picker).toBeInTheDocument()
  })

  test('does not accept keyboard shortcut when issue create dialog is open', async () => {
    const {user} = renderButtonGroup()

    const moreOptionsButton = await findMoreOptionsButton()
    expect(moreOptionsButton).toBeInTheDocument()

    // Open create dialog
    await user.keyboard('{Alt>}{Shift>}C{/Shift}{/Alt}')

    // Open picker
    await user.keyboard('{Alt>}{Shift>}A{/Shift}{/Alt}')

    const picker = findIssuePicker()
    expect(picker).not.toBeInTheDocument()
  })

  test('does not accept keyboard shortcut when RepositoryAndIssuePicker is open', async () => {
    const {user} = renderButtonGroup()

    const moreOptionsButton = await findMoreOptionsButton()
    expect(moreOptionsButton).toBeInTheDocument()

    // Open picker
    await user.keyboard('{Alt>}{Shift>}A{/Shift}{/Alt}')

    // Open create dialog
    await user.keyboard('{Alt>}{Shift>}C{/Shift}{/Alt}')

    const picker = findIssuePicker()
    expect(picker).toBeInTheDocument()
  })

  test('can select issue', async () => {
    const {environment, user} = renderButtonGroup()

    const moreOptionsButton = await findMoreOptionsButton()
    expect(moreOptionsButton).toBeInTheDocument()
    await user.click(moreOptionsButton)

    const addExistingButton = await findAddExistingButton()
    expect(addExistingButton).toBeInTheDocument()
    await user.click(addExistingButton)

    const picker = findIssuePicker()
    expect(picker).toBeInTheDocument()

    const issueItem = await getIssueListItem(0)
    expect(issueItem).toBeInTheDocument()

    if (issueItem) {
      await user.click(issueItem)
    }

    const dialog = screen.queryByRole('heading', {name: 'Are you sure?'})
    expect(dialog).not.toBeInTheDocument()

    const operation = environment.mock.getMostRecentOperation()

    expect(operation.fragment.node.name).toEqual('addSubIssueMutation')
    expect(operation.fragment.variables.input).toEqual({
      issueId: 'issue-id',
      subIssueId: 'sub-issue-id',
      replaceParent: true,
    })
  })
})

test('dialog present when selected issue has parent', async () => {
  const {environment, user} = renderButtonGroup({includeParent: true})

  const moreOptionsButton = await findMoreOptionsButton()
  expect(moreOptionsButton).toBeInTheDocument()
  await user.click(moreOptionsButton)

  const addExistingButton = await findAddExistingButton()
  expect(addExistingButton).toBeInTheDocument()
  await user.click(addExistingButton)

  const picker = findIssuePicker()
  expect(picker).toBeInTheDocument()

  const issueItem = await getIssueListItem(0)
  expect(issueItem).toBeInTheDocument()

  if (issueItem) {
    await user.click(issueItem)
  }

  const dialog = await screen.findByRole('heading', {name: 'Are you sure?'})
  expect(dialog).toBeInTheDocument()

  const confirmationButton = await screen.findByRole('button', {name: 'Change parent issue'})
  expect(confirmationButton).toBeInTheDocument()

  if (confirmationButton) {
    await user.click(confirmationButton)
  }

  expect(dialog).not.toBeInTheDocument()

  // Not sure why this is necessary, but some variation of using `fetchQuery` in response to a user-interaction
  // seems to cause headaches when testing with `renderRelay` and multiple queries. This is a workaround to ensure
  // the operation is available for assertion. This _weird_ async problem does not present itself in application code.
  await waitFor(() => {
    return environment.mock.getMostRecentOperation()
  })

  const operation = await waitFor(() => {
    return environment.mock.getMostRecentOperation()
  })

  expect(operation.fragment.node.name).toEqual('addSubIssueMutation')
  expect(operation.fragment.variables.input).toEqual({
    issueId: 'issue-id',
    subIssueId: 'sub-issue-id',
    replaceParent: true,
  })
})

test('dialog present when a parent is over the sub-issue limit', async () => {
  const {user} = renderButtonGroup({childIssueCount: 50})

  const moreOptionsButton = await findMoreOptionsButton()
  expect(moreOptionsButton).toBeInTheDocument()
  await user.click(moreOptionsButton)

  const addExistingButton = await findAddExistingButton()
  expect(addExistingButton).toBeInTheDocument()
  await user.click(addExistingButton)

  const dialog = await findAlertDialog()
  expect(dialog).toBeInTheDocument()

  const heading = await screen.findByText('Sub-issue limit reached')
  expect(heading).toBeInTheDocument()

  const dialogCloseButton = await findDialogCloseButton()
  expect(dialogCloseButton).toBeInTheDocument()
  await user.click(dialogCloseButton)
  expect(dialog).not.toBeInTheDocument()

  const createSubIssueButton = await findCreateSubIssueButton()
  expect(createSubIssueButton).toBeInTheDocument()
  await user.click(createSubIssueButton)

  const dialog2 = await findAlertDialog()
  expect(dialog2).toBeInTheDocument()
})

test('dialog is present when there is a breadth limit', async () => {
  const mockError = 'Parent cannot have more than 50 sub-issues'
  const {environment, user} = renderButtonGroup()

  await addExistingItem(user)

  const confirmation = screen.queryByRole('heading', {name: 'Are you sure?'})
  expect(confirmation).not.toBeInTheDocument()

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
  const {environment, user} = renderButtonGroup()

  await addExistingItem(user)

  const confirmation = screen.queryByRole('heading', {name: 'Are you sure?'})
  expect(confirmation).not.toBeInTheDocument()

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
  const {environment, user} = renderButtonGroup()

  await addExistingItem(user)

  const confirmation = screen.queryByRole('heading', {name: 'Are you sure?'})
  expect(confirmation).not.toBeInTheDocument()

  await act(async () => {
    environment.mock.rejectMostRecentOperation(() => new Error(mockError))
  })

  const alert = await findAlertDialog()
  expect(alert).toBeInTheDocument()

  const heading = await screen.findByText('Sub-issue circular dependency')
  expect(heading).toBeInTheDocument()
})
