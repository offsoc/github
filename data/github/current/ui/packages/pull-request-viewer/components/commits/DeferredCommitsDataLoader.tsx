import type {CommitsProps} from '@github-ui/commits/shared/Commits'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Suspense, useEffect} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery} from 'react-relay'

import {mapSignatureResult, mapStatusCheckState, mapVerifiedStatus} from '../../helpers/commit-data-helpers'
import type {
  DeferredCommitsDataLoaderQuery,
  DeferredCommitsDataLoaderQuery$data,
  StatusState,
} from './__generated__/DeferredCommitsDataLoaderQuery.graphql'

function mapStatusCheckStatus(status: {shortText: string; state: StatusState} | null | undefined) {
  if (!status) return

  const mappedState = mapStatusCheckState(status.state)

  return {
    state: mappedState,
    short_text: status.shortText,
  }
}

function mapDeferredData(
  commits: NonNullable<NonNullable<DeferredCommitsDataLoaderQuery$data['repository']>['pullRequest']>['commits'],
  viewerLogin: string,
) {
  const mappedCommitData = []
  for (const edge of commits?.edges ?? []) {
    const commit = edge?.node?.commit
    if (!commit) {
      continue
    }

    const commitData = {
      oid: commit.oid as string,
      signatureInformation: mapSignatureResult(commit, viewerLogin),
      statusCheckStatus: mapStatusCheckStatus(commit.statusCheckRollup),
      verifiedStatus: mapVerifiedStatus(commit.verificationStatus),
    }

    mappedCommitData.push(commitData)
  }

  return {deferredCommits: mappedCommitData, loading: false, renameHistory: null, signatureInformation: null}
}

export const DeferredCommitsDataQuery = graphql`
  query DeferredCommitsDataLoaderQuery($owner: String!, $repo: String!, $number: Int!) {
    viewer {
      login
    }
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        commits(first: 50) {
          edges {
            node {
              # eslint-disable-next-line relay/unused-fields
              commit {
                hasSignature
                oid
                verificationStatus
                signature {
                  state
                  signer {
                    login
                    avatarUrl
                  }
                  wasSignedByGitHub
                  ... on GpgSignature {
                    __typename
                    keyId
                  }
                  ... on SmimeSignature {
                    __typename
                    issuer {
                      commonName
                      emailAddress
                      organization
                      organizationUnit
                    }
                    subject {
                      commonName
                      emailAddress
                      organization
                      organizationUnit
                    }
                  }
                  ... on SshSignature {
                    __typename
                    keyFingerprint
                  }
                }
                statusCheckRollup {
                  shortText
                  state
                }
              }
            }
          }
        }
      }
    }
  }
`

type DeferredDataCommitsLoaderProps = {
  onDeferredDataLoaded: (data: CommitsProps['deferredCommitData']) => void
  queryRef: PreloadedQuery<DeferredCommitsDataLoaderQuery>
}

export function DeferredCommitsDataLoader(props: DeferredDataCommitsLoaderProps) {
  return (
    <ErrorBoundary>
      <Suspense>
        <DeferredCommitsDataLoaderInner {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

function DeferredCommitsDataLoaderInner({onDeferredDataLoaded, queryRef}: DeferredDataCommitsLoaderProps) {
  const data = usePreloadedQuery<DeferredCommitsDataLoaderQuery>(DeferredCommitsDataQuery, queryRef)

  useEffect(() => {
    const commitsData = data.repository?.pullRequest?.commits
    const viewerLogin = data.viewer.login
    if (commitsData) {
      onDeferredDataLoaded(mapDeferredData(commitsData, viewerLogin))
    }
  }, [data, onDeferredDataLoaded])

  return null
}
