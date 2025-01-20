import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SignedCommitBadge} from '../SignedCommitBadge'
import {createSignatureResult} from '../test-helper'

const testOid = '62c2fad14db6e737510b999fa7e764e2941b472c'

describe('SignedCommitBadge', () => {
  test('Renders the SignedCommitBadge with action menu', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.getByText('Verified')).toBeInTheDocument()

    expect(screen.queryByTestId('signed-commit-header')).not.toBeInTheDocument()

    await user.click(screen.getByText('Verified'))

    expect(screen.getByTestId('signed-commit-header')).toBeInTheDocument()
  })

  test('Renders the verified SignedCommitBadge', async () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  test('Renders the unverified SignedCommitBadge', async () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="unverified"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.getByText('Unverified')).toBeInTheDocument()
  })

  test('Renders the partially verified SignedCommitBadge', () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="partially_verified"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.getByText('Partially verified')).toBeInTheDocument()
  })

  test('Does not render SignedCommitBadge when unsigned', () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="unsigned"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    expect(screen.queryByText('Unverified')).not.toBeInTheDocument()
    expect(screen.queryByText('Partially Verified')).not.toBeInTheDocument()
  })

  test('Renders with error state when no verification status is given', () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus={undefined}
        signature={createSignatureResult()}
      />,
    )

    expect(screen.getByText('Verification error')).toBeInTheDocument()
  })

  test('Renders the error state when no signature is given', () => {
    render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={false}
        verificationStatus="verified"
        signature={undefined}
      />,
    )

    expect(screen.getByText('Verification error')).toBeInTheDocument()
  })
})

describe('SignedCommitBadge - footers', () => {
  test('GpgSignature signature type renders SignedCommitFooter', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult({signatureType: 'GpgSignature'})}
      />,
    )

    await user.click(screen.getByText('Verified')) // open dialog

    expect(screen.getByTestId('signed-commit-footer')).toBeInTheDocument()
  })

  test('SshSignature signature type renders SignedCommitFooter', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult({signatureType: 'SshSignature'})}
      />,
    )

    await user.click(screen.getByText('Verified')) // open action menu

    expect(screen.getByTestId('signed-commit-footer')).toBeInTheDocument()
  })

  test('SmimeSignature signature type renders SmimeCommitFooter', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult({signatureType: 'SmimeSignature'})}
      />,
    )

    await user.click(screen.getByText('Verified')) // open dialog

    expect(screen.getByTestId('smime-commit-footer')).toBeInTheDocument()
  })

  test('no signature type just renders help link', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult({signatureType: undefined})}
      />,
    )

    await user.click(screen.getByText('Verified')) // open dialog

    expect(screen.queryByTestId('signed-commit-footer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('smime-commit-footer')).not.toBeInTheDocument()
    expect(screen.getByTestId('signature-link')).toBeInTheDocument()
  })
})

describe('SignedCommitDialog', () => {
  test('it open the dialog when the badge is clicked', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult()}
      />,
    )

    expect(screen.queryByTestId('signed-commit-dialog')).not.toBeInTheDocument()

    await user.click(screen.getByText('Verified')) // open dialog

    expect(screen.getByTestId('signed-commit-dialog')).toBeInTheDocument()
  })

  test('it closes the dialog when the close button is clicked and returns focus', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="verified"
        signature={createSignatureResult()}
      />,
    )

    await user.click(screen.getByText('Verified')) // open dialog

    expect(screen.getByTestId('signed-commit-dialog')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Close'))

    expect(screen.queryByTestId('signed-commit-dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Verified')).toHaveFocus()
  })

  test('it renders with an accessible name', async () => {
    const {user} = render(
      <SignedCommitBadge
        commitOid={testOid}
        hasSignature={true}
        verificationStatus="partially_verified"
        signature={createSignatureResult()}
      />,
    )

    await user.click(screen.getByText('Partially verified')) // open dialog

    expect(screen.getByTestId('signed-commit-dialog')).toBeInTheDocument()

    expect(screen.getByRole('dialog')).toHaveAccessibleName('partially verified: 62c2fad')
  })
})
