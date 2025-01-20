import type React from 'react'
import {useState} from 'react'
import {
  type ConfigurationPolicy,
  type Repository,
  SecurityConfigurationStatus,
  SecurityProductAvailability,
  type OrganizationLicensePayload,
  type OrganizationSettingsSecurityProductsPayload,
} from '../security-products-enablement-types'
import {DialogContext} from '../contexts/DialogContext'
import {RepositoryContext} from '../contexts/RepositoryContext'
import type {SecuritySettingsContextValue} from '../contexts/SecuritySettingsContext'
import {SelectedRepositoryContext} from '../contexts/SelectedRepositoryContext'
import App from '../App'
import RepositoryTable from '../components/RepositoryTable'
import RepositorySection from '../components/RepositorySection'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'
import {DEFAULT_SECURITY_CONFIGURATION_STATE} from '../utils/helpers'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

const defaultRoutePayload = getOrganizationSettingsSecurityProductsRoutePayload()

interface DialogSelectedRepositoryWrapperProps {
  totalRepositoryCount?: number
  children: React.ReactNode
}

function useDefaultStates() {
  const [configurationPolicy, setConfigurationPolicy] = useState<ConfigurationPolicy>({
    defaultForNewPublicRepos: false,
    defaultForNewPrivateRepos: false,
    enforcement: 'enforced',
  })

  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: 1,
      name: 'public-repository',
      visibility: 'public',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: {
        repository_security_configuration_id: 10,
        name: 'repos config',
        status: SecurityConfigurationStatus.Attaching,
        is_github_recommended_configuration: false,
      },
      security_features_enabled: true,
    },
    {
      id: 2,
      name: 'private-repository',
      visibility: 'private',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: {
        repository_security_configuration_id: 11,
        name: 'repos config 2',
        status: SecurityConfigurationStatus.Attached,
        is_github_recommended_configuration: false,
      },
      security_features_enabled: true,
    },
    {
      id: 3,
      name: 'private-repository-detached',
      visibility: 'private',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: {
        repository_security_configuration_id: 11,
        name: 'repos config 2',
        status: SecurityConfigurationStatus.Removed,
        is_github_recommended_configuration: false,
      },
      security_features_enabled: true,
    },
    {
      id: 4,
      name: 'no-features-repository',
      visibility: 'private',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: undefined,
      security_features_enabled: false,
    },
    {
      id: 5,
      name: 'custom-features-repository',
      visibility: 'private',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: undefined,
      security_features_enabled: true,
    },
    {
      id: 6,
      name: 'another-custom-repository',
      visibility: 'private',
      pushed_at: '2021-01-01T00:00:00Z',
      licenses_required: 0,
      security_configuration: {
        repository_security_configuration_id: 11,
        name: 'repos config 2',
        status: SecurityConfigurationStatus.Failed,
        failure_reason: 'Code scanning default setup can only be enabled if advanced setup is disabled.',
        is_github_recommended_configuration: false,
      },
      security_features_enabled: true,
    },
  ])
  const [repositoryIds, setRepositoryIds] = useState<number[]>([])

  const [totalRepositoryCount, setTotalRepositoryCount] = useState<number>(11)

  const [selectedReposCount, setSelectedReposCount] = useState<number>(0)
  const [selectedReposMap, setSelectedRepos] = useState<Record<number, Repository>>({})

  const {licenses: initialLicenses} = useRoutePayload<OrganizationSettingsSecurityProductsPayload>()
  const [licenses, setLicenses] = useState<OrganizationLicensePayload>(initialLicenses)

  return {
    configurationPolicy,
    setConfigurationPolicy,
    repositories,
    setRepositories,
    repositoryIds,
    setRepositoryIds,
    selectedReposCount,
    setSelectedReposCount,
    totalRepositoryCount,
    setTotalRepositoryCount,
    selectedReposMap,
    setSelectedRepos,
    licenses,
    setLicenses,
  }
}

export function securitySettingsContextValue(
  options?: Partial<SecuritySettingsContextValue>,
): SecuritySettingsContextValue {
  return {
    ...DEFAULT_SECURITY_CONFIGURATION_STATE,
    featureFlags: {
      secretScanningValidityChecks: true,
      secretScanningNonProviderPatterns: true,
    },
    handleSettingChange: options?.handleSettingChange || jest.fn(),
    handleGhasSettingChange: jest.fn(),
    renderInlineValidation: jest.fn(),
    isAvailable: jest.fn(availability => availability === SecurityProductAvailability.Available),
  }
}

export function dialogWrapper({children}: React.PropsWithChildren<unknown>) {
  return (
    // eslint-disable-next-line react-hooks/rules-of-hooks
    <DialogContext.Provider value={useDefaultStates()}>{children}</DialogContext.Provider>
  )
}

export function dialogRepositoryWrapper({totalRepositoryCount = 11, children}: DialogSelectedRepositoryWrapperProps) {
  return (
    // eslint-disable-next-line react-hooks/rules-of-hooks
    <DialogContext.Provider value={useDefaultStates()}>
      {repoContextWrapper({children}, totalRepositoryCount)}
    </DialogContext.Provider>
  )
}

export function selectedRepositoryWrapper({children}: React.PropsWithChildren<unknown>) {
  const el = (
    // eslint-disable-next-line react-hooks/rules-of-hooks
    <SelectedRepositoryContext.Provider value={useDefaultStates()}>{children}</SelectedRepositoryContext.Provider>
  )
  return repoContextWrapper({children: el})
}

export function repoContextWrapper({children}: React.PropsWithChildren<unknown>, customRepoCount: number = 11) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = {...useDefaultStates(), totalRepositoryCount: customRepoCount}
  return <RepositoryContext.Provider value={values}>{children}</RepositoryContext.Provider>
}

// Accept props so they can be changed for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function customRepositoryTable(options?: any) {
  const routePayload = options?.routePayload || defaultRoutePayload

  const props = {
    setChangesInProgress: jest.fn(),
    githubRecommendedConfiguration: routePayload.githubRecommendedConfiguration,
    customSecurityConfigurations: routePayload.customSecurityConfigurations,
    filterQuery: '',
    searchResultsLimitExceeded: false,
    isQueryLoading: false,
    pageCount: routePayload.pageCount,
    totalRepositoryCount: 11,
    ...options,
  }

  return (
    <App>
      <RepositoryTable {...props} />
    </App>
  )
}

// Accept props so they can be changed for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function customRepositorySection(options?: any) {
  const routePayload = options?.routePayload || defaultRoutePayload

  const props = {
    setChangesInProgress: jest.fn(),
    repositories: routePayload.repositories,
    customSecurityConfigurations: routePayload.customSecurityConfigurations,
    organization: routePayload.organization,
    githubRecommendedConfiguration: routePayload.githubRecommendedConfiguration,
    failureCounts: routePayload.failureCounts,
    ...options,
  }

  return (
    <App>
      <RepositorySection {...props} />
    </App>
  )
}
