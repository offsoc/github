import {screen, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {
  defaultAppContext,
  editSecurityConfigurationsRoutePayload,
  getSecurityConfigurationsRoutePayload,
} from '../../test-utils/mock-data'
import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import FooterSection from '../../components/SecurityConfiguration/FooterSection'
import {SettingValue} from '../../security-products-enablement-types'
import App from '../../App'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  const actual = jest.requireActual('@github-ui/use-navigate')
  return {
    ...actual,
    useNavigate: () => navigateFn,
  }
})
jest.useFakeTimers()

beforeEach(navigateFn.mockClear)

const payload = getSecurityConfigurationsRoutePayload()

const editPayload = editSecurityConfigurationsRoutePayload({
  defaultForNewPublicRepos: true,
  defaultForNewPrivateRepos: false,
})

const securityConfigurationSettings = {
  enableGHAS: true,
  dependencyGraph: SettingValue.Enabled,
  dependencyGraphAutosubmitAction: SettingValue.NotSet,
  dependencyGraphAutosubmitActionOptions: {},
  dependabotAlerts: SettingValue.Enabled,
  dependabotAlertsVEA: SettingValue.Enabled,
  dependabotSecurityUpdates: SettingValue.NotSet,
  codeScanning: SettingValue.Enabled,
  secretScanning: SettingValue.Enabled,
  secretScanningValidityChecks: SettingValue.Enabled,
  secretScanningPushProtection: SettingValue.Enabled,
  secretScanningNonProviderPatterns: SettingValue.Enabled,
  privateVulnerabilityReporting: SettingValue.Enabled,
}

const configurationPolicy = {
  defaultForNewPublicRepos: false,
  defaultForNewPrivateRepos: false,
  enforcement: 'not_enforced',
}

const mockUpdateErrors = jest.fn()
const mockClearState = jest.fn()
const mockSetFlashMessage = jest.fn()

const newRepoDefaults = {
  newPublicRepoDefaultConfig: null,
  newPrivateRepoDefaultConfig: null,
}

const configurationNameRef = document.createElement('input')

const configurationDescription = document.createElement('input')

describe('SecurityConfigurationFooterSection', () => {
  it('renders save and cancel for new config', () => {
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    render(
      <App>
        <FooterSection
          isNew={true}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )
    expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
  })

  it('renders update, cancel, and delete for existing config', () => {
    configurationNameRef.value = editPayload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = editPayload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={editPayload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    expect(screen.getByRole('button', {name: 'Update configuration'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Delete configuration'})).toBeInTheDocument()
  })

  it('renders ghas message when ghas is included in config', () => {
    configurationNameRef.value = payload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = payload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )
    expect(screen.getByTestId('info-text')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This configuration counts towards your GitHub Advanced Security license usage on private and internal repositories.',
      ),
    ).toBeInTheDocument()
  })

  it('renders ghas message for ghes', () => {
    configurationNameRef.value = payload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = payload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const routePayload = defaultAppContext()
    routePayload.capabilities.ghasFreeForPublicRepos = false
    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload},
    )
    expect(
      screen.getByText('This configuration counts towards your GitHub Advanced Security license usage.'),
    ).toBeInTheDocument()
  })

  it("renders ghas message when org hasn't purchased GHAS but can use GHAS on public repos", () => {
    configurationNameRef.value = payload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = payload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const routePayload = defaultAppContext()
    routePayload.capabilities.ghasFreeForPublicRepos = true
    routePayload.capabilities.ghasPurchased = false

    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload},
    )
    expect(screen.getByTestId('info-text')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This configuration enables GitHub Advanced Security features. Applying it to private repositories will only enable free security features.',
      ),
    ).toBeInTheDocument()
  })

  it("does not render GHAS message in a non-GHAS org but can use GHAS on public repos and isn't using a GHAS feature", () => {
    configurationNameRef.value = payload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = payload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const settings = {
      ...securityConfigurationSettings,
      dependabotAlertsVEA: SettingValue.Disabled,
      codeScanning: SettingValue.Disabled,
      secretScanning: SettingValue.Disabled,
      enableGHAS: false,
    }

    const routePayload = defaultAppContext()
    routePayload.capabilities.ghasFreeForPublicRepos = true
    routePayload.capabilities.ghasPurchased = false

    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={settings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload},
    )

    expect(screen.queryByTestId('info-text')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'This configuration enables GitHub Advanced Security features. Applying it to private repositories will only enable free security features.',
      ),
    ).not.toBeInTheDocument()
  })

  it("does not render ghas message when org can't use GHAS", () => {
    configurationNameRef.value = payload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = payload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const routePayload = defaultAppContext()
    routePayload.capabilities.ghasFreeForPublicRepos = false
    routePayload.capabilities.ghasPurchased = false

    render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={payload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload},
    )

    expect(screen.queryByTestId('info-text')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'This configuration counts towards your GitHub Advanced Security license usage on private and internal repositories.',
      ),
    ).not.toBeInTheDocument()
  })

  it('calls save function when update button is clicked', async () => {
    configurationNameRef.value = editPayload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = editPayload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const {user} = render(
      <App>
        {' '}
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={editPayload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    // Click the "Update configuration" button
    const saveButton = screen.getByRole('button', {name: 'Update configuration'})
    await user.click(saveButton)

    await waitFor(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the dialog to appear
    const updateConfigDialog = await screen.findByRole('dialog')

    // Assert that the dialog content is correct
    await waitFor(() => {
      expect(updateConfigDialog).toHaveTextContent(/This will update 1 repository using this configuration./)
    })

    // Click the "Update configuration" button in the dialog
    const updateButton = within(updateConfigDialog).getByRole('button', {name: 'Update configuration'})
    await user.click(updateButton)

    await waitFor(
      () => {
        expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations/1', {
          security_configuration: {
            name: 'High Risk',
            description: 'Use for critical repos',
            enable_ghas: true,
            dependency_graph: 'enabled',
            dependabot_alerts: 'enabled',
            dependabot_security_updates: 'not_set',
            code_scanning: 'enabled',
            secret_scanning: 'enabled',
            secret_scanning_push_protection: 'enabled',
            secret_scanning_validity_checks: 'enabled',
            private_vulnerability_reporting: 'enabled',
          },
          default_for_new_public_repos: false,
          default_for_new_private_repos: false,
          enforcement: 'not_enforced',
        })
      },
      {timeout: 2000},
    )
  })

  it('calls destroy function when delete button is clicked', async () => {
    configurationNameRef.value = editPayload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = editPayload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const {user} = render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={editPayload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    await user.click(screen.getByRole('button', {name: 'Delete configuration'}))

    await waitFor(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the pop-up to appear
    await screen.findByRole('dialog')

    const deleteConfigDialog = screen.getByRole('dialog')

    await waitFor(() => {
      expect(deleteConfigDialog).toHaveTextContent(
        /Deleting High Risk configuration will remove it from 1 repository and as the default for newly created public repositories. This will not change existing repository settings. This action is permanent and cannot be reversed.CancelDelete configuration/,
      )
    })

    // Click the "Delete configuration" button in the pop-up
    await user.click(within(deleteConfigDialog).getByRole('button', {name: 'Delete configuration'}))

    await waitFor(() => {
      expectMockFetchCalledTimes('/organizations/github/settings/security_products/configurations/1', 1)
    })
  })

  it('clicking cancel button calls navigates', async () => {
    configurationNameRef.value = editPayload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = editPayload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    const {user} = render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={editPayload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={configurationPolicy}
          newRepoDefaults={newRepoDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    await user.click(screen.getByRole('button', {name: 'Cancel'}))

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('renders update dialog message when update button is clicked', async () => {
    configurationNameRef.value = editPayload.securityConfiguration?.name ?? ''
    const name: React.RefObject<HTMLInputElement> = {current: configurationNameRef}

    configurationDescription.value = editPayload.securityConfiguration?.description ?? ''
    const description: React.RefObject<HTMLInputElement> = {current: configurationDescription}

    // Mock the existing default configuration to simulate replacement
    const existingDefaults = {
      newPublicRepoDefaultConfig: {id: 1, name: 'Medium Risk'},
      newPrivateRepoDefaultConfig: {id: 2, name: 'Low Risk'},
    }

    const newConfigurationPolicy = {
      defaultForNewPublicRepos: false,
      defaultForNewPrivateRepos: true,
      enforcement: 'not_enforced',
    }

    const {user} = render(
      <App>
        <FooterSection
          isNew={false}
          isShow={false}
          securityConfigurationSettings={securityConfigurationSettings}
          securityConfiguration={editPayload.securityConfiguration}
          configurationName={name}
          configurationDescription={description}
          configurationPolicy={newConfigurationPolicy}
          newRepoDefaults={existingDefaults}
          tip={''}
          updateErrors={mockUpdateErrors}
          clearState={mockClearState}
          setFlashMessage={mockSetFlashMessage}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    // Click the "Update configuration" button
    const saveButton = screen.getByRole('button', {name: 'Update configuration'})
    await user.click(saveButton)

    await waitFor(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the dialog to appear
    const updateConfigDialog = await screen.findByRole('dialog')

    //Assert that the dialog header is correct
    await waitFor(() => {
      expect(updateConfigDialog).toHaveTextContent('Update High Risk?')
    })

    // Assert that the dialog content is correct
    await waitFor(() => {
      expect(updateConfigDialog).toHaveTextContent(
        /This will update 1 repository using this configuration and replace Low Risk as the default configuration for newly created private\/internal repositories\./i,
      )
    })
  })
})
