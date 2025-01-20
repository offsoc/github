import type {Meta} from '@storybook/react'
import {SignedCommitBadge, type SignedCommitBadgeProps} from './SignedCommitBadge'
import {createSignatureResult} from './test-helper'

const meta = {
  title: 'Signed Commit Badge',
  component: SignedCommitBadge,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SignedCommitBadge>

export default meta

const defaultArgs: Partial<SignedCommitBadgeProps> = {
  hasSignature: true,
  commitOid: '62c2fad14db6e737510b999fa7e764e2941b472c',
}

export const VerifiedSignedCommitBadge = {
  args: {
    ...defaultArgs,
    verificationStatus: 'verified',
    signature: createSignatureResult({signatureVerificationReason: 'valid'}),
  },
  render: (args: SignedCommitBadgeProps) => <SignedCommitBadge {...args} />,
}

export const UnverifiedSignedCommitBadge = {
  args: {
    ...defaultArgs,
    verificationStatus: 'unverified',
    signature: createSignatureResult({signatureVerificationReason: 'unknown_key'}),
  },
  render: (args: SignedCommitBadgeProps) => <SignedCommitBadge {...args} />,
}

export const PartiallyVerifiedSignedCommitBadge = {
  args: {
    ...defaultArgs,
    verificationStatus: 'partially_verified',
    signature: createSignatureResult({signedByGitHub: false}),
  },
  render: (args: SignedCommitBadgeProps) => <SignedCommitBadge {...args} />,
}
