import {NestedListView} from '@github-ui/nested-list-view'
import {renderRelay} from '@github-ui/relay-test-utils'
import {ThemeProvider} from '@primer/react'
import {act, fireEvent, screen} from '@testing-library/react'
import {Suspense} from 'react'
import {graphql} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'

import {SubIssuesListItem} from '../components/SubIssuesListItem'
import type {SubIssuesListItemTestQuery} from './__generated__/SubIssuesListItemTestQuery.graphql'
import type {SubIssueSidePanelItem} from '../types/sub-issue-types'

describe('SubIssuesListItem', () => {
  jest.useFakeTimers()
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // eslint-disable-next-line no-console
    originalConsoleError = console.error
    // eslint-disable-next-line no-console
    console.error = jest.fn()
  })

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError
    jest.restoreAllMocks()
  })

  test('renders nested sub-issues when the user clicks on the expand/collapse icon', async () => {
    const {environment, container} = setup()

    // eslint-disable-next-line testing-library/no-node-access
    const expandIcon = container.querySelector('.PRIVATE_TreeView-item-toggle svg')
    fireEvent.click(expandIcon!)

    // should show the loading skeleton first
    await act(async () => {
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.PRIVATE_TreeView-item-skeleton')).toBeInTheDocument()
    })

    await mockNestedSubIssues({environment})

    await act(async () => {
      expect(screen.getByText('Second level issue 1')).toBeInTheDocument()
    })
  })

  test('should not refetch sub-issue when user toggles expand/collapse icon', async () => {
    const {environment} = setup()

    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    // "First level issue 1"'s expand button
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    await mockNestedSubIssues({environment})

    await act(async () => {
      expect(screen.getByText('Second level issue 1')).toBeInTheDocument()
    })

    // Re-query expand icon because DOM icon is rerendered
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    expect(environment.mock.getAllOperations()).toHaveLength(3)

    await act(async () => {
      expect(treeItems[0]).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Second level issue 1')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    // re-toggling of loadItems should not make another relay query
    expect(environment.mock.getAllOperations()).toHaveLength(3)
  })

  test('handles Relay error', async () => {
    const mockError = 'An intentional error'
    const {environment, container} = setup()

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(container.querySelector('.PRIVATE_TreeView-item-toggle svg')!) // "First level issue 1"'s expand button

    // manually resolve for refetchable fragment query
    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => new Error(mockError))
    })

    expect(screen.getByText(mockError)).toBeInTheDocument()
  })

  test('hides drag handle and action menu in readonly mode', async () => {
    const {environment, container} = setup({readonly: true})

    // eslint-disable-next-line testing-library/no-node-access
    const expandIcon = container.querySelector('.PRIVATE_TreeView-item-toggle svg')
    fireEvent.click(expandIcon!)

    // should show the loading skeleton first
    await act(async () => {
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.PRIVATE_TreeView-item-skeleton')).toBeInTheDocument()
    })

    await mockNestedSubIssues({environment})

    await act(async () => {
      expect(screen.getByText('Second level issue 1')).toBeInTheDocument()
    })

    // No drag handles
    const dragHandles = screen.queryAllByTestId('sortable-trigger-container')
    expect(dragHandles).toHaveLength(0)

    // No action menus
    const menus = screen.queryAllByLabelText('More list item action bar')
    expect(menus).toHaveLength(0)
  })
})

const setup = ({
  onSubIssueClick,
  readonly,
}: {
  onSubIssueClick?: (subIssueItem: SubIssueSidePanelItem) => void
  readonly?: boolean
} = {}) => {
  const {relayMockEnvironment, container} = renderRelay<{
    subIssuesListItemTestQuery: SubIssuesListItemTestQuery
  }>(
    ({queryData}) => {
      const issueKey = queryData.subIssuesListItemTestQuery?.node?.subIssues?.nodes?.[0]
      return (
        <ThemeProvider>
          <Suspense fallback="Loading...">
            {issueKey && (
              <NestedListView title="test nested list-view" isReadOnly={readonly}>
                <SubIssuesListItem
                  parentIssueId="parent-issue-1"
                  issueKey={issueKey}
                  onSubIssueClick={onSubIssueClick}
                  readonly={readonly}
                />
              </NestedListView>
            )}
          </Suspense>
        </ThemeProvider>
      )
    },
    {
      relay: {
        queries: {
          subIssuesListItemTestQuery: {
            type: 'fragment',
            query: graphql`
              query SubIssuesListItemTestQuery @relay_test_operation {
                node(id: "I_abc123") {
                  ... on Issue {
                    subIssues {
                      nodes {
                        ...SubIssuesListItem
                      }
                    }
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Issue({path}) {
            if (path?.includes('subIssues')) {
              return {
                id: 'sub-issue-2',
                titleHTML: 'First level issue 1',
                number: 1,
                repository: {
                  name: 'github',
                  owner: {
                    login: 'github',
                  },
                },
                state: 'CLOSED',
                stateReason: 'COMPLETED',
                isReadByViewer: true,
                issueType: {
                  id: '456',
                  name: 'Task',
                  isEnabled: true,
                },
                viewerCanSeeIssueType: true,
                assignees: {
                  totalCount: 1,
                  edges: [{node: {login: 'monalisa'}}],
                },
                subIssuesSummary: {
                  total: 3,
                  completed: 1,
                  percentCompleted: 33,
                },
                closedByPullRequestsReferences: 0,
                url: 'https://github.com/github/github/issues/1',
              }
            }
            return {
              id: 'issue-show-1',
              subIssuesSummary: {
                total: 4,
                completed: 2,
                percentCompleted: 50,
              },
              subIssues: {
                nodes: [{id: 'sub-issues-2', titleHTML: 'First level issue 1'}],
              },
            }
          },
        },
      },
    },
  )

  return {environment: relayMockEnvironment, container}
}

// Manually resolve for refetchable fragment query
const mockNestedSubIssues = async ({environment}: {environment: RelayMockEnvironment}) => {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(op => {
      expect(op.fragment.node.name).toEqual('SubIssuesListItem_NestedSubIssuesQuery')
      return MockPayloadGenerator.generate(op, {
        Issue({path}) {
          if (path?.includes('subIssues')) {
            return {
              id: 'sub-sub-issue-1',
              titleHTML: 'Second level issue 1',
              state: 'OPEN',
              stateReason: 'OPEN',
            }
          }
          return {
            id: 'sub-issue-2',
            titleHTML: 'First level issue 1',
            state: 'CLOSED',
            stateReason: 'COMPLETED',
            subIssues: {
              nodes: [{id: 'sub-sub-issue-1', titleHTML: 'Second level issue 1'}],
            },
          }
        },
      })
    })
  })
}
