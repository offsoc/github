import {Box, Button, Link, Truncate} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {useFragment, graphql} from 'react-relay'

import {commitHovercardPath} from '@github-ui/paths'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {
  SignedCommitBadge,
  type SignatureResult,
  type VerificationStatus,
  type CommitSignatureType,
  type CertificateAttributes,
} from '@github-ui/signed-commit-badge'
import {VALUES} from '../constants/values'
import {LABELS} from '../constants/labels'
import {useState} from 'react'
import {InfoIcon} from '@primer/octicons-react'
import type {ReferencedEventInner$data, ReferencedEventInner$key} from './__generated__/ReferencedEventInner.graphql'
import type {SafeHTMLString} from '@github-ui/safe-html'

export type ReferencedEventInnerProps = {
  commitKey: ReferencedEventInner$key
  viewerLogin: string | null
  willCloseSubject: boolean
  subjectType: string
}

type SignatureResultFromFragment = NonNullable<ReferencedEventInner$data['signature']>
type CertificateAttributesFromFragment = NonNullable<NonNullable<SignatureResultFromFragment>['subject']>

export function ReferencedEventInner({
  commitKey,
  willCloseSubject,
  viewerLogin,
  subjectType,
}: ReferencedEventInnerProps): JSX.Element {
  const commit = useFragment(
    graphql`
      fragment ReferencedEventInner on Commit {
        message
        messageHeadlineHTML
        messageBodyHTML
        url
        abbreviatedOid
        signature {
          __typename
          signer {
            login
            avatarUrl
          }
          state
          wasSignedByGitHub
          ... on SmimeSignature {
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
          ... on GpgSignature {
            keyId
          }
          ... on SshSignature {
            keyFingerprint
          }
        }
        verificationStatus
        hasSignature
        repository {
          name
          owner {
            login
          }
          defaultBranch
        }
      }
    `,
    commitKey,
  )
  const [showCommitBody, setShowCommitBody] = useState(false)

  if (commit === null) {
    return <></>
  }

  const defaultBranch = commit.repository.defaultBranch
  const willCloseMessage = LABELS.commitWillCloseMessage(subjectType, commit.abbreviatedOid, defaultBranch)

  const dataHovercardUrl = commitHovercardPath({
    owner: commit.repository.owner.login,
    repo: commit.repository.name,
    commitish: commit.abbreviatedOid,
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <Truncate title={commit.message} sx={{maxWidth: 500, fontSize: '12px', mr: 2}}>
            <Link
              href={commit.url}
              target="_blank"
              sx={{color: 'fg.muted', fontFamily: 'monospace'}}
              data-hovercard-url={dataHovercardUrl}
              muted
              aria-label={commit.message}
            >
              <MarkdownViewer
                verifiedHTML={
                  // we can be sure this is a SafeHTMLString because the concatenated content comes from a trusted
                  // GitHub graphql query
                  // eslint-disable-next-line github/unescaped-html-literal
                  `<p style="font-family:monospace;font-size:12px">${commit.messageHeadlineHTML}</p>` as SafeHTMLString
                }
              />
            </Link>
          </Truncate>
          {commit.messageBodyHTML && (
            <Button
              size="small"
              sx={{
                height: '12px',
                borderRadius: '2px',
                paddingBottom: '4px',
                paddingRight: '3px',
                paddingLeft: '3px',
              }}
              onClick={() => setShowCommitBody(!showCommitBody)}
            >
              ...
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            flexGrow: 1,
            columnGap: 2,
            marginLeft: '4px',
          }}
        >
          {willCloseSubject && (
            <Tooltip text={willCloseMessage} type="label">
              <Link href={VALUES.closingViaCommitMessageUrl} muted>
                <InfoIcon />
              </Link>
            </Tooltip>
          )}
          {commit.verificationStatus && commit.verificationStatus !== 'UNSIGNED' && commit.signature && (
            <SignedCommitBadge
              commitOid={commit.abbreviatedOid}
              hasSignature={commit.hasSignature}
              verificationStatus={getVerificationStatus(commit.verificationStatus)}
              signature={getSignatureResult(commit.signature, viewerLogin)}
            />
          )}
          <Link href={commit.url} sx={{fontFamily: 'monospace', fontSize: '12px'}} muted>
            {commit.abbreviatedOid}
          </Link>
        </Box>
      </Box>
      {showCommitBody && (
        <MarkdownViewer
          verifiedHTML={
            // we can be sure this is a SafeHTMLString because the concatenated content comes from a trusted
            // GitHub graphql query
            // eslint-disable-next-line github/unescaped-html-literal
            `<p style="font-family:monospace;font-size:12px">${commit.messageBodyHTML}</p>` as SafeHTMLString
          }
        />
      )}
    </Box>
  )
}

function getVerificationStatus(verificationStatus: string): VerificationStatus {
  switch (verificationStatus) {
    case 'VERIFIED':
      return 'verified'
    case 'UNVERIFIED':
      return 'unverified'
    case 'PARTIALLY_VERIFIED':
      return 'partially_verified'
    default:
      return 'unsigned'
  }
}

function getSignatureResult(signature: SignatureResultFromFragment, viewerLogin: string | null): SignatureResult {
  return {
    hasSignature: true,
    helpUrl: VALUES.commitBadgeHelpUrl,
    isViewer: !!signature.signer && viewerLogin === signature.signer.login,
    keyExpired: signature.state === 'EXPIRED_KEY',
    // keyId isn't used for S/MIME signatures
    keyId: (signature.__typename === 'GpgSignature' ? signature.keyId : signature.keyFingerprint) ?? '',
    keyRevoked: signature.state === 'OCSP_REVOKED',
    signedByGitHub: signature.wasSignedByGitHub,
    signerLogin: signature.signer?.login ?? '',
    signerAvatarUrl: signature.signer?.avatarUrl ?? '',
    signatureType: signature.__typename as CommitSignatureType,
    signatureCertificateSubject: toCertificateAttributes(signature.subject),
    signatureCertificateIssuer: toCertificateAttributes(signature.issuer),
    signatureVerificationReason: signature.state,
  }
}

function toCertificateAttributes(attributes?: CertificateAttributesFromFragment | null): CertificateAttributes {
  if (!attributes) {
    return {}
  }

  return {
    common_name: attributes.commonName ?? undefined,
    email_address: attributes.emailAddress ?? undefined,
    organization: attributes.organization ?? undefined,
    organization_unit: attributes.organizationUnit ?? undefined,
  }
}
