import {Label, Tooltip} from '@primer/react'
import type {LabelProps} from '@primer/react'
import type {SignatureResult, VerificationStatus} from './signed-commit-types'
import {SignedCommitDialog} from './SignedCommitDialog'
import {useState, useRef, forwardRef} from 'react'
import type {LabelColorOptions} from '@primer/react/lib-esm/Label/Label'

export interface SignedCommitBadgeProps {
  hasSignature: boolean
  verificationStatus?: VerificationStatus
  signature?: SignatureResult
  badgeSize?: LabelProps['size']
  commitOid: string
}

export function SignedCommitBadge({
  hasSignature,
  verificationStatus,
  signature,
  commitOid,
  badgeSize = 'small',
}: SignedCommitBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const badgeRef = useRef<HTMLButtonElement>(null)

  if (!verificationStatus || !signature) {
    return (
      <Tooltip aria-label="Verification status not available" direction="n" noDelay>
        <VerificationLabel verificationStatus="error" labelProps={{size: 'small'}} />
      </Tooltip>
    )
  }

  if (verificationStatus === 'unsigned') {
    return <></>
  }

  const labelProps = {
    as: 'button',
    onClick: () => setIsOpen(true),
    ref: badgeRef,
    size: badgeSize,
    sx: {cursor: 'pointer'},
  }

  const verification_label = <VerificationLabel labelProps={{...labelProps}} verificationStatus={verificationStatus} />

  return (
    <>
      {verification_label}
      {isOpen && (
        <SignedCommitDialog
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false)
            setTimeout(() => {
              badgeRef.current?.focus()
            }, 0)
          }}
          verificationStatus={verificationStatus}
          signature={signature}
          hasSignature={hasSignature}
          ariaLabel={`${verificationStatus.replace('_', ' ')}: ${commitOid.slice(0, 7)}`}
        />
      )}
    </>
  )
}

const STATUS_TO_LABEL = {
  verified: {
    label: 'Verified',
    variant: 'success',
  },
  unverified: {
    label: 'Unverified',
    variant: 'attention',
  },
  partially_verified: {
    label: 'Partially verified',
    variant: 'success',
  },
  error: {
    label: 'Verification error',
    variant: 'secondary',
  },
}

const VerificationLabel = forwardRef(
  (
    {verificationStatus, labelProps}: {verificationStatus: VerificationStatus | 'error'; labelProps: LabelProps},
    ref: React.ForwardedRef<HTMLSpanElement>,
  ) => {
    const labelAndVariant = STATUS_TO_LABEL[verificationStatus as keyof typeof STATUS_TO_LABEL]

    if (!labelAndVariant) {
      return <></>
    }

    return (
      <Label ref={ref} variant={labelAndVariant.variant as LabelColorOptions} {...labelProps}>
        {labelAndVariant.label}
      </Label>
    )
  },
)

VerificationLabel.displayName = 'VerificationLabel'
