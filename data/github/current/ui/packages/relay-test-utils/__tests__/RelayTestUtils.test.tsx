import {act, screen} from '@testing-library/react'
import {MockPayloadGenerator} from 'relay-test-utils'
import {IssuesShowPage} from '../mocks/IssuesShow'
import {IssuesShowFragment} from '../mocks/IssuesShowFragment'
import ISSUES_SHOW_QUERY, {type IssuesShowQuery} from '../mocks/__generated__/IssuesShowQuery.graphql'
import VIEWER_QUERY, {type ViewerQuery} from '../mocks/__generated__/ViewerQuery.graphql'
import type {RelayTestUtilsViewerQuery} from './__generated__/RelayTestUtilsViewerQuery.graphql'
import type {LazyLoadRepoDescriptionQuery} from '../mocks/__generated__/LazyLoadRepoDescriptionQuery.graphql'

import {createRelayMockEnvironment} from '../RelayMockEnvironment'
import {renderRelay} from '../RelayTestUtils'
import {graphql} from 'relay-runtime'
import type {RelayTestUtilsIssuesShowFragmentQuery} from './__generated__/RelayTestUtilsIssuesShowFragmentQuery.graphql'
import {IssueAssignees} from '../mocks/IssueAssignees'
import type {RelayTestUtilsIssueAssigneesFragmentQuery} from './__generated__/RelayTestUtilsIssueAssigneesFragmentQuery.graphql'
import type {IssueAssignees_SelectedAssigneesFragment$key} from '../mocks/__generated__/IssueAssignees_SelectedAssigneesFragment.graphql'

type Queries = {issuesShowQuery: IssuesShowQuery; viewerQuery: ViewerQuery}
type FragmentQueries = {issuesShowQuery: RelayTestUtilsIssuesShowFragmentQuery; viewerQuery: ViewerQuery}
type AssigneeQueries = {
  issueAssigneesTestQuery: RelayTestUtilsIssueAssigneesFragmentQuery
  assigneesListQuery: ViewerQuery
}

const FRAGMENT_SHOW_QUERY = graphql`
  query RelayTestUtilsIssuesShowFragmentQuery @relay_test_operation {
    repository(owner: "owner", name: "repo") {
      issue(number: 33) {
        ...IssuesShowFragment
      }
    }
  }
`

const viewerTestQuery = graphql`
  query RelayTestUtilsViewerQuery @relay_test_operation {
    viewer {
      ...IssuesShowFragmentViewer
    }
  }
`

const ISSUE_ASSIGNEES_TEST_QUERY = graphql`
  query RelayTestUtilsIssueAssigneesFragmentQuery @relay_test_operation {
    repository(owner: "owner", name: "repo") {
      issue(number: 33) {
        assignees(first: 5) {
          ...IssueAssignees_SelectedAssigneesFragment
        }
      }
    }
  }
`

const mockResolvers: MockPayloadGenerator.MockResolvers = {
  Repository() {
    return {nameWithOwner: 'OWNER/REPO_NAME'}
  },
  Issue(_ctx, id) {
    return {title: `My issue title ${id()}`, number: 33}
  },
  User() {
    return {name: 'SOME NAME'}
  },
}

describe('RelayTestUtils', () => {
  describe('renderRelay', () => {
    it('should render preloaded queries', () => {
      renderRelay<Queries>(
        ({queryRefs: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowPage queries={{issuesShowQuery, viewerQuery}} entryPoints={{}} extraProps={{}} props={{}} />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'preloaded',
                query: ISSUES_SHOW_QUERY,
                variables: {owner: 'owner', repo: 'repo', number: 33},
              },
              viewerQuery: {
                type: 'preloaded',
                query: VIEWER_QUERY,
                variables: {},
              },
            },
            mockResolvers,
          },
        },
      )
      expect(screen.getByText(/Issues Show Page — My issue title 1 #33/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
      expect(screen.getByText('Repo description: loading description...')).toBeInTheDocument()
    })

    it('should render preloaded and lazy queries', () => {
      renderRelay<Queries & {descriptionQuery: LazyLoadRepoDescriptionQuery}>(
        ({queryRefs: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowPage queries={{issuesShowQuery, viewerQuery}} entryPoints={{}} extraProps={{}} props={{}} />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'preloaded',
                query: ISSUES_SHOW_QUERY,
                variables: {owner: 'owner', repo: 'repo', number: 33},
              },
              viewerQuery: {
                type: 'preloaded',
                query: VIEWER_QUERY,
                variables: {},
              },
              descriptionQuery: {
                type: 'lazy',
              },
            },
            mockResolvers: {
              Repository() {
                return {
                  nameWithOwner: 'OWNER/REPO',
                  description: 'REPO DESCRIPTION',
                }
              },
            },
          },
        },
      )
      expect(screen.getByText('Repo description: REPO DESCRIPTION')).toBeInTheDocument()
    })

    it('should be able to handle deferred queries', () => {
      const {relayMockEnvironment} = renderRelay<Queries>(
        ({queryRefs: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowPage queries={{issuesShowQuery, viewerQuery}} entryPoints={{}} extraProps={{}} props={{}} />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'preloaded',
                query: ISSUES_SHOW_QUERY,
                variables: {owner: 'owner', repo: 'repo', number: 33},
              },
              viewerQuery: {
                type: 'preloaded',
                query: VIEWER_QUERY,
                variables: {},
              },
            },
            mockResolvers,
          },
        },
      )

      expect(screen.queryByText('label: bugs')).toBeNull()

      act(() => {
        screen.getByText('click to load labels').click()
        relayMockEnvironment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            Label() {
              return {name: 'bugs'}
            },
          }),
        )
      })

      expect(screen.getByText('label: bugs')).toBeInTheDocument()
    })

    it('should render fragment queries', () => {
      renderRelay<FragmentQueries>(
        ({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner={'OWNER/REPO_NAME'}
          />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'fragment',
                query: FRAGMENT_SHOW_QUERY,
                variables: {},
              },
              viewerQuery: {
                type: 'fragment',
                query: VIEWER_QUERY,
                variables: {},
              },
            },
            mockResolvers,
          },
        },
      )
      expect(screen.getByText(/Issues Show Page — My issue title 1/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
      expect(screen.getByText('Repo description: loading description...')).toBeInTheDocument()
    })

    it('should render fragment and lazy queries', () => {
      renderRelay<FragmentQueries & {descriptionQuery: LazyLoadRepoDescriptionQuery}>(
        ({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner={'OWNER/REPO_NAME'}
          />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'fragment',
                query: FRAGMENT_SHOW_QUERY,
                variables: {},
              },
              viewerQuery: {
                type: 'fragment',
                query: VIEWER_QUERY,
                variables: {},
              },
              descriptionQuery: {
                type: 'lazy',
              },
            },
            mockResolvers: {
              Repository() {
                return {description: 'REPO DESCRIPTION'}
              },
            },
          },
        },
      )
      expect(screen.getByText('Repo description: REPO DESCRIPTION')).toBeInTheDocument()
    })

    it('should be able to handle fragments with deferred queries', () => {
      const {relayMockEnvironment} = renderRelay<FragmentQueries>(
        ({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner="OWNER/REPO_NAME"
          />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'fragment',
                query: FRAGMENT_SHOW_QUERY,
                variables: {},
              },
              viewerQuery: {
                type: 'fragment',
                query: VIEWER_QUERY,
                variables: {},
              },
            },
            mockResolvers,
          },
        },
      )

      expect(screen.queryByText('label: bugs')).toBeNull()

      act(() => {
        screen.getByText('click to load labels').click()
        relayMockEnvironment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            Label() {
              return {name: 'bugs'}
            },
          }),
        )
      })

      expect(screen.getByText('label: bugs')).toBeInTheDocument()
    })

    it('can render with a test query', () => {
      renderRelay<{issuesShowQuery: RelayTestUtilsIssuesShowFragmentQuery; viewerQuery: RelayTestUtilsViewerQuery}>(
        ({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner="OWNER/REPO_NAME"
          />
        ),
        {
          relay: {
            queries: {
              issuesShowQuery: {
                type: 'fragment',
                query: FRAGMENT_SHOW_QUERY,
                variables: {},
              },
              viewerQuery: {
                type: 'fragment',
                query: viewerTestQuery,
                variables: {},
              },
            },
            mockResolvers,
          },
        },
      )
      expect(screen.getByText(/Issues Show Page — My issue title 1/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
    })

    it('can render test queries that share data domains', () => {
      renderRelay<AssigneeQueries>(
        ({queryData}) => (
          <IssueAssignees
            selectedAssigneesKey={
              queryData.issueAssigneesTestQuery.repository?.issue
                ?.assignees as IssueAssignees_SelectedAssigneesFragment$key
            }
          />
        ),
        {
          relay: {
            queries: {
              issueAssigneesTestQuery: {
                type: 'fragment',
                query: ISSUE_ASSIGNEES_TEST_QUERY,
                variables: {},
              },
              assigneesListQuery: {
                type: 'lazy',
              },
            },
            mockResolvers: {
              Repository() {
                return {
                  nameWithOwner: 'OWNER/REPO_NAME',
                  issueOrPullRequest: {
                    suggestedAssignees: {
                      edges: [{node: {id: 'suggested-assignee', login: 'suggested assignee'}}],
                    },
                  },
                  issue: {
                    assignees: {nodes: [{id: 'selected-assignee', login: 'selected assignee'}]},
                  },
                }
              },
            },
          },
        },
      )

      expect(screen.getByText(/selected assignee/)).toBeInTheDocument()
      expect(screen.getByText(/suggested assignee/)).toBeInTheDocument()
    })

    it('should return the relay test environment and history', () => {
      const {environment, history} = createRelayMockEnvironment()

      const {relayMockEnvironment, relayMockHistory} = renderRelay(() => null, {
        relay: {
          environment,
          history,
          queries: {},
        },
      })

      expect(relayMockEnvironment).toBe(environment)
      expect(relayMockHistory).toBe(history)
    })

    it('should provide the relay test environment and history as a prop', () => {
      const {environment, history} = createRelayMockEnvironment()

      renderRelay(
        ({relayMockEnvironment, relayMockHistory}) => {
          expect(relayMockEnvironment).toBe(environment)
          expect(relayMockHistory).toBe(history)
          return <></>
        },
        {
          relay: {
            environment,
            history,
            queries: {},
          },
        },
      )
    })
  })
})
