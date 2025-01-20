import {render, screen} from '@testing-library/react'
import {IssuesShowPage} from '../mocks/IssuesShow'
import {IssuesShowFragment} from '../mocks/IssuesShowFragment'
import ISSUES_SHOW_QUERY, {type IssuesShowQuery} from '../mocks/__generated__/IssuesShowQuery.graphql'
import VIEWER_QUERY, {type ViewerQuery} from '../mocks/__generated__/ViewerQuery.graphql'
import type {LazyLoadRepoDescriptionQuery} from '../mocks/__generated__/LazyLoadRepoDescriptionQuery.graphql'

import {relayTestFactory} from '../RelayTestFactories'
import type {RelayTestFactoriesIssuesShowFragmentQuery} from './__generated__/RelayTestFactoriesIssuesShowFragmentQuery.graphql'
import {graphql} from 'react-relay'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {createRelayMockEnvironment, type EnvironmentHistory} from '../RelayMockEnvironment'

const FRAGMENT_SHOW_QUERY = graphql`
  query RelayTestFactoriesIssuesShowFragmentQuery @relay_test_operation {
    repository(owner: "owner", name: "repo") {
      issue(number: 33) {
        ...IssuesShowFragment
      }
    }
  }
`

describe('RelayTestFactories', () => {
  describe('relayTestFactory', () => {
    it('should render preloaded queries', () => {
      const {decorator} = relayTestFactory<{issuesShowQuery: IssuesShowQuery; viewerQuery: ViewerQuery}>({
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
        mockResolvers: {
          Repository() {
            return {nameWithOwner: 'OWNER/REPO_NAME'}
          },
          Issue(_ctx, id) {
            return {title: `My issue title ${id()}`, number: 33}
          },
          User() {
            return {name: 'NAME'}
          },
        },
      })

      render(
        decorator(({queryRefs: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowPage queries={{issuesShowQuery, viewerQuery}} entryPoints={{}} extraProps={{}} props={{}} />
        )),
      )

      expect(screen.getByText(/Issues Show Page — My issue title 1 #33/)).toBeInTheDocument()
      expect(screen.getByText(/You are NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
    })

    it('should render preloaded and lazy queries', () => {
      render(
        relayTestFactory<{
          issuesShowQuery: IssuesShowQuery
          viewerQuery: ViewerQuery
          descriptionQuery: LazyLoadRepoDescriptionQuery
        }>({
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
        }).decorator(({queryRefs: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowPage queries={{issuesShowQuery, viewerQuery}} entryPoints={{}} extraProps={{}} props={{}} />
        )),
      )

      expect(screen.getByText('Repo description: REPO DESCRIPTION')).toBeInTheDocument()
    })

    it('should render fragment queries', () => {
      render(
        relayTestFactory<{issuesShowQuery: RelayTestFactoriesIssuesShowFragmentQuery; viewerQuery: ViewerQuery}>({
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
          mockResolvers: {
            Issue(_ctx, id) {
              return {title: `My issue title ${id()}`, number: 33}
            },
            User() {
              return {name: 'SOME NAME'}
            },
          },
        }).decorator(({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner={'OWNER/REPO_NAME'}
          />
        )),
      )

      expect(screen.getByText(/Issues Show Page — My issue title 1/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
      expect(screen.getByText('Repo description: loading description...')).toBeInTheDocument()
    })

    it('should render fragment and lazy queries', () => {
      render(
        relayTestFactory<{
          issuesShowQuery: RelayTestFactoriesIssuesShowFragmentQuery
          viewerQuery: ViewerQuery
          descriptionQuery: LazyLoadRepoDescriptionQuery
        }>({
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
        }).decorator(({queryData: {issuesShowQuery, viewerQuery}}) => (
          <IssuesShowFragment
            issueKey={issuesShowQuery.repository!.issue!}
            viewerKey={viewerQuery.viewer}
            nameWithOwner={'OWNER/REPO_NAME'}
          />
        )),
      )

      expect(screen.getByText('Repo description: REPO DESCRIPTION')).toBeInTheDocument()
    })

    it('should provide the internal relay test environment and history as a props', () => {
      render(
        relayTestFactory({queries: {}}).decorator(({relayMockEnvironment, relayMockHistory}) => {
          expect(relayMockEnvironment).toMatchObject<Partial<RelayMockEnvironment>>(expectedRelayMockEnvironment)
          expect(relayMockHistory).toMatchObject<EnvironmentHistory>(expectedRelayMockHistory)
          return null
        }),
      )
    })

    it('should provide the passed relay test environment and history as a props', () => {
      const {environment, history} = createRelayMockEnvironment()

      render(
        relayTestFactory({environment, history, queries: {}}).decorator(({relayMockEnvironment, relayMockHistory}) => {
          expect(relayMockEnvironment).toBe(environment)
          expect(relayMockHistory).toBe(history)
          return null
        }),
      )
    })

    it('should throw when a history is provided without an environment', () => {
      const {history} = createRelayMockEnvironment()
      expect(() => {
        relayTestFactory({history, queries: {}})
      }).toThrow('Cannot pass `history` without also passing an `environment`')
    })

    it('should return the internal relay test environment and history', () => {
      const {relayMockEnvironment, relayMockHistory} = relayTestFactory({queries: {}})
      expect(relayMockEnvironment).toMatchObject<Partial<RelayMockEnvironment>>(expectedRelayMockEnvironment)
      expect(relayMockHistory).toMatchObject<EnvironmentHistory>(expectedRelayMockHistory)
    })

    it('should return the passed relay test environment and history', () => {
      const {environment, history} = createRelayMockEnvironment()

      const {relayMockEnvironment, relayMockHistory} = relayTestFactory({environment, history, queries: {}})
      expect(relayMockEnvironment).toBe(environment)
      expect(relayMockHistory).toBe(history)
    })
  })
})

const expectedRelayMockEnvironment: Partial<RelayMockEnvironment> = {
  mock: expect.any(Object),
  applyUpdate: expect.any(Function),
  commitPayload: expect.any(Function),
  lookup: expect.any(Function),
  subscribe: expect.any(Function),
  retain: expect.any(Function),
  execute: expect.any(Function),
  check: expect.any(Function),
  getStore: expect.any(Function),
  mockClear: expect.any(Function),
  options: undefined,
  executeMutation: expect.any(Function),
  executeWithSource: expect.any(Function),
}

const expectedRelayMockHistory: EnvironmentHistory = {
  getEvents: expect.any(Function),
  printEventDescriptions: expect.any(Function),
}
