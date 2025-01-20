import {assertDataPresent} from '@github-ui/assert-data-present'
import {Commits, type CommitsProps} from '@github-ui/commits/shared/Commits'
import type {CommentAuthor} from '@github-ui/conversations'
import {formatDate} from '@github-ui/date-picker'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {useCallback, useMemo, useState} from 'react'
import {graphql, type PreloadedQuery, useFragment} from 'react-relay'

import {mapUser} from '../../helpers/commit-data-helpers'
import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'
import {pullRequestUrl} from '../../utils/urls'
import type {
  CommitsView_repository$data,
  CommitsView_repository$key,
} from './__generated__/CommitsView_repository.graphql'
import type {DeferredCommitsDataLoaderQuery} from './__generated__/DeferredCommitsDataLoaderQuery.graphql'
import {DeferredCommitsDataLoader} from './DeferredCommitsDataLoader'

type DeferredData = CommitsProps['deferredCommitData']
interface GhostUserType extends CommentAuthor {
  displayName: string
  path: string
}
function groupCommits(
  commits: NonNullable<CommitsView_repository$data['pullRequest']>['commits'],
  ghostUser: GhostUserType,
  commitBaseUrl: string,
): CommitsProps['commitGroups'] {
  const mappedCommitData = []
  for (const edge of commits?.edges ?? []) {
    const commit = edge?.node?.commit
    const titleMarkdownLink = edge?.node?.messageHeadlineHTMLLink ?? ''
    if (!commit) {
      continue
    }

    const authors =
      commit.authors?.edges?.flatMap(authorEdge =>
        authorEdge?.node ? mapUser(authorEdge.node?.user, ghostUser) : [],
      ) ?? []
    const committer = mapUser(commit.committer?.user, ghostUser)

    const commitData = {
      authoredDate: commit.authoredDate,
      authors,
      committedDate: commit.committedDate,
      committer,
      committerAttribution: !commit.authoredByCommitter && !commit.committedViaWeb,
      shortMessage: commit.messageHeadline,
      shortMessageMarkdownLink: titleMarkdownLink as SafeHTMLString,
      bodyMessageHtml: commit.messageBodyHTML as SafeHTMLString,
      oid: commit.oid as string,
      url: `${commitBaseUrl}/${commit.oid}`,
    }

    mappedCommitData.push(commitData)
  }

  const groups = mappedCommitData.reduce(
    (commitGroups, commit) => {
      const date = formatDate(new Date(commit.committedDate), 'MMM d, yyyy')
      if (!date) return commitGroups

      if (!commitGroups[date]) {
        commitGroups[date] = []
      }

      commitGroups[date].push(commit)
      return commitGroups
    },
    {} as Record<string, CommitsProps['commitGroups'][0]['commits']>,
  )

  return Object.keys(groups).map(date => {
    const commitsList = groups[date]!
    const commitGroupTitle = date
    return {
      title: commitGroupTitle,
      commits: commitsList,
    }
  })
}

export function CommitsView({
  deferredCommitsDataQuery,
  repository,
}: {
  deferredCommitsDataQuery: PreloadedQuery<DeferredCommitsDataLoaderQuery>
  repository: CommitsView_repository$key
}) {
  const repositoryData = useFragment(
    graphql`
      fragment CommitsView_repository on Repository {
        name
        owner {
          login
        }
        pullRequest(number: $number) {
          number
          commits(first: 50) {
            edges {
              node {
                messageHeadlineHTMLLink
                commit {
                  committedViaWeb
                  authoredByCommitter
                  authoredDate
                  committedDate
                  messageBodyHTML
                  messageHeadline
                  oid
                  # eslint-disable-next-line relay/unused-fields
                  authors(first: 3) {
                    edges {
                      node {
                        user {
                          avatarUrl
                          login
                          name
                          resourcePath
                        }
                      }
                    }
                  }
                  # eslint-disable-next-line relay/unused-fields
                  committer {
                    user {
                      avatarUrl
                      login
                      name
                      resourcePath
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    repository,
  )

  const pullRequest = repositoryData.pullRequest
  assertDataPresent(pullRequest)

  const [deferredData, setDeferredData] = useState<DeferredData>({
    deferredCommits: [],
    loading: true,
    renameHistory: null,
  })

  const handleDeferredDataLoad = useCallback((data: DeferredData) => setDeferredData(data), [])

  const commitsRepositoryData = useMemo(
    () => ({
      name: repositoryData.name,
      ownerLogin: repositoryData.owner.login,
    }),
    [repositoryData.name, repositoryData.owner.login],
  )
  const {ghostUser} = usePullRequestPageAppPayload()
  const baseCommitUrl = `${pullRequestUrl({
    owner: repositoryData.owner.login,
    repoName: repositoryData.name,
    number: pullRequest.number.toString(),
  })}/files`
  const commitGroups = groupCommits(pullRequest.commits, ghostUser, baseCommitUrl)

  return (
    <>
      <DeferredCommitsDataLoader queryRef={deferredCommitsDataQuery} onDeferredDataLoaded={handleDeferredDataLoad} />
      <Commits commitGroups={commitGroups} deferredCommitData={deferredData} repository={commitsRepositoryData} />
    </>
  )
}
