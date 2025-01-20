import type {DialogButtonProps} from '@primer/react/experimental'
import {
  RequestStatus,
  type ConfigurationConfirmationSummary,
  type DialogContextValue,
  type OrganizationSecurityConfiguration,
  type PendingConfigurationChanges,
} from '../security-products-enablement-types'
import {
  settingsOrgSecurityProductsRepositoriesApplyPath,
  settingsOrgSecurityProductsPath,
  settingsOrgSecurityProductsRepositoriesConfigurationSummaryPath,
} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export type DialogButtonOptions = {
  cancelOnClick?: () => void
  confirmOnClick: () => void
  confirmContent: string
  confirmButtonType?: 'primary' | 'normal' | 'default' | 'danger' | undefined
}

export const createDialogFooterButtons = ({
  cancelOnClick,
  confirmOnClick,
  confirmContent,
  confirmButtonType = 'primary',
}: DialogButtonOptions): DialogButtonProps[] =>
  cancelOnClick
    ? [
        {
          buttonType: 'normal',
          content: 'Cancel',
          onClick: cancelOnClick,
        },
        {
          buttonType: confirmButtonType,
          content: confirmContent,
          onClick: confirmOnClick,
        },
      ]
    : [
        {
          buttonType: confirmButtonType,
          content: confirmContent,
          onClick: confirmOnClick,
        },
      ]

export const dialogSize = {width: '480px'}

export const applyConfiguration = async (
  pendingConfigurationChanges: PendingConfigurationChanges,
  organization: string,
  navigate: (path: string) => void,
  source: string,
  selectedRepoIds?: number[],
  setNewRepoDefaults?: boolean,
  dialogContextValue?: DialogContextValue,
  returnTo?: string,
) => {
  if (!pendingConfigurationChanges) return false

  const {config, overrideExistingConfig, applyToAll, repositoryFilterQuery} = pendingConfigurationChanges
  const request_payload = {
    repository_ids: selectedRepoIds,
    repository_query: repositoryFilterQuery,
    override_existing_config: overrideExistingConfig,
    default_for_new_public_repos: <boolean | undefined>undefined,
    default_for_new_private_repos: <boolean | undefined>undefined,
    source,
  }

  if (setNewRepoDefaults && dialogContextValue) {
    const {
      defaultForNewPublicRepos: default_for_new_public_repos,
      defaultForNewPrivateRepos: default_for_new_private_repos,
    } = dialogContextValue.configurationPolicy

    request_payload.default_for_new_public_repos = default_for_new_public_repos
    request_payload.default_for_new_private_repos = default_for_new_private_repos

    dialogContextValue.setConfigurationPolicy({
      defaultForNewPublicRepos: false,
      defaultForNewPrivateRepos: false,
    })
  }

  // If applyToAll argument is present, we are applying config to all repos in the organization
  // thus, we need to clear the repository_ids array
  if (applyToAll === true) {
    request_payload['repository_ids'] = []
  }

  const result = await verifiedFetchJSON(
    settingsOrgSecurityProductsRepositoriesApplyPath({
      org: organization,
      id: config.id,
    }),
    {
      method: 'PUT',
      body: request_payload,
    },
  )

  if (result.ok) {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(settingsOrgSecurityProductsPath({org: organization}))
    }
  }

  return result
}

export const confirmationSummary = async (
  setConfirmationDialogSummary: (value: React.SetStateAction<ConfigurationConfirmationSummary | null>) => void,
  organization: string,
  overrideExistingConfig?: boolean,
  applyToAll?: boolean,
  selectedRepoIds?: number[],
  request?: string,
  enableGhas?: boolean,
) => {
  const initialSummary = {
    total_repo_count: 0,
    public_repo_count: 0,
    private_and_internal_repo_count: 0,
    private_and_internal_repos_count_exceeding_licenses: 0,
    licenses_needed: 0,
    errors: [],
    requestStatus: RequestStatus.InProgress,
  }
  let summary = initialSummary
  setConfirmationDialogSummary(summary)

  const summaryResult = await verifiedFetchJSON(
    settingsOrgSecurityProductsRepositoriesConfigurationSummaryPath({org: organization}),
    {
      method: 'POST',
      body: {
        no_configuration_only: overrideExistingConfig === true ? 'false' : 'true',
        repository_ids: applyToAll === true ? [] : selectedRepoIds,
        query: request,
        enable_ghas: enableGhas,
      },
    },
  )

  if (summaryResult.ok) {
    summary = await summaryResult.json()
    summary.requestStatus = RequestStatus.Success
  } else {
    summary = {...initialSummary, requestStatus: RequestStatus.Error}
  }
  setConfirmationDialogSummary(summary)
}

export const showDefaultForNewReposDropDown = (
  customSecurityConfigurations: OrganizationSecurityConfiguration[],
  githubRecommendedConfiguration?: OrganizationSecurityConfiguration,
): boolean => {
  let defaultIsSet = false
  if (githubRecommendedConfiguration) {
    defaultIsSet =
      githubRecommendedConfiguration.default_for_new_private_repos ||
      githubRecommendedConfiguration.default_for_new_public_repos
  }

  if (defaultIsSet) return false

  for (const customConfig of customSecurityConfigurations) {
    defaultIsSet = customConfig.default_for_new_private_repos || customConfig.default_for_new_public_repos
    if (defaultIsSet) return false
  }

  return true
}
