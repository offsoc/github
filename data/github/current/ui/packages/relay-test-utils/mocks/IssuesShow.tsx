import {graphql, type EntryPointComponent, type PreloadedQuery} from 'react-relay'
import {usePreloadedQuery, useFragment} from 'react-relay/hooks'
import type {IssuesShowQuery} from './__generated__/IssuesShowQuery.graphql'
import type {ViewerQuery} from './__generated__/ViewerQuery.graphql'
import {Viewer} from './Viewer'
import type {IssuesShowPageInternalFragment$key} from './__generated__/IssuesShowPageInternalFragment.graphql'

const IssuesShowQueryNode = graphql`
  query IssuesShowQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      ...IssuesShowPageInternalFragment @arguments(number: $number)
    }
  }
`

export const IssuesShowPage: EntryPointComponent<
  {
    issuesShowQuery: IssuesShowQuery
    viewerQuery: ViewerQuery
  },
  Record<string, never>
> = ({queries: {issuesShowQuery, viewerQuery}}) => {
  const data = usePreloadedQuery<IssuesShowQuery>(IssuesShowQueryNode, issuesShowQuery)

  if (!data.repository) {
    return null
  }
  return <IssueShowPageInternal repositoryKey={data.repository} viewerQuery={viewerQuery} />
}

type IssueShowPageInternalProps = {
  repositoryKey: IssuesShowPageInternalFragment$key
  viewerQuery: PreloadedQuery<ViewerQuery>
}

function IssueShowPageInternal({repositoryKey, viewerQuery}: IssueShowPageInternalProps) {
  const data = useFragment(
    graphql`
      fragment IssuesShowPageInternalFragment on Repository @argumentDefinitions(number: {type: "Int!"}) {
        ...ViewerIssuesShowPageInternalFragment @arguments(number: $number)
      }
    `,
    repositoryKey,
  )
  if (!data) {
    return null
  }
  return (
    <main>
      <Viewer viewerQuery={viewerQuery} repositoryKey={data} />
    </main>
  )
}
