import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'
import {IS_SERVER} from '@github-ui/ssr-utils'
import {useState, useEffect} from 'react'
import {useRelayEnvironment, useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {
  IssueViewerSecondaryIssueData$data,
  IssueViewerSecondaryIssueData$key,
} from './__generated__/IssueViewerSecondaryIssueData.graphql'

import {IssueViewerSecondaryIssueDataFragment} from './IssueViewer'
import type {
  IssueViewerSecondaryViewQuery,
  IssueViewerSecondaryViewQuery$data,
} from './__generated__/IssueViewerSecondaryViewQuery.graphql'
import type {IssueViewerSecondaryViewQueryData$key} from './__generated__/IssueViewerSecondaryViewQueryData.graphql'
import type {
  IssueViewerSecondaryViewQueryRepoData$data,
  IssueViewerSecondaryViewQueryRepoData$key,
} from './__generated__/IssueViewerSecondaryViewQueryRepoData.graphql'

type UseSecondaryQueryProps = {
  owner: string
  repo: string
  number: number
  markAsRead?: boolean
}

export const IssueViewerSecondaryGraphqlQuery = graphql`
  query IssueViewerSecondaryViewQuery($repo: String!, $owner: String!, $number: Int!, $markAsRead: Boolean = false) {
    repository(name: $repo, owner: $owner) {
      ...IssueViewerSecondaryViewQueryData @arguments(number: $number, markAsRead: $markAsRead)
    }
  }
`

// This defines all of the data fetched in the secondary query
// We separate it into fragments based on the type of the data's parent (currently Issue and Repository)
export const IssueViewerSecondaryData = graphql`
  fragment IssueViewerSecondaryViewQueryData on Repository
  @argumentDefinitions(number: {type: "Int!"}, markAsRead: {type: "Boolean", defaultValue: true}) {
    issue(number: $number, markAsRead: $markAsRead) {
      ...IssueViewerSecondaryIssueData
    }
    ...IssueViewerSecondaryViewQueryRepoData
  }
`

export function useSecondaryQuery({
  owner,
  repo,
  number,
  markAsRead = true,
}: UseSecondaryQueryProps): [
  IssueViewerSecondaryIssueData$data | null | undefined,
  IssueViewerSecondaryViewQueryRepoData$data | null | undefined,
] {
  const environment = useRelayEnvironment()
  const [secondaryQueryData, setSecondaryQueryData] = useState<IssueViewerSecondaryViewQueryData$key | null>(null)

  useEffect(() => {
    if (!IS_SERVER) {
      clientSideRelayFetchQueryRetained<IssueViewerSecondaryViewQuery>({
        environment,
        query: IssueViewerSecondaryGraphqlQuery,
        variables: {
          owner,
          repo,
          number,
          markAsRead,
        },
      }).subscribe({
        next: (data: IssueViewerSecondaryViewQuery$data) => {
          setSecondaryQueryData(data.repository ?? null)
        },
      })
    }
  }, [environment, markAsRead, number, owner, repo])

  const secondaryData = useFragment(IssueViewerSecondaryData, secondaryQueryData)

  const secondaryIssueKey: IssueViewerSecondaryIssueData$key | undefined | null = secondaryData?.issue
  const secondaryRepoKey: IssueViewerSecondaryViewQueryRepoData$key | undefined | null = secondaryData

  const secondaryIssueData = useFragment(IssueViewerSecondaryIssueDataFragment, secondaryIssueKey)
  const secondaryRepoData = useFragment(
    graphql`
      fragment IssueViewerSecondaryViewQueryRepoData on Repository {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...LazyContributorFooter
      }
    `,
    secondaryRepoKey,
  )

  return [secondaryIssueData, secondaryRepoData]
}
