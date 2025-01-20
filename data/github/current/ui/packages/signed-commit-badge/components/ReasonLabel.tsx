import {Link, Text} from '@primer/react'
import {isEnterprise} from '@github-ui/runtime-environment'
import type {CommitSignatureType} from '../signed-commit-types'

export default function ReasonLabel({
  reason,
  isViewer,
  hasSignature,
  verificationStatus,
  signatureType,
  signedByGitHub,
  keyExpired,
  keyRevoked,
}: {
  reason: string
  isViewer: boolean
  hasSignature: boolean
  verificationStatus: string
  signatureType: CommitSignatureType
  signedByGitHub: boolean
  keyExpired: boolean
  keyRevoked: boolean
}) {
  const settings_key_path = `/settings/keys`
  const settings_email_path = `/settings/emails`
  const keyName = signatureType === 'SshSignature' ? 'SSH' : 'GPG'
  const expiredOrRevokedText = keyExpired ? (
    <span> The key has expired{keyRevoked && <span> and has been revoked</span>}.</span>
  ) : keyRevoked ? (
    <span> The key has been revoked.</span>
  ) : (
    <></>
  )
  if (verificationStatus === 'unverified') {
    if (hasSignature && reason === 'GPGVERIFY_UNAVAILABLE') {
      return <span>The commit signature verification service is not available</span>
    } else if (!hasSignature) {
      return (
        <span>
          This commit is not signed, but one or more authors requires that any commit attributed to them is signed.
        </span>
      )
    } else {
      switch (reason) {
        case 'INVALID':
          return <span>The signature in this commit could not be verified. Someone may be trying to trick you.</span>

        case 'MALFORMED_SIG':
          return <span>We were unable to parse the signature in this commit.</span>

        case 'UNKNOWN_KEY':
          if (isViewer) {
            return (
              <span>
                <Link inline href={settings_key_path}>
                  Upload your public signing {keyName} key
                </Link>{' '}
                to verify your signature.
              </span>
            )
          } else {
            return <span>This user has not yet uploaded their public signing key.</span>
          }

        case 'BAD_EMAIL':
          return <span>The email in this signature doesn’t match the committer email.</span>

        case 'UNVERIFIED_EMAIL':
          if (isViewer) {
            return (
              <span>
                <Link inline href={settings_email_path}>
                  Verify your email address
                </Link>{' '}
                to verify your signature.
              </span>
            )
          } else {
            return <span>The committer email address is not verified.</span>
          }

        case 'NO_USER':
          return <span>No user is associated with the committer email.</span>

        case 'UNKNOWN_SIG_TYPE':
          return (
            <span>GitHub supports GPG and S/MIME signatures. We don&apos;t know what type of signature this is.</span>
          )

        case 'GPGVERIFY_ERROR':
          return <span>We had a problem verifying this signature. Please try again later.</span>

        case 'NOT_SIGNING_KEY':
          return <span>The key that signed this doesn&apos;t have usage flags that allow signing.</span>

        case 'EXPIRED_KEY':
          return <span>The key that signed this is expired.</span>

        case 'OCSP_ERROR':
          return <span>We had a problem checking for revoked certificates. Please try again later.</span>

        case 'OCSP_REVOKED':
          return <span>One or more certificates in the chain has been revoked.</span>

        case 'BAD_CERT':
          return <span>The signing certificate or its chain could not be verified.</span>

        case 'GPGVERIFY_UNAVAILABLE':
        case 'UNSIGNED':
          // These cases are handled above.
          return <span>We were unable to verify this signature.</span>
      }
    }
  } else if (verificationStatus === 'partially_verified') {
    if (signedByGitHub) {
      if (isEnterprise()) {
        return (
          <span>
            This commit was created on GitHub Enterprise Server and signed with a{' '}
            <Text sx={{fontWeight: 'bold'}}>verified signature</Text>.{expiredOrRevokedText}
          </span>
        )
      } else {
        return (
          <span>
            This commit was created on GitHub.com and signed with GitHub&apos;s{' '}
            <Text sx={{fontWeight: 'bold'}}>verified signature</Text>.{expiredOrRevokedText}
          </span>
        )
      }
    } else {
      return (
        <span>
          This commit was signed with the committer&apos;s <Text sx={{fontWeight: 'bold'}}>verified signature</Text>.
          {expiredOrRevokedText}
        </span>
      )
    }
  } else if (verificationStatus === 'verified') {
    switch (reason) {
      case 'VALID':
        if (signedByGitHub) {
          if (isEnterprise()) {
            return (
              <span>
                This commit was created on GitHub Enterprise Server and signed with a{' '}
                <Text sx={{fontWeight: 'bold'}}>verified signature</Text>.{expiredOrRevokedText}
              </span>
            )
          } else {
            return (
              <span>
                This commit was created on GitHub.com and signed with GitHub&apos;s{' '}
                <Text sx={{fontWeight: 'bold'}}>verified signature</Text>.{expiredOrRevokedText}
              </span>
            )
          }
        } else {
          return (
            <span>
              This commit was signed with the committer&apos;s <Text sx={{fontWeight: 'bold'}}>verified signature</Text>
              .{expiredOrRevokedText}
            </span>
          )
        }
      case 'OCSP_PENDING':
        return (
          <span>
            This commit was signed with a verified signature, though we&apos;re still working on certificate revocation
            checking.
          </span>
        )
    }
  }
  return <span />
}
