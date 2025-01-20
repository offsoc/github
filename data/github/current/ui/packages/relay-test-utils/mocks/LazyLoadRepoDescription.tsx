import {graphql, useLazyLoadQuery} from 'react-relay'
import type {LazyLoadRepoDescriptionQuery} from './__generated__/LazyLoadRepoDescriptionQuery.graphql'

export function LazyLoadRepoDescription({owner, repo}: {owner: string; repo: string}) {
  const data = useLazyLoadQuery<LazyLoadRepoDescriptionQuery>(
    graphql`
      query LazyLoadRepoDescriptionQuery($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          description
        }
      }
    `,
    {owner, repo},
  )
  return <>{data.repository?.description}</>
}
