import type {Meta} from '@storybook/react'
import {IssuesShowFragment} from './IssuesShowFragment'
import {graphql} from 'react-relay'
import VIEWER_QUERY, {type ViewerQuery} from './__generated__/ViewerQuery.graphql'
import type {LazyLoadRepoDescriptionQuery} from './__generated__/LazyLoadRepoDescriptionQuery.graphql'

import {relayDecorator, type RelayStoryObj} from '../storybook'
import type {IssuesShowFragmentQuery} from './__generated__/IssuesShowFragmentQuery.graphql'

type IssuesShowPageQueries = {
  issuesShowQuery: IssuesShowFragmentQuery
  viewerQuery: ViewerQuery
  repoDescriptionQuery: LazyLoadRepoDescriptionQuery
}

const FRAGMENT_SHOW_QUERY = graphql`
  query IssuesShowFragmentQuery {
    repository(owner: "owner", name: "repo") {
      issue(number: 33) {
        ...IssuesShowFragment
      }
    }
  }
`

const meta = {
  title: 'RelayTestUtils/IssuesShowFragment',
  component: IssuesShowFragment,
} satisfies Meta<typeof IssuesShowFragment>

export default meta

export const RelayDecoratorFragment = {
  decorators: [relayDecorator<typeof IssuesShowFragment, IssuesShowPageQueries>],
  parameters: {
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
        repoDescriptionQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        Issue(_ctx, id) {
          return {title: `My issue title ${id()}`, number: 33}
        },
        User() {
          return {name: 'SOME NAME'}
        },
        Repository() {
          return {description: 'My repo has a lazy-loaded description'}
        },
      },
      mapStoryArgs: ({queryData: {issuesShowQuery, viewerQuery}}) => ({
        issueKey: issuesShowQuery.repository!.issue!,
        viewerKey: viewerQuery.viewer,
        nameWithOwner: 'OWNER/REPO_NAME',
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssuesShowFragment, IssuesShowPageQueries>
