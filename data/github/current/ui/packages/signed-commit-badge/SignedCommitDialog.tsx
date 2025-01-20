import {Box, Link} from '@primer/react'
import {Dialog, type DialogHeaderProps} from '@primer/react/experimental'
import type {SignatureResult, VerificationStatus} from './signed-commit-types'
import SignedCommitHeader from './components/SignedCommitHeader'
import {VerifiedIcon, UnverifiedIcon} from '@primer/octicons-react'
import SignedCommitFooter, {type Signer} from './components/SignedCommitFooter'
import SmimeCommitFooter from './components/SmimeCommitFooter'

interface CheckStatusDialogProps {
  isOpen: boolean
  onDismiss: () => void
  verificationStatus: VerificationStatus
  signature: SignatureResult
  hasSignature: boolean
  ariaLabel?: string
}

export function SignedCommitDialog(props: CheckStatusDialogProps) {
  const {ariaLabel, hasSignature, isOpen, onDismiss, signature, verificationStatus} = props

  const {footerLabel, footerUrl} = getCommitSigningHelpLink(signature.helpUrl)

  const reason = signature.signatureVerificationReason.toUpperCase()
  const signedByGitHub = signature.signedByGitHub

  const {icon, icon_color} =
    verificationStatus === 'unverified'
      ? {icon: UnverifiedIcon, icon_color: 'fg.muted'}
      : {icon: VerifiedIcon, icon_color: 'success.fg'}

  let signer: Signer | undefined = undefined
  if (verificationStatus !== 'unverified' && !signedByGitHub) {
    signer = {avatar_url: signature.signerAvatarUrl, login: signature.signerLogin}
  }

  const signatureLink = (
    <Link href={footerUrl} data-testid="signature-link" className="Link--inTextBlock">
      {footerLabel}
    </Link>
  )

  return isOpen ? (
    <Dialog
      onClose={onDismiss}
      sx={{
        overflowY: 'auto',
        backgroundColor: 'canvas.default',
        boxShadow: 'none',
      }}
      title={verificationStatus}
      width="small"
      renderHeader={({dialogLabelId}: DialogHeaderProps) => (
        <Box
          data-testid="signed-commit-dialog"
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            p: 2,
            backgroundColor: 'canvas.subtle',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: 'border.subtle',
          }}
        >
          <Dialog.Title id={dialogLabelId} className="sr-only">
            {ariaLabel ?? verificationStatus}
          </Dialog.Title>
          <SignedCommitHeader
            reason={reason}
            icon={icon}
            iconColor={icon_color}
            verificationStatus={verificationStatus}
            isViewer={signature.isViewer}
            hasSignature={hasSignature}
            signatureType={signature.signatureType}
            signedByGitHub={signedByGitHub}
            keyExpired={signature.keyExpired}
            keyRevoked={signature.keyRevoked}
          />
          <Dialog.CloseButton onClose={onDismiss} />
        </Box>
      )}
      renderBody={() => {
        return (
          <Dialog.Body sx={{padding: 0}}>
            {signature.signatureType === 'GpgSignature' || signature.signatureType === 'SshSignature' ? (
              <SignedCommitFooter
                keyHex={signature.keyId}
                signatureType={signature.signatureType}
                signer={signer}
                showPartiallyVerifiedMessage={verificationStatus === 'partially_verified'}
                signingLinkComponent={signatureLink}
                keyExpired={signature.keyExpired}
                keyRevoked={signature.keyRevoked}
              />
            ) : signature.signatureType === 'SmimeSignature' &&
              signature.signatureCertificateSubject &&
              signature.signatureCertificateIssuer ? (
              <SmimeCommitFooter
                issuer={signature.signatureCertificateIssuer}
                subject={signature.signatureCertificateSubject}
                signingLinkComponent={signatureLink}
              />
            ) : (
              <Box sx={{display: 'flex'}}>
                <Box
                  sx={{
                    fontSize: 0,
                    p: 3,
                  }}
                >
                  {signatureLink}
                </Box>
              </Box>
            )}
          </Dialog.Body>
        )
      }}
    />
  ) : null
}

function getCommitSigningHelpLink(helpUrl: string) {
  return {
    footerLabel: 'Learn about vigilant mode',
    footerUrl: `${helpUrl}/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits`,
  }
}
