import {type PreloadedQuery, usePreloadedQuery, graphql} from 'react-relay'

import {IssueTimeline, type IssueTimelineProps} from '../IssueTimeline'
import type {IssueTimelineTestSharedQuery} from './__generated__/IssueTimelineTestSharedQuery.graphql'
import {noop} from '@github-ui/noop'

export const IssueTimelineGraphqlQuery = graphql`
  query IssueTimelineTestSharedQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        ...IssueTimelinePaginated @arguments(numberOfTimelineItems: 25)
      }
    }
  }
`

type IssueTimelineTestProps = {
  queryRef: PreloadedQuery<IssueTimelineTestSharedQuery>
  highlightedEventText?: string
} & Omit<IssueTimelineProps, 'issue'>

export function IssueTimelineTest({queryRef, ...rest}: IssueTimelineTestProps) {
  const {repository} = usePreloadedQuery<IssueTimelineTestSharedQuery>(IssueTimelineGraphqlQuery, queryRef)

  return repository && repository.issue ? <IssueTimeline issue={repository.issue} {...rest} navigate={noop} /> : null
}
