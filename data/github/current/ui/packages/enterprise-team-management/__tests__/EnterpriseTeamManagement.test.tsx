import {act, fireEvent, screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EnterpriseTeamManagement} from '../routes/EnterpriseTeamManagement'
import {
  getEnterpriseTeamManagementRoutePayload,
  getEnterpriseTeamManagementRoutePayloadNoIdpMapped,
  getEnterpriseTeamManagementRoutePayloadNoTeam,
} from '../test-utils/mock-data'
import {verifiedFetch} from '@github-ui/verified-fetch'

const mockVerifiedFetch = verifiedFetch as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
}))

test('Renders the EnterpriseTeamManagement for a New Team', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  // Verifies the owner "button" is the ET slug
  const button = screen.getByRole('button', {name: routePayload.enterpriseSlug})
  expect(button).toBeInTheDocument()

  // Verifies the return link is to the ET page
  const link = screen.getByRole('link', {name: /← Back to enterprise teams/i})
  expect(link).toHaveAttribute('href', `/enterprises/${routePayload.enterpriseSlug}/teams`)

  // Verifies the creation heading is present when creating a new team
  const heading = screen.getByRole('heading', {level: 1})
  expect(heading).toHaveTextContent('Create new enterprise team')

  // Verifies the name change info is present when creating a new team
  const infoMessage = screen.getByText(/You'll use this name to mention this team./i)
  expect(infoMessage).toBeInTheDocument()

  // Verifies the name input is empty when creating a new team
  const input = screen.getByLabelText('Team name')
  expect(input).toHaveValue('')

  // Verifies the IdP selector is rendered
  const idpSelector = screen.queryByTestId('idp-group-select-panel')
  expect(idpSelector).toBeInTheDocument()

  // Verifies the submission button for creating a new team
  const submissionButton = screen.getByRole('button', {name: 'Create team'})
  expect(submissionButton).toBeInTheDocument()
})

test('Does not show IdP selector when creating a new team for a non-EMU business', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enterpriseManaged = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  // Verifies the IdP selector is not rendered
  const idpSelector = screen.queryByTestId('idp-group-select-panel')
  expect(idpSelector).not.toBeInTheDocument()
})

test('Create new team submission triggers request with the correct parameters', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })

  // User name input
  const teamNameInput = screen.getByTestId('team-name-input')
  fireEvent.change(teamNameInput, {target: {value: 'Very Original Team Name'}})

  // Open the IdP group selector to render the options portal
  const idpSelectorPanel = within(screen.getByTestId('idp-group-select-panel'))
  const idpGroupSelector = idpSelectorPanel.getByRole('button', {name: 'Select Groups'})
  fireEvent.click(idpGroupSelector)

  // Click the first option in the portal
  const idpSelectorPortal = screen.getByRole('dialog')
  const idpSelectorOptions = within(idpSelectorPortal).getAllByRole('option')
  expect(idpSelectorOptions[0]).toHaveTextContent(routePayload.idpGroups[0]!.text)
  fireEvent.click(idpSelectorOptions[0]!)

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', 'Very Original Team Name')
  expectedFormData.append('idpGroup', routePayload.idpGroups[0]!.id)
  expect(mockVerifiedFetch).toHaveBeenCalledWith(`/enterprises/${routePayload.enterpriseSlug}/teams`, {
    method: 'POST',
    headers: {Accept: 'application/json'},
    body: expectedFormData,
  })
})

test('New team submission toggles flash errors when the request fails', async () => {
  const errorMessage = 'Some error message'
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })
  mockVerifiedFetch.mockResolvedValue({
    ok: false,
    statusText: 'BAD REQUEST',
    json: async () => {
      return {
        data: {
          error: errorMessage,
        },
      }
    },
  })

  // User name input
  const teamNameInput = screen.getByTestId('team-name-input')
  fireEvent.change(teamNameInput, {target: {value: 'Very Original Team Name'}})

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  // dom is modified by the fire event
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    fireEvent.click(submitBtn)
  })

  expect(screen.getByTestId('flash-error')).toBeInTheDocument()
  expect(screen.getByText(errorMessage)).toBeInTheDocument()
})

test('Renders the EnterpriseTeamManagement for Editing', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  // Verifies the owner "button" is the ET slug
  const button = screen.getByRole('button', {name: routePayload.enterpriseSlug})
  expect(button).toBeInTheDocument()

  // Verifies the return link is to the ET page
  const link = screen.getByRole('link', {name: /← Back to enterprise teams/i})
  expect(link).toHaveAttribute('href', `/enterprises/${routePayload.enterpriseSlug}/teams`)

  // Verifies the heading is "Edit team" when an enterpriseTeam is present
  const heading = screen.getByRole('heading', {level: 1})
  expect(heading).toHaveTextContent('Edit team')

  // Verifies the name change warning is present when an enterpriseTeam is present
  const warningMessage = screen.getByText(/Changing the team name will break past @mentions./i)
  expect(warningMessage).toBeInTheDocument()

  // Verifies the name input is initialized with the enterpriseTeam name in edit mode
  const input = screen.getByLabelText('Team name')
  expect(input).toHaveValue(routePayload.enterpriseTeam?.name)

  // Verifies the idpGroup input is initialized with the enterpriseTeam in edit mode has a group
  const selectedGroup = screen.getByRole('button', {name: routePayload.enterpriseTeam?.idpGroup?.text})
  expect(selectedGroup).toBeInTheDocument()

  // Opens the select panel
  const idpSelectPanel = within(screen.getByTestId('idp-group-select-panel'))
  const idpGroupSelector = idpSelectPanel.getByRole('button')
  fireEvent.click(idpGroupSelector)

  // Check that the correct option is selected
  const idpSelectorPortal = screen.getByRole('dialog')
  const allOptions = within(idpSelectorPortal).getAllByRole('option')
  let foundOption = false
  let unCheckedOption = 0
  for (const option of allOptions) {
    // Check that the aria-selected attribute is set for the selected option
    // And that the other options don't have aria-selected set to true
    if (option.textContent === routePayload.enterpriseTeam?.idpGroup?.text) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(option).toHaveAttribute('aria-selected', 'true')
      foundOption = true
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(option).toHaveAttribute('aria-selected', 'false')
      unCheckedOption++
    }
  }
  expect(foundOption).toBeTruthy()
  expect(unCheckedOption).toEqual(2)

  // Verifies the submission button for editing an existing
  const submissionButton = screen.getByRole('button', {name: 'Save changes'})
  expect(submissionButton).toBeInTheDocument()
})

test('Renders the EnterpriseTeamManagement with no IDP selected prior to Editing', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoIdpMapped()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  // Verifies the owner "button" is the ET slug
  const button = screen.getByRole('button', {name: routePayload.enterpriseSlug})
  expect(button).toBeInTheDocument()

  // Verifies the return link is to the ET page
  const link = screen.getByRole('link', {name: /← Back to enterprise teams/i})
  expect(link).toHaveAttribute('href', `/enterprises/${routePayload.enterpriseSlug}/teams`)

  // Verifies the heading is "Edit team" when an enterpriseTeam is present
  const heading = screen.getByRole('heading', {level: 1})
  expect(heading).toHaveTextContent('Edit team')

  // Verifies the name change warning is present when an enterpriseTeam is present
  const warningMessage = screen.getByText(/Changing the team name will break past @mentions./i)
  expect(warningMessage).toBeInTheDocument()

  // Verifies the name input is initialized with the enterpriseTeam name in edit mode
  const input = screen.getByLabelText('Team name')
  expect(input).toHaveValue(routePayload.enterpriseTeam?.name)

  // Verifies no idpGroup is shown as the visible IDP select menu item
  const selectedGroup = screen.getByRole('button', {name: 'Select Groups'})
  expect(selectedGroup).toBeVisible()

  // Opens the select panel
  const idpSelectPanel = within(screen.getByTestId('idp-group-select-panel'))
  const idpGroupSelector = idpSelectPanel.getByRole('button')
  fireEvent.click(idpGroupSelector)

  // Check no IDP is selected
  const idpSelectorPortal = screen.getByRole('dialog')
  const allOptions = within(idpSelectorPortal).getAllByRole('option')
  let foundOption = false
  let unCheckedOption = 0
  for (const option of allOptions) {
    // Check that the aria-selected attribute is set for the selected option
    // And that the other options don't have aria-selected set to true
    if (option.textContent === routePayload.enterpriseTeam?.idpGroup?.text) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(option).toHaveAttribute('aria-selected', 'true')
      foundOption = true
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(option).toHaveAttribute('aria-selected', 'false')
      unCheckedOption++
    }
  }
  expect(foundOption).toBeFalsy()
  expect(unCheckedOption).toEqual(3)

  // Verifies the submission button for editing an existing
  const submissionButton = screen.getByRole('button', {name: 'Save changes'})
  expect(submissionButton).toBeInTheDocument()
})

test('Does not show IdP selector when editing for a non-EMU business', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enterpriseManaged = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  // Verifies the IdP selector is not rendered
  const idpSelector = screen.queryByTestId('idp-group-select-panel')
  expect(idpSelector).not.toBeInTheDocument()
})

test('Edit team submission triggers request with the correct parameters', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })

  // User name input
  const teamNameInput = screen.getByTestId('team-name-input')
  fireEvent.change(teamNameInput, {target: {value: 'Very Original Team Name'}})

  // Open the IdP group selector to render the options portal
  const idpSelectorPanel = within(screen.getByTestId('idp-group-select-panel'))
  const idpGroupSelector = idpSelectorPanel.getByRole('button', {name: routePayload.enterpriseTeam!.idpGroup?.text})
  fireEvent.click(idpGroupSelector)

  // Click the first option in the portal
  const idpSelectorPortal = screen.getByRole('dialog')
  const idpSelectorOptions = within(idpSelectorPortal).getAllByRole('option')
  expect(idpSelectorOptions[2]).toHaveTextContent(routePayload.idpGroups[2]!.text)
  fireEvent.click(idpSelectorOptions[2]!)

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', 'Very Original Team Name')
  expectedFormData.append('idpGroup', routePayload.idpGroups[2]!.id)
  expect(mockVerifiedFetch).toHaveBeenCalledWith(
    `/enterprises/${routePayload.enterpriseSlug}/teams/${routePayload.enterpriseTeam!.slug}`,
    {
      method: 'PUT',
      headers: {Accept: 'application/json'},
      body: expectedFormData,
    },
  )
})

test('Edit team submission toggles flash errors when the request fails', async () => {
  const errorMessage = 'Some error message'
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })
  mockVerifiedFetch.mockResolvedValue({
    ok: false,
    statusText: 'BAD REQUEST',
    json: async () => {
      return {
        data: {
          error: errorMessage,
        },
      }
    },
  })

  // User name input
  const teamNameInput = screen.getByTestId('team-name-input')
  fireEvent.change(teamNameInput, {target: {value: 'Very Original Team Name'}})

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  // dom is modified by the fire event
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    fireEvent.click(submitBtn)
  })

  expect(screen.getByTestId('flash-error')).toBeInTheDocument()
  expect(screen.getByText(errorMessage)).toBeInTheDocument()
})

/* All of these sync-to-organizations-input tests can be moved to the base tests once we remove the beta / FFs */
test('Edit team submission does not render sync-to-organizations-input and security-manager-input when enabledForOrganizations is false', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()
})

test('Edit team submission does not render sync-to-organizations-input and security-manager-input when enabledForOrganizations is true but not security manager', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()
})

test('Edit team submits only sync organization parameter if security manager disabled', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = false
  routePayload.enterpriseTeam!.syncToOrganizations = true
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  expect(syncToOrganizationsInput).toBeChecked()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', routePayload.enterpriseTeam!.name)
  expectedFormData.append('idpGroup', routePayload.enterpriseTeam!.idpGroup!.id)
  expectedFormData.append('syncToOrganizations', 'true')
  expect(mockVerifiedFetch).toHaveBeenCalledWith(
    `/enterprises/${routePayload.enterpriseSlug}/teams/${routePayload.enterpriseTeam!.slug}`,
    {
      method: 'PUT',
      headers: {Accept: 'application/json'},
      body: expectedFormData,
    },
  )
})

test('Edit team submission renders sync-to-organizations-input when enabledForOrganizations/securityManager are true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.enterpriseTeam!.syncToOrganizations = true
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  expect(syncToOrganizationsInput).toBeChecked()
  const securityManagerInput = screen.getByTestId('security-manager-input')
  expect(securityManagerInput).toBeInTheDocument()
  expect(securityManagerInput).not.toBeChecked()
  expect(securityManagerInput).not.toBeDisabled()

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', routePayload.enterpriseTeam!.name)
  expectedFormData.append('idpGroup', routePayload.enterpriseTeam!.idpGroup!.id)
  expectedFormData.append('syncToOrganizations', 'true')
  expectedFormData.append('isSecurityManager', 'false')
  expect(mockVerifiedFetch).toHaveBeenCalledWith(
    `/enterprises/${routePayload.enterpriseSlug}/teams/${routePayload.enterpriseTeam!.slug}`,
    {
      method: 'PUT',
      headers: {Accept: 'application/json'},
      body: expectedFormData,
    },
  )
})

test('Edit team submission renders sync-to-organizations-input when enabledForOrganizations is true and sync with ESM is enabled', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.enterpriseTeam!.syncToOrganizations = true
  routePayload.enterpriseTeam!.isSecurityManager = true
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  expect(syncToOrganizationsInput).toBeChecked()
  const securityManagerInput = screen.getByTestId('security-manager-input')
  expect(securityManagerInput).toBeInTheDocument()
  expect(securityManagerInput).toBeChecked()
  expect(securityManagerInput).not.toBeDisabled()

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', routePayload.enterpriseTeam!.name)
  expectedFormData.append('idpGroup', routePayload.enterpriseTeam!.idpGroup!.id)
  expectedFormData.append('syncToOrganizations', 'true')
  expectedFormData.append('isSecurityManager', 'true')
  expect(mockVerifiedFetch).toHaveBeenCalledWith(
    `/enterprises/${routePayload.enterpriseSlug}/teams/${routePayload.enterpriseTeam!.slug}`,
    {
      method: 'PUT',
      headers: {Accept: 'application/json'},
      body: expectedFormData,
    },
  )
})

test('Edit team submission renders sync-to-organizations-input when enabledForOrganizations is true and sync is disabled', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.enterpriseTeam!.syncToOrganizations = false
  mockVerifiedFetch.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return {
        data: {
          redirect_url: `/enterprises/${routePayload.enterpriseSlug}/teams/very-original-team-name`,
        },
      }
    },
  })
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  expect(syncToOrganizationsInput).not.toBeChecked()
  const securityManagerInput = screen.getByTestId('security-manager-input')
  expect(securityManagerInput).toBeInTheDocument()
  expect(securityManagerInput).not.toBeChecked()
  expect(securityManagerInput).toBeDisabled()

  // Submit form
  const submitBtn = screen.getByTestId('submit-button')
  fireEvent.click(submitBtn)

  const expectedFormData = new FormData()
  expectedFormData.append('teamName', routePayload.enterpriseTeam!.name)
  expectedFormData.append('idpGroup', routePayload.enterpriseTeam!.idpGroup!.id)
  expectedFormData.append('syncToOrganizations', 'false')
  expectedFormData.append('isSecurityManager', 'false')
  expect(mockVerifiedFetch).toHaveBeenCalledWith(
    `/enterprises/${routePayload.enterpriseSlug}/teams/${routePayload.enterpriseTeam!.slug}`,
    {
      method: 'PUT',
      headers: {Accept: 'application/json'},
      body: expectedFormData,
    },
  )
})

test('New team does not render sync-to-organizations-input when enabledForOrganizations is false', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enabledForOrganizations = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()
})

test('New team does not render security-manager-input when enabledForOrganizations is false', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enabledForOrganizations = false
  routePayload.enabledForOrganizationSecurityManager = true
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()
})

test('New team only renders sync-to-organizations-input when enabledForOrganizations is true but not securityManager', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = false
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeInTheDocument()
})

test('New team renders sync-to-organizations-input and security-manager-input when enabledForOrganizations/securityManager are true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.showEnterpriseSecurityManagerAssignmentPage = false
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  render(<EnterpriseTeamManagement />, {
    routePayload,
  })

  const syncToOrganizationsInput = screen.queryByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeInTheDocument()
  const securityManagerInput = screen.queryByTestId('security-manager-input')
  expect(securityManagerInput).toBeInTheDocument()
})

test('New team does not render sync-to-organizations-input nor security-manager-input when showEnterpriseSecurityManagerAssignmentPage is true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.showEnterpriseSecurityManagerAssignmentPage = true
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true

  render(<EnterpriseTeamManagement />, {routePayload})

  expect(screen.queryByTestId('sync-to-organizations-input')).not.toBeInTheDocument()
  expect(screen.queryByTestId('security-manager-input')).not.toBeInTheDocument()
})

test('New team enables sync-to-organizations-input when canSyncToOrganizations is true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
})

test('Existing team enables sync-to-organizations-input when canSyncToOrganizations is true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
})

test('Existing team disables sync-to-organizations-input when canSyncToOrganizations is false', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = false

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeDisabled()
})

test('Existing team hides sync-to-organizations-input and security-manager-input when showEnterpriseSecurityManagerAssignmentPage is true', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.showEnterpriseSecurityManagerAssignmentPage = true
  routePayload.enterpriseTeam!.isSecurityManager = true

  render(<EnterpriseTeamManagement />, {routePayload})

  expect(screen.queryByTestId('sync-to-organizations-input')).not.toBeInTheDocument()
  expect(screen.queryByTestId('security-manager-input')).not.toBeInTheDocument()
})

test('New team enables sync-to-organizations-input when maxSyncMembers is 5', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true
  routePayload.maxSyncMembers = 5

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
})

test('Existing team enables sync-to-organizations-input when maxSyncMembers is higher than members', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
})

test('Existing team disables sync-to-organizations-input when maxSyncMembers is less than member count', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true
  routePayload.maxSyncMembers = 2

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).toBeDisabled()
})

test('IdP group selection of over maxSyncMembers toggles sync-to-organizations-input', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoIdpMapped()
  routePayload.enabledForOrganizations = true
  routePayload.canSyncToOrganizations = true
  routePayload.maxSyncMembers = 2

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()

  // Open the IdP group selector to render the options portal
  const idpSelectorPanel = within(screen.getByTestId('idp-group-select-panel'))
  const idpGroupSelector = idpSelectorPanel.getByRole('button', {name: 'Select Groups'})
  fireEvent.click(idpGroupSelector)

  // Click the first option in the portal
  const idpSelectorPortal = screen.getByRole('dialog')
  const idpSelectorOptions = within(idpSelectorPortal).getAllByRole('option')
  expect(idpSelectorOptions[0]).toHaveTextContent(routePayload.idpGroups[0]!.text)
  fireEvent.click(idpSelectorOptions[0]!)

  expect(syncToOrganizationsInput).toBeDisabled()
})

test('Unchecks and disables security-manager-input when sync-to-organizations-input is unchecked', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enterpriseTeam!.syncToOrganizations = true
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.enterpriseTeam!.isSecurityManager = true

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
  expect(syncToOrganizationsInput).toBeChecked()

  const securityManagerInput = screen.getByTestId('security-manager-input')
  expect(securityManagerInput).not.toBeDisabled()
  expect(securityManagerInput).toBeChecked()

  fireEvent.click(syncToOrganizationsInput)

  expect(syncToOrganizationsInput).not.toBeDisabled()
  expect(syncToOrganizationsInput).not.toBeChecked()

  expect(securityManagerInput).toBeDisabled()
  expect(securityManagerInput).not.toBeChecked()
})

test('Enables security-manager-input when sync-to-organizations-input is checked', () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()
  routePayload.enabledForOrganizations = true
  routePayload.enterpriseTeam!.syncToOrganizations = false
  routePayload.enabledForOrganizationSecurityManager = true
  routePayload.enterpriseTeam!.isSecurityManager = false

  render(<EnterpriseTeamManagement />, {routePayload})

  const syncToOrganizationsInput = screen.getByTestId('sync-to-organizations-input')
  expect(syncToOrganizationsInput).not.toBeDisabled()
  expect(syncToOrganizationsInput).not.toBeChecked()

  const securityManagerInput = screen.getByTestId('security-manager-input')
  expect(securityManagerInput).toBeDisabled()
  expect(securityManagerInput).not.toBeChecked()

  fireEvent.click(syncToOrganizationsInput)

  expect(syncToOrganizationsInput).not.toBeDisabled()
  expect(syncToOrganizationsInput).toBeChecked()

  expect(securityManagerInput).not.toBeDisabled()
  expect(securityManagerInput).not.toBeChecked()
})
