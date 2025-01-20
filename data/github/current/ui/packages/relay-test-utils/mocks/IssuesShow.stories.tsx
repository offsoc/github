import type {Meta} from '@storybook/react'
import type {MockPayloadGenerator} from 'relay-test-utils'
import {IssuesShowPage} from './IssuesShow'
import ISSUES_SHOW_QUERY, {type IssuesShowQuery} from './__generated__/IssuesShowQuery.graphql'
import VIEWER_QUERY, {type ViewerQuery} from './__generated__/ViewerQuery.graphql'

import {relayDecorator, type RelayStoryObj} from '../storybook'

type IssuesShowPageQueries = {
  issuesShowQuery: IssuesShowQuery
  viewerQuery: ViewerQuery
}

const meta = {
  title: 'RelayTestUtils/IssuesShow',
  component: IssuesShowPage,
} satisfies Meta<typeof IssuesShowPage>

export default meta

const mockResolvers: MockPayloadGenerator.MockResolvers = {
  Repository() {
    return {nameWithOwner: 'OWNER/REPO_NAME'}
  },
  Issue(_ctx, id) {
    return {title: `My issue title ${id()}`, number: 33}
  },
  User() {
    return {login: 'SOME LOGIN', name: 'SOME NAME'}
  },
}

export const RelayDecorator = {
  decorators: [relayDecorator<typeof IssuesShowPage, IssuesShowPageQueries>],
  parameters: {
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
      mapStoryArgs: ({queryRefs: {issuesShowQuery, viewerQuery}}) => ({queries: {issuesShowQuery, viewerQuery}}),
    },
  },
} satisfies RelayStoryObj<typeof IssuesShowPage, IssuesShowPageQueries>

export const RelayDecoratorWithDefaultMapFunction = {
  decorators: [relayDecorator<typeof IssuesShowPage, IssuesShowPageQueries>],
  parameters: {
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
  args: {
    whatever: 'a string to show that additional args get mapped through to the story',
  },
} satisfies RelayStoryObj<typeof IssuesShowPage & React.ComponentType<{whatever: string}>, IssuesShowPageQueries>
