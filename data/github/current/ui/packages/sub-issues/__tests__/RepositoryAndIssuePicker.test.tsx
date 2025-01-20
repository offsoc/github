import {act, screen, waitFor} from '@testing-library/react'
import {RepositoryAndIssuePicker, type RepositoryAndIssuePickerProps} from '../components/RepositoryAndIssuePicker'
import {IssuePickerSearchGraphQLQuery} from '@github-ui/item-picker/IssuePicker'
import PRELOAD_CURRENT_REPOSITORY_QUERY from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {renderRelay} from '@github-ui/relay-test-utils'
import {ThemeProvider} from '@primer/react'
import {Suspense} from 'react'
import {buildIssue, buildRepository} from '../test-utils/helpers'

const clickAnchorElement = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('repo-picker-test-button')).toBeInTheDocument()
  })
  act(() => {
    screen.getByTestId('repo-picker-test-button').click()
  })
}

function setup({
  hiddenIssueIds = [],
  onIssueSelection = jest.fn,
  pickerType = null,
  onPickerTypeChange = undefined,
}: Partial<RepositoryAndIssuePickerProps>) {
  const {relayMockEnvironment, user} = renderRelay(
    () => {
      return (
        <ThemeProvider>
          <Suspense fallback="Loading...">
            <RepositoryAndIssuePicker
              hiddenIssueIds={hiddenIssueIds}
              onIssueSelection={onIssueSelection}
              defaultRepositoryNameWithOwner="orgA/repoA"
              organization="orgA"
              anchorElement={(anchorProps: React.HTMLAttributes<HTMLElement>) => (
                <button {...anchorProps} data-testid="repo-picker-test-button">
                  Open RepositoryAndIssuePicker
                </button>
              )}
              onPickerTypeChange={onPickerTypeChange}
              pickerType={pickerType}
            />
          </Suspense>
        </ThemeProvider>
      )
    },
    {
      relay: {
        queries: {
          topRepositories: {
            type: 'preloaded',
            query: TopRepositories,
            variables: {topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: null},
          },
          issuePickerSearchGraphQLQuery: {
            type: 'preloaded',
            query: IssuePickerSearchGraphQLQuery,
            variables: {},
          },
          repositoryPickerCurrentRepoQuery: {
            type: 'preloaded',
            query: CurrentRepository,
            variables: {owner: 'orgA', name: 'repoA'},
          },
          preloadCurrentRepositoryQuery: {
            type: 'preloaded',
            query: PRELOAD_CURRENT_REPOSITORY_QUERY,
            variables: {owner: 'orgA', name: 'repoA', includeTemplates: false},
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
                nodes: [{...buildIssue({title: 'issueA', databaseId: 1}), id: 'I_testId'}],
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
        },
      },
    },
  )
  return {environment: relayMockEnvironment, user}
}

test('render issues without interaction with an initial picker type of issue', async () => {
  setup({pickerType: 'Issue'})

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('issueA')
  expect(await screen.findByRole('button', {name: 'Back to repository selection'})).toBeInTheDocument()
  expect(await screen.findByRole('heading', {name: 'orgA/repoA'})).toBeInTheDocument()
})

test('render repositories without interaction with an initial picker type of repository', async () => {
  setup({pickerType: 'Repository'})

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('orgA')
})

// I tried writing this test, but currently `renderRelay` doesn't appear to return a `rerender` function we can easily
// use to re-render the provided tree with all of the queries and relay environment attached
test.skip('allows user to control picker type with prop', async () => {
  setup({pickerType: 'Repository'})

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  // here, we would rerender with a new pickerType

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })
})

test('render issues', async () => {
  const {environment} = setup({})

  expect(environment.mock.getAllOperations).toHaveLength(0)

  await clickAnchorElement()

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('issueA')
  expect(await screen.findByRole('button', {name: 'Back to repository selection'})).toBeInTheDocument()
  expect(await screen.findByRole('heading', {name: 'orgA/repoA'})).toBeInTheDocument()
})

test('filters out currently displayed issue from results', async () => {
  const {environment} = setup({hiddenIssueIds: ['I_testId']})

  expect(environment.mock.getAllOperations).toHaveLength(0)

  await clickAnchorElement()

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('mentions')
})

test('triggers onIssueSelection when an issue is clicked', async () => {
  const onIssueSelection = jest.fn()
  const {user} = setup({onIssueSelection})

  await clickAnchorElement()

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveTextContent('issueA')

  await user.click(options[0] as HTMLElement)

  expect(onIssueSelection).toHaveBeenCalled()
})

test('loads RepositoryPicker when back is clicked', async () => {
  const onPickerTypeChange = jest.fn()
  const {user} = setup({onPickerTypeChange})

  await clickAnchorElement()

  const backButton = await screen.findByRole('button', {name: 'Back to repository selection'})
  expect(backButton).toBeInTheDocument()

  await user.click(backButton)

  const repositoryHeading = await screen.findByRole('heading', {name: 'Select a repository'})
  expect(repositoryHeading).toBeInTheDocument()
  expect(onPickerTypeChange).toHaveBeenCalledWith('Repository')

  expect(await screen.findAllByRole('option')).toHaveLength(2)
})

test('loads IssuePicker when repo is clicked', async () => {
  const onPickerTypeChange = jest.fn()
  const {user} = setup({onPickerTypeChange})

  await clickAnchorElement()

  const backButton = await screen.findByRole('button', {name: 'Back to repository selection'})
  expect(backButton).toBeInTheDocument()

  await user.click(backButton)

  expect(await screen.findByRole('heading', {name: 'Select a repository'})).toBeInTheDocument()

  const repoOptions = await screen.findAllByRole('option')
  expect(repoOptions).toHaveLength(2)

  await user.click(repoOptions[0] as HTMLElement)

  const issueOptions = await screen.findAllByRole('option')
  expect(onPickerTypeChange).toHaveBeenCalledWith('Issue')
  expect(issueOptions[0]).toHaveTextContent('issueA')
  expect(await screen.findByRole('button', {name: 'Back to repository selection'})).toBeInTheDocument()
  expect(await screen.findByRole('heading', {name: 'orgA/repoA'})).toBeInTheDocument()
})
