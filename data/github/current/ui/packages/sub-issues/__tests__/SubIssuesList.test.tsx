import {renderRelay} from '@github-ui/relay-test-utils'
import {ThemeProvider} from '@primer/react'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {Suspense} from 'react'
import {graphql} from 'react-relay'
import {MockPayloadGenerator} from 'relay-test-utils'
import {SubIssueStateProvider} from '../components/SubIssueStateContext'
import {SubIssuesList} from '../components/SubIssuesList'
import type {SubIssuesListTestQuery} from './__generated__/SubIssuesListTestQuery.graphql'
import type {SubIssueSidePanelItem} from '../types/sub-issue-types'
import {FEEDBACK_URLS} from '../constants/values'

jest.setTimeout(4_500)

const subIssuesListTestQuery = graphql`
  query SubIssuesListTestQuery @relay_test_operation {
    node(id: "I_123") {
      ... on Issue {
        ...SubIssuesList
      }
    }
    viewer {
      ...SubIssuesListViewViewer
    }
  }
`

const setup = ({
  onSubIssueClick,
  readonly,
  isEmployee = true,
}: {
  onSubIssueClick?: (subIssueItem: SubIssueSidePanelItem) => void
  readonly?: boolean
  isEmployee?: boolean
} = {}) => {
  let count = 0

  const {relayMockEnvironment, user} = renderRelay<{
    subIssuesListTestQuery: SubIssuesListTestQuery
  }>(
    ({queryData}) => (
      <ThemeProvider>
        <Suspense fallback="Loading...">
          <SubIssueStateProvider>
            <SubIssuesList
              issueKey={queryData.subIssuesListTestQuery.node ?? undefined}
              viewerKey={queryData.subIssuesListTestQuery.viewer}
              onSubIssueClick={onSubIssueClick}
              readonly={readonly}
            />
          </SubIssueStateProvider>
        </Suspense>
      </ThemeProvider>
    ),
    {
      relay: {
        queries: {
          subIssuesListTestQuery: {
            type: 'fragment',
            query: subIssuesListTestQuery,
            variables: {},
          },
        },
        mockResolvers: {
          User({path}) {
            if (path?.includes('viewer')) {
              return {
                isEmployee,
              }
            }
          },
          Issue({path}) {
            if (path?.includes('subIssues')) {
              const currentCount = count++
              const isCompleted = currentCount % 2 === 0
              return {
                id: `sub-issue-${currentCount}`,
                titleHTML: `Child ${currentCount}`,
                state: isCompleted ? 'CLOSED' : 'OPEN',
                number: currentCount + 1,
                repository: {
                  name: 'github',
                  owner: {
                    login: 'github',
                  },
                },
                stateReason: isCompleted ? 'COMPLETED' : undefined,
                isReadByViewer: true,
                issueType: {
                  id: '456',
                  name: 'Task',
                  isEnabled: true,
                },
                subIssues: {
                  nodes: [
                    {
                      titleHTML: `Child ${count}.1`,
                      state: 'OPEN',
                    },
                    {
                      titleHTML: `Child ${count}.2`,
                      state: 'CLOSED',
                    },
                  ],
                },
                subIssuesConnection: {
                  totalCount: 2,
                },
                viewerCanSeeIssueType: true,
                assignees: {
                  totalCount: 1,
                  edges: [{node: {login: 'monalisa'}}],
                },
                subIssuesSummary: {
                  total: 2,
                  completed: isCompleted ? 2 : 1,
                  percentCompleted: isCompleted ? 100 : 50,
                },
                closedByPullRequestsReferences: 0,
                url: '#boo',
              }
            }
            return {
              id: 'parent-issue-1',
              subIssues: {
                nodes: [{}, {}, {}, {}],
              },
              subIssuesConnection: {
                totalCount: 4,
              },
              subIssuesSummary: {
                total: 4,
                completed: 2,
                percentCompleted: 50,
              },
            }
          },
        },
      },
    },
  )

  return {environment: relayMockEnvironment, user}
}

describe('SubIssuesList', () => {
  test('can render the SubIssuesList', async () => {
    setup()

    expect(await screen.findByRole('heading', {name: 'Sub-issues', level: 2})).toBeInTheDocument()
    expect(await screen.findByRole('tree', {name: 'Sub-issues'})).toBeInTheDocument()
    expect(screen.getAllByTestId('listitem-title-link')[1]).toHaveTextContent('Child 1')

    // Metadata should be visible
    expect(screen.getAllByAltText('monalisa')[1]).toBeInTheDocument()
    // Action elements should be visible
    expect(await screen.findByRole('button', {name: 'Create sub-issue'})).toBeInTheDocument()
  })

  test('can copy sub-issue link', async () => {
    const {user} = setup()

    const child = screen.getAllByTestId('listitem-title-link')[1]
    expect(child).toBeInTheDocument()

    const menu = screen.getAllByLabelText('More list item action bar')[1]
    expect(menu).toBeInTheDocument()
    if (!menu) return
    await user.click(menu)

    const copyLinkButton = await screen.findByLabelText('Copy link')
    expect(copyLinkButton).toBeInTheDocument()

    // Copy behavior tested within the ActionListItemCopyToClipboard component
  })

  test('remove sub-issue from parent issue', async () => {
    const {environment, user} = setup()

    // For very strange, inexplicable reasons, the below actions lead to a console warn of
    // "Element requested is not a known focusable element."
    // This appears to be deeply buried in some primer behavior https://github.com/primer/behaviors/blob/80ec75615e018098808c7cbaf38cc052af23de58/src/focus-zone.ts#L647
    // and no amount of changes have remedied this warning. The buttons are still clickable, as we can see the tests
    // pass, so I'm placing this here as I haven't found a solution for it in any way.
    jest.spyOn(console, 'warn').mockImplementation()

    const child = screen.getAllByTestId('listitem-title-link')[1]
    expect(child).toBeInTheDocument()

    const menu = screen.getAllByLabelText('More list item action bar')[1]
    expect(menu).toBeInTheDocument()
    if (!menu) return
    await user.click(menu)

    const removeSubIssueButton = await screen.findByLabelText('Remove sub-issue')
    expect(removeSubIssueButton).toBeInTheDocument()
    await user.click(removeSubIssueButton)

    await act(async () => {
      environment.mock.resolveMostRecentOperation(op => {
        expect(op.fragment.node.name).toEqual('removeSubIssueMutation')
        expect(op.fragment.variables.input).toEqual({issueId: 'parent-issue-1', subIssueId: 'sub-issue-1'})
        return MockPayloadGenerator.generate(op, {
          Issue({path}) {
            if (path?.includes('subIssue')) {
              return {
                id: 'sub-issue-id',
              }
            } else {
              return {
                id: 'parent-issue-1',
                subIssues: {
                  nodes: [],
                  totalCount: 4,
                },
                subIssuesSummary: {
                  total: 4,
                  completed: 2,
                  percentCompleted: 50,
                },
              }
            }
          },
        })
      })
    })

    expect(child).not.toBeInTheDocument()
  })

  test('displays drag handles on for top-level sub-issue', async () => {
    setup()

    // For very strange, inexplicable reasons, the below actions lead to a console warn of
    // "Element requested is not a known focusable element."
    // This appears to be deeply buried in some primer behavior https://github.com/primer/behaviors/blob/80ec75615e018098808c7cbaf38cc052af23de58/src/focus-zone.ts#L647
    // and no amount of changes have remedied this warning. The buttons are still clickable, as we can see the tests
    // pass, so I'm placing this here as I haven't found a solution for it in any way.
    jest.spyOn(console, 'warn').mockImplementation()

    const child = screen.getAllByTestId('listitem-title-link')[1]
    expect(child).toBeInTheDocument()

    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    // "First level issue 1"'s expand button
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    const dragHandles = screen.getAllByTestId('sortable-trigger-container')
    expect(dragHandles).toHaveLength(4)
  })

  test('hides all editing actions in readonly mode', async () => {
    setup({readonly: true})

    const child = screen.getAllByTestId('listitem-title-link')[1]
    expect(child).toBeInTheDocument()

    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    // "First level issue 1"'s expand button
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    // No drag handles
    const dragHandles = screen.queryAllByTestId('sortable-trigger-container')
    expect(dragHandles).toHaveLength(0)

    // No action menus
    const menus = screen.queryAllByLabelText('More list item action bar')
    expect(menus).toHaveLength(0)

    // No "Create sub-issue" button
    const createSubIssueButton = screen.queryByRole('button', {name: 'Create sub-issue'})
    expect(createSubIssueButton).not.toBeInTheDocument()
  })

  describe('SubIssuesMetadata', () => {
    test('renders issue type tokens with links', async () => {
      setup()

      expect(screen.getByTestId('1-sub-issue-type-indicator-Task')).toBeInTheDocument()
      expect(screen.getAllByTestId('nested-list-view-item-leading-badge')[1]).toHaveAttribute(
        'href',
        '/github/github/issues?q=type%3ATask',
      )
    })
  })

  describe('SubIssues Completion Pills', () => {
    test('renders completion tokens when sub-issue are present', async () => {
      renderRelay<{
        subIssuesListTestQuery: SubIssuesListTestQuery
      }>(
        ({queryData}) => (
          <Suspense fallback="Loading...">
            <SubIssueStateProvider>
              <SubIssuesList
                issueKey={queryData.subIssuesListTestQuery.node ?? undefined}
                viewerKey={queryData.subIssuesListTestQuery.viewer}
              />
            </SubIssueStateProvider>
          </Suspense>
        ),
        {
          relay: {
            queries: {
              subIssuesListTestQuery: {
                type: 'fragment',
                query: subIssuesListTestQuery,
                variables: {},
              },
            },
            mockResolvers: {
              Issue({path}) {
                if (path?.includes('subIssues')) {
                  return {
                    titleHTML: 'Child 1',
                    subIssuesSummary: {
                      total: 4,
                      completed: 2,
                      percentCompleted: 50,
                    },
                    subIssuesConnection: {
                      totalCount: 4,
                    },
                    state: 'CLOSED',
                    stateReason: 'COMPLETED',
                    isReadByViewer: true,
                    closedByPullRequestsReferences: 2,
                    url: 'https://github.com/github/github/issues/1',
                  }
                } else {
                  return {
                    titleHTML: 'Parent 1',
                    subIssuesSummary: {
                      total: 1,
                      completed: 0,
                      percentCompleted: 0,
                    },
                    subIssuesConnection: {
                      totalCount: 1,
                    },
                    state: 'CLOSED',
                    stateReason: 'COMPLETED',
                    isReadByViewer: true,
                    closedByPullRequestsReferences: 2,
                    url: 'https://github.com/github/github/issues/2',
                  }
                }
              },
            },
          },
        },
      )

      const parentCompletionPill = screen.getAllByTestId('nested-list-view-completion-pill')[0] as HTMLElement
      const subIssueCompletionPill = screen.getAllByTestId('nested-list-view-completion-pill')[1] as HTMLElement

      expect(await within(parentCompletionPill).findByText('0 of 1')).toBeInTheDocument()
      expect(parentCompletionPill.tagName).toBe('SPAN')

      expect(subIssueCompletionPill).toBeInTheDocument()
      expect(await within(subIssueCompletionPill).findByText('2 of 4')).toBeInTheDocument()
      expect(subIssueCompletionPill.tagName).toBe('A')
      expect(subIssueCompletionPill).toHaveAttribute('href', 'https://github.com/github/github/issues/1')
    })
  })

  test('opens the side-panel when the issue title is clicked', async () => {
    const onSubIssueClick = jest.fn()
    setup({onSubIssueClick})

    expect(await screen.findByRole('heading', {name: 'Sub-issues', level: 2})).toBeInTheDocument()

    const childLink = screen.getAllByTestId('listitem-title-link')[1]
    expect(childLink).toBeInTheDocument()

    if (!childLink) return
    fireEvent.click(childLink)

    const summaryToken = screen.getAllByTestId('nested-list-view-item-trailing-badge')[1]
    expect(summaryToken).toHaveTextContent('1 of 2')
    fireEvent.click(childLink)

    expect(onSubIssueClick).toHaveBeenCalledTimes(2)

    // Will trigger "Not implemented: navigation (except hash changes)" error if issue URL is not a URL fragment identifier
    // https://github.com/jsdom/jsdom/blob/2f8a7302a43fff92f244d5f3426367a8eb2b8896/lib/jsdom/living/window/navigation.js#L33-L35
    fireEvent.click(childLink, {button: 1})
    fireEvent.click(childLink, {shiftKey: true})
    fireEvent.click(childLink, {ctrlKey: true})
    fireEvent.click(childLink, {metaKey: true})

    expect(onSubIssueClick).toHaveBeenCalledTimes(2)
  })

  test('opens the side-panel when the nested sub issue title is clicked', async () => {
    const onSubIssueClick = jest.fn()
    const {environment, user} = setup({onSubIssueClick})

    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    // "First level issue 1"'s expand button
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(firstItem.querySelector('.PRIVATE_TreeView-item-toggle svg')!)

    await act(async () => {
      environment.mock.resolveMostRecentOperation(op => {
        expect(op.fragment.node.name).toEqual('SubIssuesListItem_NestedSubIssuesQuery')
        return MockPayloadGenerator.generate(op, {
          Issue({path}) {
            if (path?.includes('subIssues')) {
              return {
                id: 'sub-sub-issue-',
                titleHTML: 'Second level issue 1',
                state: 'OPEN',
                stateReason: 'OPEN',
                issueType: {
                  id: '111',
                  name: 'Enhancement',
                  isEnabled: true,
                },
                number: 1,
              }
            }
            return {
              id: 'sub-issue-0',
              titleHTML: 'Child 0',
              state: 'CLOSED',
              stateReason: 'COMPLETED',
              subIssues: {
                nodes: [{id: 'sub-sub-issue-0', titleHTML: 'Second level issue 1'}],
              },
              subIssuesConnection: {
                totalCount: 1,
              },
            }
          },
        })
      })
    })

    const firstItemsSubItem = screen.getByRole('treeitem', {
      name: 'Enhancement: Second level issue 1 #1: Status: Open. Press Control, Shift, U for more actions.',
    })
    const childLink = within(firstItemsSubItem).getByTestId('listitem-title-link')

    expect(onSubIssueClick).toHaveBeenCalledTimes(0)
    await user.click(childLink)
    expect(onSubIssueClick).toHaveBeenCalledTimes(1)
  })

  test('should expand and collapse sub-issues header', async () => {
    const {user} = setup()

    const expandButton = screen.getByRole('button', {name: 'List is expanded'})
    await user.click(expandButton)
    expect(expandButton).toHaveAccessibleName('List is collapsed')
  })

  describe('Feedback link', () => {
    test('shows employee feedback link for employee', () => {
      setup()
      const feedbackLink = screen.getByRole('link', {name: 'Give feedback'})
      expect(feedbackLink).toBeInTheDocument()
      expect(feedbackLink).toHaveAttribute('href', FEEDBACK_URLS.employeeUrl)
    })

    test('shows public feedback link for non-employee', () => {
      setup({isEmployee: false})
      const feedbackLink = screen.getByRole('link', {name: 'Give feedback'})
      expect(feedbackLink).toBeInTheDocument()
      expect(feedbackLink).toHaveAttribute('href', FEEDBACK_URLS.publicUrl)
    })
  })
})
