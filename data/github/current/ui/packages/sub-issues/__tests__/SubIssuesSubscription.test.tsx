import {act, screen, within} from '@testing-library/react'
import {graphql, requestSubscription} from 'relay-runtime'

import {MockPayloadGenerator} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {SubIssueStateProvider} from '../components/SubIssueStateContext'
import {SubIssuesList} from '../components/SubIssuesList'
import type {SubIssuesSubscriptionTestQuery} from './__generated__/SubIssuesSubscriptionTestQuery.graphql'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {noop} from '@github-ui/noop'
import {renderRelay} from '@github-ui/relay-test-utils'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

jest.mock('@github-ui/react-core/use-feature-flag')
const mockUseFeatureFlag = jest.mocked(useFeatureFlag)

const mockIssueViewerSubscription = (environment: RelayMockEnvironment) => {
  requestSubscription(environment, {
    subscription: graphql`
      subscription SubIssuesSubscription_IssueViewerSubscription($issueId: ID!) @relay_test_operation {
        issueUpdated(id: $issueId) {
          subIssuesUpdated {
            ...SubIssuesList
          }
        }
      }
    `,
    onNext: noop,
    onError: noop,
    variables: {issueId: 'parent-issue-1'},
  })

  return environment.mock.getMostRecentOperation()
}

const mockSubIssueSubscription = (environment: RelayMockEnvironment) => {
  requestSubscription(environment, {
    subscription: graphql`
      subscription SubIssuesSubscription_TestSubscription($issueId: ID!) @relay_test_operation {
        issueUpdated(id: $issueId) {
          issueTitleUpdated {
            ...SubIssuesListItem
          }
          issueStateUpdated {
            ...SubIssuesListItem
          }
          issueMetadataUpdated {
            ...SubIssuesListItem
          }
          subIssuesUpdated {
            ...SubIssuesListItem
            # ...SubIssuesListItem_NestedSubIssues @arguments(fetchSubIssues: $fetchSubIssues)
          }
        }
      }
    `,
    onNext: noop,
    onError: noop,
    variables: {fetchSubIssues: false, issueId: 'sub-issue-0'},
  })

  return environment.mock.getMostRecentOperation()
}

const setup = (issue: unknown, subIssues: unknown[]) => {
  const {relayMockEnvironment} = renderRelay<{
    subIssuesListTestQuery: SubIssuesSubscriptionTestQuery
  }>(
    ({queryData}) => (
      <SubIssueStateProvider>
        <SubIssuesList
          issueKey={queryData.subIssuesListTestQuery.node ?? undefined}
          viewerKey={queryData.subIssuesListTestQuery.viewer}
        />
      </SubIssueStateProvider>
    ),
    {
      relay: {
        queries: {
          subIssuesListTestQuery: {
            type: 'fragment',
            query: graphql`
              query SubIssuesSubscriptionTestQuery @relay_test_operation {
                node(id: "parent-issue-1") {
                  ... on Issue {
                    ...SubIssuesList
                  }
                }
                viewer {
                  ...SubIssuesListViewViewer
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          IssueConnection: context => {
            if (context.path?.includes('subIssues')) return {nodes: subIssues}
          },
          Issue: context => {
            if (!context.path?.includes('subIssues')) return issue
          },
        },
      },
    },
  )

  return {environment: relayMockEnvironment}
}

const generateMockParentIssue = (subIssuesCount = 1) => {
  const completed = Math.floor(subIssuesCount / 2)
  const nodes = []
  for (let i = 0; i < subIssuesCount; i++) {
    nodes.push({id: `sub-issue-${i}`})
  }
  return {
    id: 'parent-issue-1',
    subIssues: {
      nodes,
    },
    subIssuesSummary: {
      total: subIssuesCount,
      completed,
      percentCompleted: Math.floor((completed / subIssuesCount) * 100),
    },
  }
}

const generateMockSubIssue = (index = 0, isCompleted = true) => {
  return {
    id: `sub-issue-${index}`,
    titleHTML: `Child ${index}`,
    state: isCompleted ? 'CLOSED' : 'OPEN',
    number: index + 1,
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
          titleHTML: `Child ${index}.1`,
          state: 'OPEN',
        },
        {
          titleHTML: `Child ${index}.2`,
          state: 'CLOSED',
        },
      ],
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

describe('SubIssuesSubscription', () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(true)
    mockClientEnv({
      featureFlags: ['sub_issues'],
    })
  })

  test('live updates when sub-issue is added', async () => {
    const mockSubIssue1 = generateMockSubIssue(0)
    const mockSubIssue2 = generateMockSubIssue(1, false)
    const mockParentIssue = generateMockParentIssue(1)
    const {environment} = setup(mockParentIssue, [mockSubIssue1])
    const subscriptionOperation = mockIssueViewerSubscription(environment)

    expect(screen.getAllByRole('treeitem').length).toBe(1)

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          IssueConnection: context => {
            if (context.path?.includes('subIssues')) return {nodes: [mockSubIssue1, mockSubIssue2]}
          },
          Issue: context => {
            if (!context.path?.includes('subIssues')) return generateMockParentIssue(2)
          },
        }),
      )
    })

    expect(screen.getAllByRole('treeitem').length).toBe(2)
  })

  test('live updates when sub-issue is removed', async () => {
    const mockSubIssue1 = generateMockSubIssue(0)
    const mockSubIssue2 = generateMockSubIssue(1, false)
    const mockParentIssue = generateMockParentIssue(2)
    const {environment} = setup(mockParentIssue, [mockSubIssue1, mockSubIssue2])
    const subscriptionOperation = mockIssueViewerSubscription(environment)

    expect(screen.getAllByRole('treeitem').length).toBe(2)

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          IssueConnection: context => {
            if (context.path?.includes('subIssues')) return {nodes: [mockSubIssue1]}
          },
          Issue: context => {
            if (!context.path?.includes('subIssues')) return generateMockParentIssue(1)
          },
        }),
      )
    })

    expect(screen.getAllByRole('treeitem').length).toBe(1)
  })

  test('live updates when sub-issue is reordered', async () => {
    const mockSubIssue1 = generateMockSubIssue(0)
    const mockSubIssue2 = generateMockSubIssue(1, false)
    const mockParentIssue = generateMockParentIssue(2)
    const {environment} = setup(mockParentIssue, [mockSubIssue1, mockSubIssue2])
    const subscriptionOperation = mockIssueViewerSubscription(environment)

    let treeItems = screen.getAllByRole('treeitem')
    let firstItem = treeItems[0]!
    let title = within(firstItem).getByTestId('listitem-title-link')
    expect(title).toHaveTextContent(mockSubIssue1.titleHTML)
    expect(screen.getAllByRole('treeitem').length).toBe(2)

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          IssueConnection: context => {
            if (context.path?.includes('subIssues')) return {nodes: [mockSubIssue2, mockSubIssue1]}
          },
          Issue: context => {
            if (!context.path?.includes('subIssues')) return generateMockParentIssue(1)
          },
        }),
      )
    })

    treeItems = screen.getAllByRole('treeitem')
    firstItem = treeItems[0]!
    title = within(firstItem).getByTestId('listitem-title-link')
    expect(title).toHaveTextContent(mockSubIssue2.titleHTML)
    expect(screen.getAllByRole('treeitem').length).toBe(2)
  })

  test('live updates when sub-issue title is changed', async () => {
    const mockSubIssue = generateMockSubIssue()
    const mockParentIssue = generateMockParentIssue()
    const {environment} = setup(mockParentIssue, [mockSubIssue])
    const subscriptionOperation = mockSubIssueSubscription(environment)

    // Expect title to not be updated
    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    const title = within(firstItem).getByTestId('listitem-title-link')
    expect(title).toHaveTextContent(mockSubIssue.titleHTML)

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          Issue: context => {
            if (context.name === 'issueTitleUpdated') {
              return {
                ...mockSubIssue,
                titleHTML: 'hello there',
              }
            }
          },
        }),
      )
    })

    // Expect title to be updated
    expect(title).toHaveTextContent('hello there')
  })

  test('live updates when sub-issue state is changed', async () => {
    const mockSubIssue = generateMockSubIssue()
    const mockParentIssue = generateMockParentIssue()
    const {environment} = setup(mockParentIssue, [mockSubIssue])
    const subscriptionOperation = mockSubIssueSubscription(environment)

    // Expect status to not be updated
    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    const icon = within(firstItem).getByTestId('leading-visual-text-description')
    expect(icon).toHaveTextContent(/Closed/)

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          Issue: context => {
            if (context.name === 'issueStateUpdated') {
              return {
                ...mockSubIssue,
                state: 'OPEN',
                stateReason: 'REOPENED',
              }
            }
          },
        }),
      )
    })

    // Expect status to be updated
    expect(icon).toHaveTextContent(/Open/)
  })

  test('live updates when sub-issue metadata is changed', async () => {
    const mockSubIssue = generateMockSubIssue()
    const mockParentIssue = generateMockParentIssue()
    const {environment} = setup(mockParentIssue, [mockSubIssue])
    const subscriptionOperation = mockSubIssueSubscription(environment)

    // Expect status to not be updated
    const treeItems = screen.getAllByRole('treeitem')
    const firstItem = treeItems[0]!
    const metadata = within(firstItem).getByTestId('nested-list-view-item-metadata')
    const avatar = await within(metadata).findByAltText('monalisa')
    expect(avatar).toBeInTheDocument()

    // Trigger subscription update
    act(() => {
      environment.mock.nextValue(
        subscriptionOperation,
        MockPayloadGenerator.generate(subscriptionOperation, {
          Issue: context => {
            if (context.name === 'issueMetadataUpdated') {
              return {
                ...mockSubIssue,
                assignees: {
                  totalCount: 0,
                  edges: [],
                },
              }
            }
          },
        }),
      )
    })

    // Expect status to be updated
    expect(avatar).not.toBeInTheDocument()
  })
})
