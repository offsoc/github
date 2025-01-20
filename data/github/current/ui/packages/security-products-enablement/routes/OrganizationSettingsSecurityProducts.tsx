import {useState, useMemo, useCallback} from 'react'
import {orgOnboardingAdvancedSecurityPath} from '@github-ui/paths'
import {OnboardingTipBanner} from '@github-ui/onboarding-tip-banner'
import {ShieldCheckIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import {useAlive} from '@github-ui/use-alive'
import {useDebounce} from '@github-ui/use-debounce'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useAppContext} from '../contexts/AppContext'
import {RepositoryContext} from '../contexts/RepositoryContext'
import {fetchRefresh} from '../utils/api-helpers'
import {dismissNoticePath} from '../utils/banner-helper'
import RepositorySection from '../components/RepositorySection'
import Subhead from '../components/Subhead'
import Banner from '../components/Banner'
import BlankSlate from '../components/BlankSlate'
import SecurityConfigurationTable from '../components/SecurityConfiguration/Table'
import {
  type OrganizationSecurityConfiguration,
  type OrganizationSettingsSecurityProductsPayload,
  type FailureCounts,
  SecurityProductAvailability,
  type Repository,
  type OrganizationLicensePayload,
} from '../security-products-enablement-types'

const OrganizationSettingsSecurityProducts: React.FC = () => {
  const {securityProducts, organization, docsUrls} = useAppContext()
  const [searchParams] = useSearchParams()
  const {
    githubRecommendedConfiguration: initialGithubRecommendedConfiguration,
    customSecurityConfigurations: initialCustomSecurityConfigurations,
    showInfoBanner: initialShowInfoBanner,
    changesInProgress: changes,
    repositories: initialRepositories,
    channel,
    failureCounts: initialFailureCounts,
    licenses: initialLicenses,
  } = useRoutePayload<OrganizationSettingsSecurityProductsPayload>()

  const [changesInProgress, setChangesInProgress] = useState(changes)
  const [repositories, setRepositories] = useState<Repository[]>(initialRepositories)
  const [repositoryIds, setRepositoryIds] = useState(repositories.map(({id}) => id))
  const [totalRepositoryCount, setTotalRepositoryCount] = useState(initialRepositories.length)
  const [showInfoBanner, setShowInfoBanner] = useState(initialShowInfoBanner)
  const [githubRecommendedConfiguration, setGithubRecommendedConfiguration] = useState<
    OrganizationSecurityConfiguration | undefined
  >(initialGithubRecommendedConfiguration)
  const [customSecurityConfigurations, setCustomSecurityConfigurations] = useState<OrganizationSecurityConfiguration[]>(
    initialCustomSecurityConfigurations,
  )
  const [failureCounts, setFailureCounts] = useState<FailureCounts>(initialFailureCounts)
  const [hideFailureCounts, setHideFailureCounts] = useState<boolean>(false)

  const [licenses, setLicenses] = useState<OrganizationLicensePayload>(initialLicenses)

  const repositoryContextValue = useMemo(
    () => ({
      repositories,
      setRepositories,
      repositoryIds,
      setRepositoryIds,
      totalRepositoryCount,
      setTotalRepositoryCount,
      licenses,
      setLicenses,
    }),
    [repositoryIds, repositories, totalRepositoryCount, licenses, setLicenses],
  )

  const allSecurityProductsUnavailable = Object.values(securityProducts).every(
    product => product.availability === SecurityProductAvailability.Unavailable,
  )

  const configurationsAbsent = !githubRecommendedConfiguration && customSecurityConfigurations.length === 0

  // Constants for URLs and Texts
  const NO_SECURITY_PRODUCTS_HEADER = 'No security features installed'
  const NO_SECURITY_PRODUCTS_MESSAGE = 'Your GitHub Enterprise instance does not have any security features installed. '
  const NO_SECURITY_PRODUCTS_LINK_TEXT = 'Learn about installing security features on GitHub Enterprise'

  const NO_CODE_CONFIGURATIONS_HEADER = 'Protect your code with code security configurations'
  const NO_CODE_CONFIGURATIONS_MESSAGE =
    'Enable and disable security features for specific repositories, ensure compliance, and manage your GitHub Advanced Security licenses with '
  const NO_CODE_CONFIGURATIONS_LINK_TEXT = 'code security configurations'

  // Determine the BlankSlate Content
  const blankSlateProps = allSecurityProductsUnavailable
    ? {
        header: NO_SECURITY_PRODUCTS_HEADER,
        message: NO_SECURITY_PRODUCTS_MESSAGE,
        url: docsUrls.createConfig,
        linkText: NO_SECURITY_PRODUCTS_LINK_TEXT,
        displayButton: false,
      }
    : configurationsAbsent
      ? {
          header: NO_CODE_CONFIGURATIONS_HEADER,
          message: NO_CODE_CONFIGURATIONS_MESSAGE,
          url: docsUrls.createConfig,
          linkText: NO_CODE_CONFIGURATIONS_LINK_TEXT,
          displayButton: true,
        }
      : null

  const debouncedRefresh = useDebounce(
    useCallback(async () => {
      const result = await fetchRefresh(organization, repositoryIds)

      // Update the configurations if the fetch was successful
      if (result) {
        const updatedGithubRecommendedConfiguration = result.githubRecommendedConfiguration as
          | OrganizationSecurityConfiguration
          | undefined
        const updatedSecurityConfigurations = result.customSecurityConfigurations

        // Update the repositories_count for GitHub recommended configuration
        if (updatedGithubRecommendedConfiguration) {
          setGithubRecommendedConfiguration(prevConfig => {
            if (prevConfig && updatedGithubRecommendedConfiguration) {
              return {
                ...prevConfig,
                repositories_count: updatedGithubRecommendedConfiguration.repositories_count,
              }
            }
          })
        }

        // Update the custom security configurations:
        if (updatedSecurityConfigurations) setCustomSecurityConfigurations(updatedSecurityConfigurations)

        // This needs to specifically check for undefined because we want to update the state if result.inProgress is true or false
        if (result.inProgress !== undefined) setChangesInProgress({inProgress: result.inProgress, type: result.type})

        if (result.repositories) {
          setRepositories(prevRepositories => {
            const updatedRepositories = [...prevRepositories]

            for (const updatedRepo of result.repositories) {
              const index = updatedRepositories.findIndex(repo => repo.id === updatedRepo.id)
              if (index !== -1) {
                updatedRepositories[index] = {...updatedRepositories[index], ...updatedRepo}
              } else {
                updatedRepositories.push(updatedRepo)
              }
            }

            return updatedRepositories
          })
        }

        if (result.failureCounts) setFailureCounts(result.failureCounts)

        if (result.totalRepositoryCount) setTotalRepositoryCount(result.totalRepositoryCount)

        if (result.licenses?.failedToFetchLicenses !== undefined && !result.licenses.failedToFetchLicenses) {
          setLicenses(result.licenses)
        }
      }
    }, [organization, repositoryIds, setLicenses]),
    1500,
    {leading: true, trailing: true},
  )

  const handleAliveEvent = useCallback(() => {
    debouncedRefresh()
  }, [debouncedRefresh])

  useAlive(channel!, handleAliveEvent)

  const inProgressText =
    changesInProgress.type === 'enablement_changes'
      ? `Another enablement event is in progress. This may take a while and applying or editing configurations \
  will be unavailable until all repositories have been updated.`
      : 'Applying configurations to repositories. This may take a while and applying or editing configurations\
  will be unavailable until all repositories have been updated.'

  const infoBannerText =
    'This organization does not have GitHub Advanced Security, which is free for public repositories and \
    billed per active committer for private and internal repositories. To apply configurations with GitHub \
    Advanced Security features to private repositories, '
  const infoBannerLinkText = 'upgrade to GitHub Advanced Security.'

  const handleDismiss = async () => {
    const result = await verifiedFetch(dismissNoticePath({notice: 'security_configurations_non_ghas_org_info'}), {
      method: 'POST',
    })

    if (result.ok) setShowInfoBanner(false)
  }

  return (
    <>
      <Subhead description="Define and apply security configurations to make sure your repositories are protected.">
        Code security configurations
      </Subhead>
      {blankSlateProps ? (
        <BlankSlate {...blankSlateProps} />
      ) : (
        <>
          {showInfoBanner && (
            <Banner
              bannerText={infoBannerText}
              linkText={infoBannerLinkText}
              linkHref={docsUrls.ghasTrial}
              onDismiss={handleDismiss}
              dismissible={true}
              bannerType="info"
            />
          )}
          {changesInProgress.inProgress && <Banner bannerText={inProgressText} bannerType="inprogress" />}
          {searchParams.get('tip') === 'recommended_settings' && (
            <OnboardingTipBanner
              link={orgOnboardingAdvancedSecurityPath({org: organization})}
              icon={ShieldCheckIcon}
              linkText="Back to onboarding"
              heading="Enable Advanced Security with GitHub recommended configuration"
            >
              Automatically apply our standard settings to Dependabot, code scanning, and secret scanning by selecting{' '}
              <strong> Apply to</strong> below.
            </OnboardingTipBanner>
          )}
          <SecurityConfigurationTable
            githubRecommendedConfiguration={githubRecommendedConfiguration}
            customSecurityConfigurations={customSecurityConfigurations}
          />
          <RepositoryContext.Provider value={repositoryContextValue}>
            <RepositorySection
              repositories={repositories}
              setChangesInProgress={setChangesInProgress}
              githubRecommendedConfiguration={githubRecommendedConfiguration}
              customSecurityConfigurations={customSecurityConfigurations}
              failureCounts={failureCounts}
              hideFailureCounts={hideFailureCounts}
              setHideFailureCounts={setHideFailureCounts}
            />
          </RepositoryContext.Provider>
        </>
      )}
    </>
  )
}

export default OrganizationSettingsSecurityProducts
