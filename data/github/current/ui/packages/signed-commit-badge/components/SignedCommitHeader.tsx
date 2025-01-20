import {Box, Octicon} from '@primer/react'
import type {Icon} from '@primer/octicons-react'
import ReasonLabel from './ReasonLabel'
import type {CommitSignatureType} from '../signed-commit-types'

export default function SignedCommitHeader({
  icon,
  iconColor,
  reason,
  isViewer,
  hasSignature,
  verificationStatus,
  signatureType,
  signedByGitHub,
  keyExpired,
  keyRevoked,
}: {
  icon: Icon
  iconColor: string
  reason: string
  isViewer: boolean
  hasSignature: boolean
  verificationStatus: string
  signatureType: CommitSignatureType
  signedByGitHub: boolean
  keyExpired: boolean
  keyRevoked: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        p: 2,
      }}
      data-testid="signed-commit-header"
    >
      <Box sx={{pr: 2}}>
        <Octicon icon={icon} sx={{color: iconColor}} />
      </Box>
      <Box
        sx={{
          fontSize: 1,
          flexGrow: 1,
        }}
      >
        <ReasonLabel
          reason={reason}
          isViewer={isViewer}
          hasSignature={hasSignature}
          verificationStatus={verificationStatus}
          signatureType={signatureType}
          signedByGitHub={signedByGitHub}
          keyExpired={keyExpired}
          keyRevoked={keyRevoked}
        />
      </Box>
    </Box>
  )
}
