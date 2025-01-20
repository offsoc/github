import {type Author, type AuthorSettings, CommitAttribution as UiCommitAttribution} from '@github-ui/commit-attribution'
import {ChecksStatusBadge, useCommitChecksStatusDetails} from '@github-ui/commit-checks-status'
import {repositoryTreePath} from '@github-ui/paths'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {SignedCommitBadge} from '@github-ui/signed-commit-badge'
import {FileCodeIcon} from '@primer/octicons-react'
import {Box, LinkButton, RelativeTime, type SxProp} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {mapSignatureResult, mapStatusCheckState, mapUser, mapVerifiedStatus} from '../../helpers/commit-data-helpers'
import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'
import type {CommitDiffHeading_commit$key} from './__generated__/CommitDiffHeading_commit.graphql'
import type {CommitDiffHeading_viewer$key} from './__generated__/CommitDiffHeading_viewer.graphql'

function AsyncChecksStatusBadge({
  descriptionString = '',
  oid,
  ownerLogin,
  repoName,
  status,
}: {
  descriptionString?: string
  oid: string
  ownerLogin: string
  repoName: string
  status: string | undefined
}) {
  const [details, fetchDetails] = useCommitChecksStatusDetails(oid, {ownerLogin, name: repoName})

  return status ? (
    <ChecksStatusBadge
      buttonSx={{height: '18px', color: 'fg.muted', p: 0}}
      combinedStatus={details}
      descriptionText={descriptionString}
      disablePopover={false}
      size={'small'}
      statusRollup={status}
      onWillOpenPopup={fetchDetails}
    />
  ) : null
}

export function CommitAttribution({
  authors,
  committedDate,
  committer,
  committerAttribution,
  owner,
  repoName,
  settings,
}: {
  authors: Author[]
  committedDate: string
  committer: Author
  committerAttribution: boolean
  owner: string
  repoName: string
  settings?: Partial<AuthorSettings>
}) {
  return (
    <UiCommitAttribution
      authors={authors}
      committer={committer}
      committerAttribution={committerAttribution}
      includeVerbs={true}
      authorSettings={{
        fontWeight: 'normal',
        fontColor: 'fg.default',
        avatarSize: 16,
        ...settings,
      }}
      // only uses repo name and owner login to construct URLs. We don't want to overfetch data that isn't being used.
      repo={{
        name: repoName,
        ownerLogin: owner,
      }}
    >
      <RelativeTime datetime={committedDate} sx={{pl: 1}} tense="past" />
    </UiCommitAttribution>
  )
}

export function CommitDiffHeading({
  commit,
  sx,
  viewer,
}: {
  commit: CommitDiffHeading_commit$key
  sx?: SxProp['sx']
  viewer: CommitDiffHeading_viewer$key
}) {
  const commitData = useFragment(
    graphql`
      fragment CommitDiffHeading_commit on Commit {
        abbreviatedOid
        authoredByCommitter
        committedDate
        committedViaWeb
        hasSignature
        messageHeadlineHTML
        messageBodyHTML
        oid
        verificationStatus
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
        repository {
          owner {
            login
          }
          name
        }
        statusCheckRollup {
          shortText
          state
        }
        # eslint-disable-next-line relay/unused-fields
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
      }
    `,
    commit,
  )

  const viewerData = useFragment(
    graphql`
      fragment CommitDiffHeading_viewer on User {
        login
      }
    `,
    viewer,
  )

  const repoName = commitData.repository.name
  const owner = commitData.repository.owner.login
  const statusDescription = commitData.statusCheckRollup?.shortText?.split('checks')[0]?.trim() || ''
  const {ghostUser} = usePullRequestPageAppPayload()
  const authors =
    commitData.authors?.edges?.flatMap(authorEdge =>
      authorEdge?.node ? mapUser(authorEdge.node?.user, ghostUser) : [],
    ) ?? []
  const committer = mapUser(commitData.committer?.user, ghostUser)
  const signature = mapSignatureResult(commitData, viewerData.login)

  return (
    <Box sx={{...sx}}>
      <Box
        sx={{
          position: 'relative',
          alignItems: 'center',
          bg: 'canvas.subtle',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: 'flex',
          p: 3,
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0}}>
          <Box sx={{display: 'flex', flexDirection: ['column', 'row', 'row', 'row'], flexGrow: 1}}>
            <Box sx={{display: 'flex', flexGrow: 1, alignItems: 'center'}}>
              <SafeHTMLBox
                html={commitData.messageHeadlineHTML as SafeHTMLString}
                sx={{mr: 2, display: 'inline', fontWeight: 500}}
              />
              {commitData.statusCheckRollup && (
                <AsyncChecksStatusBadge
                  descriptionString={statusDescription}
                  oid={commitData.oid as string}
                  ownerLogin={owner}
                  repoName={repoName}
                  status={mapStatusCheckState(commitData.statusCheckRollup.state)}
                />
              )}
            </Box>
            <Box sx={{my: [2, 0, 0, 0]}}>
              <LinkButton
                leadingVisual={FileCodeIcon}
                href={repositoryTreePath({
                  repo: {name: repoName, ownerLogin: owner},
                  action: 'tree',
                  commitish: commitData.oid as string,
                })}
              >
                Browse files
              </LinkButton>
            </Box>
          </Box>
          {commitData.messageBodyHTML && (
            <SafeHTMLBox
              html={commitData.messageBodyHTML as SafeHTMLString}
              sx={{
                color: 'fg.muted',
                fontFamily: 'var(--fontStack-monospace)',
                fontSize: 0,
                px: 2,
                wordBreak: 'break-word',
              }}
            />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'relative',
          alignItems: 'center',
          bg: 'canvas.default',
          border: '1px solid',
          borderTop: 'none',
          borderColor: 'border.default',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          display: 'flex',
          flexGrow: 1,
          p: 3,
          color: 'fg.muted',
          fontSize: 1,
          fontWeight: 400,
        }}
      >
        <Box sx={{flexGrow: 1, display: 'flex', gap: 2}}>
          <CommitAttribution
            authors={authors}
            committedDate={commitData.committedDate}
            committer={committer}
            committerAttribution={!commitData.authoredByCommitter && !commitData.committedViaWeb}
            owner={owner}
            repoName={repoName}
          />
          {signature && (
            <SignedCommitBadge
              commitOid={commitData.oid as string}
              hasSignature={commitData.hasSignature}
              signature={signature}
              verificationStatus={mapVerifiedStatus(commitData.verificationStatus)}
            />
          )}
        </Box>
        <div>
          Commit{' '}
          <Box as="span" sx={{fontSize: 0, fontFamily: 'var(--fontStack-monospace)', color: 'fg.default'}}>
            {commitData.abbreviatedOid}
          </Box>
        </div>
      </Box>
    </Box>
  )
}
