import type {SignatureResult, VerificationStatus} from '@github-ui/signed-commit-badge'

import type {
  CommitVerificationStatus,
  DeferredCommitsDataLoaderQuery$data,
  StatusState,
} from '../components/commits/__generated__/DeferredCommitsDataLoaderQuery.graphql'

export type Commits = NonNullable<
  NonNullable<DeferredCommitsDataLoaderQuery$data['repository']>['pullRequest']
>['commits']
export type Commit = NonNullable<NonNullable<NonNullable<Commits['edges']>[0]>['node']>['commit']

export function mapUser(
  user: {login: string; avatarUrl: string; resourcePath: string; name: string | null | undefined} | null | undefined,
  ghostUser: {login: string; avatarUrl: string; displayName: string; path: string; url: string},
) {
  if (!user) return ghostUser

  return {
    avatarUrl: user.avatarUrl,
    login: user.login,
    path: user.resourcePath,
    displayName: user.name ?? '',
  }
}

export function mapSignatureResult(commit: Commit, viewerLogin: string): SignatureResult | undefined {
  const signature = commit.signature
  if (!signature || !commit.hasSignature) {
    return {hasSignature: false, signatureVerificationReason: 'unsigned'} as SignatureResult
  }

  const issuer = commit.signature.issuer
  const signatureCertificateIssuer = issuer
    ? {
        common_name: issuer.commonName,
        email_address: issuer.emailAddress,
        organization: issuer.organization,
        organization_unit: issuer.organizationUnit,
      }
    : undefined

  const subject = commit.signature.subject
  const signatureCertificateSubject = subject
    ? {
        common_name: subject.commonName,
        email_address: subject.emailAddress,
        organization: subject.organization,
        organization_unit: subject.organizationUnit,
      }
    : undefined

  return {
    hasSignature: true,
    isViewer: signature.signer?.login === viewerLogin,
    keyExpired: signature.state === 'EXPIRED_KEY',
    keyId: signature.keyId ?? signature.keyFingerprint ?? '',
    keyRevoked: signature.state === 'OCSP_REVOKED',
    signatureType: signature.__typename,
    signatureVerificationReason: signature.state,
    signedByGitHub: signature.wasSignedByGitHub,
    signerAvatarUrl: signature?.signer?.avatarUrl ?? '',
    signatureCertificateIssuer,
    signatureCertificateSubject,
    signerLogin: signature?.signer?.login ?? '',
  } as SignatureResult
}

export function mapVerifiedStatus(verifiedStatus: CommitVerificationStatus | null | undefined): VerificationStatus {
  switch (verifiedStatus) {
    case 'PARTIALLY_VERIFIED':
    case 'UNSIGNED':
    case 'UNVERIFIED':
    case 'VERIFIED':
      return verifiedStatus.toLowerCase() as VerificationStatus
    default:
      return 'unsigned'
  }
}

export function mapStatusCheckState(status: StatusState) {
  if (!status) return

  let mappedState: 'failure' | 'pending' | 'success' | undefined = undefined
  switch (status) {
    case 'ERROR':
    case 'FAILURE':
      mappedState = 'failure'
      break
    case 'PENDING':
      mappedState = 'pending'
      break
    case 'SUCCESS':
      mappedState = 'success'
  }

  return mappedState
}
