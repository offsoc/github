import type {User} from '@github-ui/react-core/test-utils'
// eslint-disable-next-line @github-ui/github-monorepo/restrict-package-deep-imports
import type {SecretsMetadata} from '@github-ui/repos-rules/types/rules-types'
import {screen} from '@testing-library/react'
import {sampleRuleSuite} from './secret_scanning_helpers'

export function checkRadioButtons(present: boolean, selected_name: string | null) {
  if (!present) {
    // The radio buttons are only present on the reviewer view.
    return
  }
  const radioButtons = screen.getAllByRole('radio')
  expect(radioButtons).toHaveLength(3)

  const names = ['tests', 'false_positive', 'fixed_later']

  for (const radioButton of radioButtons) {
    const inputElement = radioButton as HTMLInputElement
    expect(names).toContain(inputElement.name)
    if (inputElement.name === selected_name) {
      // This radio button should be checked
      expect(inputElement.checked).toBeTruthy()
    } else {
      // But all the others should be unchecked
      expect(inputElement.checked).toBeFalsy()
    }
  }
}
export async function checkDetails(user: User, pendingCommit: boolean = false) {
  expect(screen.getAllByRole('button', {name: 'View details'})).toHaveLength(1)
  const viewDetailsButton = screen.getByRole('button', {name: 'View details'})
  await user.click(viewDetailsButton)
  expect(screen.getAllByText('GitHub Secret Scanning')).toHaveLength(1)
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const secretMetadata: SecretsMetadata = sampleRuleSuite.ruleRuns[0]?.metadata! as SecretsMetadata
  const secrets = secretMetadata.secrets
  const locations = secrets[0]?.locations
  if (pendingCommit) {
    const location = locations![0]
    expect(screen.getByText(`commit: Pending (from file editor)`)).toBeInTheDocument()
    expect(
      screen.getAllByText(`path: /home/README.md:${location?.start_line}:${location?.start_line_byte_position}`)[0],
    ).toBeInTheDocument()
    expect(screen.getAllByText(`branch: ${sampleRuleSuite.refName}`)[0]).toBeInTheDocument()
  } else {
    for (const location of locations!) {
      expect(screen.getByText(`commit: ${location.commit_oid}`)).toBeInTheDocument()
      expect(
        screen.getAllByText(`path: ${location.path}:${location.start_line}:${location.start_line_byte_position}`)[0],
      ).toBeInTheDocument()
      expect(screen.getAllByText(`branch: ${sampleRuleSuite.refName}`)[0]).toBeInTheDocument()
    }
  }
}

export function checkUser(expectedUserLogin: string) {
  const user = screen.getAllByRole('link', {name: `View ${expectedUserLogin} profile`})
  expect(user).toHaveLength(1)
  expect(user[0]).toHaveAttribute('href', `/${expectedUserLogin}`)
  const icons = screen.getAllByRole('presentation')
  expect(icons).toHaveLength(1)
  expect(icons[0]).toHaveAttribute('data-hovercard-url', `/users/${expectedUserLogin}/hovercard`)
}
