import type React from 'react'
import pluralize from 'pluralize'
import {useCallback, useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {InfoIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {Dialog, type DialogButtonProps} from '@primer/react/experimental'
import {createDialogFooterButtons, dialogSize} from '../../utils/dialog-helpers'
import {useAppContext} from '../../contexts/AppContext'
import type {FlashProps} from '../Flash'
import {
  SecurityProductAvailability,
  SettingValue,
  type ConfigurationPolicy,
  type NewRepositoryDefaults,
  type SecurityConfigurationPayload,
  type ValidationErrors,
  type SecurityConfigurationSettings,
} from '../../security-products-enablement-types'
import {
  settingsOrgSecurityConfigurationsCreatePath,
  settingsOrgSecurityConfigurationsUpdatePath,
  settingsOrgSecurityConfigurationsViewPath,
  settingsOrgSecurityProductsPath,
  settingsOrgSecurityProductsRepositoriesCount,
} from '@github-ui/paths'

interface SecurityConfigurationFooterSectionProps {
  isNew: boolean
  isShow: boolean
  securityConfigurationSettings: SecurityConfigurationSettings
  securityConfiguration: SecurityConfigurationPayload['securityConfiguration']
  configurationName: React.RefObject<HTMLInputElement>
  configurationDescription: React.RefObject<HTMLInputElement>
  configurationPolicy: ConfigurationPolicy
  newRepoDefaults?: NewRepositoryDefaults
  tip: string
  updateErrors: (errors: ValidationErrors) => void
  clearState: () => void
  setFlashMessage: (flash: FlashProps) => void
}

type DialogType = 'delete' | 'updateFailed' | 'update' | 'create'

interface DialogProps {
  'data-testid': string
  title: string
  footerButtons: DialogButtonProps[]
}

const SecurityConfigurationFooterSection: React.FC<SecurityConfigurationFooterSectionProps> = ({
  isNew,
  isShow,
  securityConfigurationSettings,
  securityConfiguration,
  configurationName,
  configurationDescription,
  configurationPolicy,
  newRepoDefaults,
  tip,
  updateErrors,
  clearState,
  setFlashMessage,
}) => {
  const navigate = useNavigate()
  const {
    organization,
    securityProducts,
    capabilities: {ghasPurchased, ghasFreeForPublicRepos},
  } = useAppContext()
  const [saving, setSaving] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType | null>(null)
  const [repoCount, setRepoCount] = useState<number>(0)

  const thisConfigSetAsDefault =
    configurationPolicy.defaultForNewPublicRepos || configurationPolicy.defaultForNewPrivateRepos
  const existingDefaults = newRepoDefaults
  const thisID = isNew ? 0 : securityConfiguration?.id
  const {
    dependabotAlertsVEA,
    dependencyGraph,
    dependabotAlerts,
    dependabotSecurityUpdates,
    dependencyGraphAutosubmitAction,
    dependencyGraphAutosubmitActionOptions,
    codeScanning,
    secretScanning,
    secretScanningValidityChecks,
    secretScanningPushProtection,
    secretScanningNonProviderPatterns,
    privateVulnerabilityReporting,
    enableGHAS,
  } = securityConfigurationSettings
  const areGHASSettingsEnabled =
    dependabotAlertsVEA === SettingValue.Enabled ||
    codeScanning === SettingValue.Enabled ||
    secretScanning === SettingValue.Enabled

  const renderGHASMessage = (ghasPurchased && enableGHAS) || (ghasFreeForPublicRepos && areGHASSettingsEnabled)
  const existingPublicDefault = existingDefaults?.newPublicRepoDefaultConfig
  const existingPrivateDefault = existingDefaults?.newPrivateRepoDefaultConfig

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'auto'})
  }

  const save = async (event?: UIEvent) => {
    event?.preventDefault()
    setSaving(true)
    const configName = configurationName.current?.value
    const configDescription = configurationDescription.current?.value
    // if secret scanning and code scanning are disabled for non-ghas org set enable_ghas to false
    const enable_ghas =
      !ghasPurchased && codeScanning === SettingValue.Disabled && secretScanning === SettingValue.Disabled
        ? false
        : enableGHAS

    const createBody = () => {
      const isAvailable = (availability: SecurityProductAvailability) => {
        return availability === SecurityProductAvailability.Available
      }

      const secretScanningAvailable = isAvailable(securityProducts.secret_scanning.availability)
      const dependencyGraphAvailable = isAvailable(securityProducts.dependency_graph.availability)
      const dependencyGraphAutoSubmitActionAvailable = isAvailable(
        securityProducts.dependency_graph_autosubmit_action.availability,
      )
      const dependabotAlertsAvailable = isAvailable(securityProducts.dependabot_alerts.availability)
      const dependabotUpdatesAvailable = isAvailable(securityProducts.dependabot_updates.availability)
      const codeScanningAvailable = isAvailable(securityProducts.code_scanning.availability)
      const privateVulnerabilityReportingAvailable = isAvailable(
        securityProducts.private_vulnerability_reporting.availability,
      )

      return {
        security_configuration: {
          name: configName,
          description: configDescription,
          enable_ghas,
          ...(dependencyGraphAvailable && {dependency_graph: dependencyGraph}),
          ...(dependencyGraphAutoSubmitActionAvailable && {
            dependency_graph_autosubmit_action: dependencyGraphAutosubmitAction,
          }),
          ...(dependencyGraphAutoSubmitActionAvailable && {
            dependency_graph_autosubmit_action_options: dependencyGraphAutosubmitActionOptions,
          }),
          ...(dependabotAlertsAvailable && {dependabot_alerts: dependabotAlerts}),
          ...(dependabotUpdatesAvailable && {dependabot_security_updates: dependabotSecurityUpdates}),
          ...(codeScanningAvailable && {code_scanning: codeScanning}),
          ...(secretScanningAvailable && {secret_scanning: secretScanning}),
          ...(secretScanningAvailable && {secret_scanning_validity_checks: secretScanningValidityChecks}),
          ...(secretScanningAvailable && {secret_scanning_push_protection: secretScanningPushProtection}),
          ...(secretScanningAvailable && {secret_scanning_non_provider_patterns: secretScanningNonProviderPatterns}),
          ...(privateVulnerabilityReportingAvailable && {
            private_vulnerability_reporting: privateVulnerabilityReporting,
          }),
        },
        default_for_new_public_repos: configurationPolicy.defaultForNewPublicRepos,
        default_for_new_private_repos: configurationPolicy.defaultForNewPrivateRepos,
        enforcement: configurationPolicy.enforcement,
      }
    }

    const body = createBody()
    const url = isNew
      ? settingsOrgSecurityConfigurationsCreatePath({org: organization})
      : settingsOrgSecurityConfigurationsUpdatePath({org: organization, id: securityConfiguration!.id})

    const result = await verifiedFetchJSON(url, {method: isNew ? 'POST' : 'PUT', body})

    if (result.ok) {
      const state = {
        flash: {
          message: `${body.security_configuration.name} configuration successfully ${isNew ? 'created' : 'updated'}.`,
          variant: isNew ? 'success' : 'default',
        },
      }

      tip && tip.length > 0
        ? navigate(settingsOrgSecurityConfigurationsViewPath({org: organization, tip}), {state})
        : navigate(settingsOrgSecurityProductsPath({org: organization}), {state})

      scrollToTop()

      // Listen for beforeunload event to clear the state
      window.addEventListener('beforeunload', clearState)
    } else {
      const json = await result.json()
      let saveErrors = {}
      if (
        json.error ===
          'Another enablement event is in progress and your changes could not be saved. Please try again later.' &&
        !isNew
      ) {
        setDialogType('updateFailed')
        saveErrors = json.error
      } else {
        saveErrors = json.error || json.errors
      }
      updateErrors(saveErrors)
      setSaving(false)
      scrollToTop()
    }
    return false
  }

  const destroy = async () => {
    const result = await verifiedFetchJSON(
      settingsOrgSecurityConfigurationsUpdatePath({org: organization, id: securityConfiguration!.id}),
      {method: 'DELETE'},
    )

    if (result.ok) {
      const flash = {message: `${securityConfiguration?.name} configuration successfully deleted.`}
      navigate(settingsOrgSecurityProductsPath({org: organization}), {state: {flash}})
      scrollToTop()
      window.addEventListener('beforeunload', clearState)
    } else if (result.status === 422) {
      setDialogType('updateFailed')
    } else {
      const json = await result.json()
      setFlashMessage({message: `Failed to delete configuration: ${json.error}`, variant: `danger`})
      scrollToTop()
    }
  }

  const getRepoCount = useCallback(
    async (config: SecurityConfigurationPayload['securityConfiguration']) => {
      const result = await verifiedFetchJSON(
        settingsOrgSecurityProductsRepositoriesCount({org: organization, id: config!.id}),
        {method: 'GET'},
      )
      const data = result.ok ? await result.json() : null
      const count = data ? data.repo_count : 0
      setRepoCount(count)
    },
    [organization],
  )

  // Helper to determine if the current state would replace an existing default configuration.
  const changesReplaceExistingDefaults = (visibility?: 'public' | 'private') => {
    const changesPublicDefault =
      existingPublicDefault && configurationPolicy.defaultForNewPublicRepos
        ? existingPublicDefault.id !== thisID
        : false

    const changesPrivateDefault =
      existingPrivateDefault && configurationPolicy.defaultForNewPrivateRepos
        ? existingPrivateDefault.id !== thisID
        : false

    if (visibility === 'public') {
      return changesPublicDefault
    } else if (visibility === 'private') {
      return changesPrivateDefault
    } else {
      return changesPublicDefault || changesPrivateDefault
    }
  }

  const deleteDialogDefaultString = (configuration: SecurityConfigurationPayload['securityConfiguration']) => {
    if (configuration?.default_for_new_public_repos && configuration?.default_for_new_private_repos) {
      return ' and as the default for all newly created repositories'
    } else if (configuration?.default_for_new_public_repos) {
      return ' and as the default for newly created public repositories'
    } else if (configuration?.default_for_new_private_repos) {
      return ' and as the default for newly created private and internal repositories'
    } else {
      return ''
    }
  }

  // Helper to output a message if the configuration update would change an existing default.
  // If we don't overwrite an existing config (because this config isn't default or it already is default), return NULL
  // Else return a sentence like "will replace {name} as the default configuration for newly created {type} repositories"
  const dialogReplaceDefaultString = (prefix: string | null = null) => {
    // Unless this config is set as default AND there are existing defaults, return early:
    if (!(thisConfigSetAsDefault && existingDefaults)) return ''

    let output = ''
    prefix ||= '' // If prefix is NULL (the default) then set it to an empty string so we don't return 'null' in text.

    // Helper to output the sentence. sentencePrefix is optional and used for 'and' in cases where we are replacing
    // two different defaults with the same configuration change:
    const sentenceFor = (name: string, type: string, sentencePrefix: string | null = null) => {
      sentencePrefix ||= ''
      return ` ${sentencePrefix}replace ${name} as the default configuration for newly created ${type} repositories`
    }

    const changesDefaultForPublic = changesReplaceExistingDefaults('public')
    const changesDefaultForPrivate = changesReplaceExistingDefaults('private')
    if (!changesDefaultForPublic && !changesDefaultForPrivate) return ''

    const existingPublicRepoDefaultname = existingPublicDefault ? existingPublicDefault.name : ''
    const existingPrivateRepoDefaultName = existingPrivateDefault ? existingPrivateDefault.name : ''
    const existingDefaultIsTheSameForPublicAndPrivate = existingPublicDefault?.id === existingPrivateDefault?.id

    if (changesDefaultForPublic && changesDefaultForPrivate && existingDefaultIsTheSameForPublicAndPrivate) {
      // The existing default is the same for public & private repos, only name it once:
      output = sentenceFor(existingPublicRepoDefaultname, 'public and private/internal')
    } else if (changesDefaultForPublic && changesDefaultForPrivate) {
      // There are two different default configs for public and private repos, so mention both:
      output = output.concat(sentenceFor(existingPublicRepoDefaultname, 'public'))
      output = output.concat(sentenceFor(existingPrivateRepoDefaultName, 'private/internal', 'and '))
    } else if (changesDefaultForPublic) {
      // There is only a default for public repos:
      output = sentenceFor(existingPublicRepoDefaultname, 'public')
    } else if (changesDefaultForPrivate) {
      // There is only a default for private repos:
      output = sentenceFor(existingPrivateRepoDefaultName, 'private/internal')
    }

    return ` ${prefix} ${output}`
  }

  const dialogMessages = () => {
    switch (dialogType) {
      case 'delete':
        return `Deleting ${securityConfiguration?.name} configuration will remove it from
        ${pluralize('repository', repoCount, true)}${deleteDialogDefaultString(securityConfiguration)}.
        This will not change existing repository settings. This action is permanent and cannot be reversed.`
      case 'updateFailed':
        return 'Another enablement event is in progress. Please try again later.'
      case 'update':
        return isShow
          ? `This will ${dialogReplaceDefaultString()}.`
          : `This will update ${pluralize('repository', repoCount, true)} using this configuration
          ${dialogReplaceDefaultString('and ')}.`
      case 'create':
        return `This will ${dialogReplaceDefaultString()}.`
      default:
        return ''
    }
  }

  const dialogProps: Record<DialogType, DialogProps> = {
    delete: {
      'data-testid': 'delete-dialog',
      title: 'Delete this configuration?',
      footerButtons: createDialogFooterButtons({
        cancelOnClick: () => setDialogType(null),
        confirmOnClick: () => {
          destroy()
          setDialogType(null)
        },
        confirmContent: 'Delete configuration',
        confirmButtonType: 'danger',
      }),
    },
    updateFailed: {
      'data-testid': 'update-failed-dialog',
      title: `Unable to update ${configurationName.current?.value}`,
      footerButtons: createDialogFooterButtons({
        confirmOnClick: () => setDialogType(null),
        confirmContent: 'Okay',
        confirmButtonType: 'default',
      }),
    },
    update: {
      'data-testid': 'update-configuration-dialog',
      title: `Update ${configurationName.current?.value}?`,
      footerButtons: createDialogFooterButtons({
        cancelOnClick: () => setDialogType(null),
        confirmOnClick: () => {
          save()
          setDialogType(null)
        },
        confirmContent: 'Update configuration',
        confirmButtonType: 'primary',
      }),
    },
    create: {
      'data-testid': 'create-configuration-dialog',
      title: 'Create configuration',
      footerButtons: createDialogFooterButtons({
        cancelOnClick: () => setDialogType(null),
        confirmOnClick: () => {
          save()
          setDialogType(null)
        },
        confirmContent: 'Create configuration',
        confirmButtonType: 'primary',
      }),
    },
  }

  const handleButtonClick = (type: DialogType) => {
    getRepoCount(securityConfiguration)
    setDialogType(type)
  }

  const handleCancelConfigClick = () => {
    navigate(settingsOrgSecurityProductsPath({org: organization}))
    scrollToTop()
  }

  const renderSaveButton = () => {
    if (isShow || isNew) {
      return (
        <Button
          data-testid="save-configuration"
          variant="primary"
          disabled={saving}
          onClick={() => (changesReplaceExistingDefaults() ? setDialogType(isShow ? 'update' : 'create') : save())}
        >
          Save configuration
        </Button>
      )
    } else if (saving) {
      return (
        <Button data-testid="save-configuration" variant="primary" type="submit" disabled={saving}>
          Saving...
        </Button>
      )
    } else {
      return (
        <Button data-testid="save-configuration" variant="primary" onClick={() => handleButtonClick('update')}>
          Update configuration
        </Button>
      )
    }
  }

  const ghasMessage = () => {
    if (!ghasFreeForPublicRepos) {
      return 'This configuration counts towards your GitHub Advanced Security license usage.'
    } else if (ghasPurchased) {
      return 'This configuration counts towards your GitHub Advanced Security license usage on private and internal repositories.'
    } else {
      return 'This configuration enables GitHub Advanced Security features. Applying it to private repositories will only enable free security features.'
    }
  }

  return (
    <div>
      {dialogType && (
        <Dialog {...dialogProps[dialogType]} onClose={() => setDialogType(null)} sx={dialogSize}>
          {dialogMessages()}
        </Dialog>
      )}
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2, my: 3}}>
        <Box sx={{display: 'flex', gap: 2}}>
          {renderSaveButton()}
          <Button variant="default" onClick={() => handleCancelConfigClick()}>
            Cancel
          </Button>
        </Box>
        {!isNew && !isShow && (
          <Button variant="danger" onClick={() => handleButtonClick('delete')}>
            Delete configuration
          </Button>
        )}
      </Box>
      {renderGHASMessage && (
        <Box
          data-testid="info-text"
          sx={{display: 'flex', flexDirection: 'row', gap: 2, my: 2, alignItems: 'center', color: 'fg.muted'}}
        >
          <InfoIcon size={16} />
          <span>{ghasMessage()}</span>
        </Box>
      )}
    </div>
  )
}

export default SecurityConfigurationFooterSection
