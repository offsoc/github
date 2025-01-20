import type React from 'react'
import {useMemo, useState, useCallback} from 'react'
import pluralize from 'pluralize'
import {Button} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {Link} from '@github-ui/react-core/link'
import {settingsOrgSecurityConfigurationsNewPath, settingsOrgSecurityProductsPath} from '@github-ui/paths'
import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import {DialogContext} from '../../contexts/DialogContext'
import {useAppContext} from '../../contexts/AppContext'
import ConfirmationDialog from '../ConfirmationDialog'
import SecurityConfigurationRow from './Row'
import {
  applyConfiguration,
  confirmationSummary,
  createDialogFooterButtons,
  dialogSize,
  showDefaultForNewReposDropDown,
} from '../../utils/dialog-helpers'
import type {
  OrganizationSecurityConfiguration,
  ConfigurationConfirmationSummary,
  PendingConfigurationChanges,
  ConfigurationPolicy,
} from '../../security-products-enablement-types'

interface SecurityConfigurationTableProps {
  githubRecommendedConfiguration?: OrganizationSecurityConfiguration
  customSecurityConfigurations: OrganizationSecurityConfiguration[]
}

const SecurityConfigurationTable: React.FC<SecurityConfigurationTableProps> = ({
  githubRecommendedConfiguration,
  customSecurityConfigurations,
}) => {
  const navigate = useNavigate()
  const {organization, capabilities, docsUrls} = useAppContext()
  const [searchParams] = useSearchParams()
  const [pendingConfigurationChanges, setPendingConfigurationChanges] = useState({} as PendingConfigurationChanges)
  const [confirmationDialogSummary, setConfirmationDialogSummary] = useState<ConfigurationConfirmationSummary | null>(
    null,
  )
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false)
  const [showUpdateFailureConfirmationDialog, setShowUpdateFailureConfirmationDialog] = useState<boolean>(false)
  const [configurationPolicy, setConfigurationPolicy] = useState<ConfigurationPolicy>({
    defaultForNewPublicRepos: false,
    defaultForNewPrivateRepos: false,
  })
  const configurationsCount = customSecurityConfigurations.length + (githubRecommendedConfiguration ? 1 : 0)

  const dialogContextValue = useMemo(
    () => ({configurationPolicy, setConfigurationPolicy}),
    [configurationPolicy, setConfigurationPolicy],
  )

  const onCloseDialog = useCallback(() => {
    setShowConfirmationDialog(false)
    setConfirmationDialogSummary(null)
    setConfigurationPolicy({defaultForNewPublicRepos: false, defaultForNewPrivateRepos: false})
  }, [])

  const confirmConfigApplication = useCallback(
    async (config: OrganizationSecurityConfiguration, overrideExistingConfig?: boolean, applyToAll?: boolean) => {
      setPendingConfigurationChanges({config, overrideExistingConfig, applyToAll})
      setShowConfirmationDialog(true)

      await confirmationSummary(
        setConfirmationDialogSummary,
        organization,
        overrideExistingConfig,
        applyToAll,
        [],
        '',
        config.enable_ghas,
      )
    },
    [organization],
  )

  const shouldSetNewRepoDefaults = showDefaultForNewReposDropDown(
    customSecurityConfigurations,
    githubRecommendedConfiguration,
  )

  const applyPendingConfigurationChanges = useCallback(async () => {
    const returnTo = settingsOrgSecurityProductsPath({org: organization, tip: searchParams.get('tip')})
    const result = await applyConfiguration(
      pendingConfigurationChanges,
      organization,
      navigate,
      'config_table',
      [],
      shouldSetNewRepoDefaults,
      dialogContextValue,
      returnTo,
    )

    if (result && result.status === 422) setShowUpdateFailureConfirmationDialog(true)
  }, [organization, searchParams, pendingConfigurationChanges, dialogContextValue, navigate, shouldSetNewRepoDefaults])

  const confirmationDialog = pendingConfigurationChanges?.config && (
    <DialogContext.Provider value={dialogContextValue}>
      <Dialog
        title={'Apply configuration?'}
        onClose={() => onCloseDialog()}
        sx={dialogSize}
        footerButtons={createDialogFooterButtons({
          cancelOnClick: () => onCloseDialog(),
          confirmOnClick: () => {
            applyPendingConfigurationChanges()
            onCloseDialog()
          },
          confirmContent: 'Apply',
        })}
      >
        <ConfirmationDialog
          confirmationDialogSummary={confirmationDialogSummary}
          pendingConfigurationChanges={pendingConfigurationChanges}
          showDefaultForNewReposDropDown={shouldSetNewRepoDefaults}
          hasPublicRepos={capabilities.hasPublicRepos}
          ghasPurchased={capabilities.ghasPurchased}
          docsBillingUrl={docsUrls.ghasBilling}
        />
      </Dialog>
    </DialogContext.Provider>
  )

  const updateFailureConfirmationDialog = (
    <Dialog
      title="Unable to apply configuration"
      onClose={() => setShowUpdateFailureConfirmationDialog(false)}
      sx={dialogSize}
      footerButtons={createDialogFooterButtons({
        confirmOnClick: () => setShowUpdateFailureConfirmationDialog(false),
        confirmContent: 'Okay',
        confirmButtonType: 'default',
      })}
    >
      Another enablement event is in progress. Please try again later.
    </Dialog>
  )

  return (
    <>
      {showConfirmationDialog && confirmationDialog}
      {showUpdateFailureConfirmationDialog && updateFailureConfirmationDialog}
      <div data-hpc>
        <div className="color-bg-subtle border-x border-top border-bottom rounded-top-2 py-2 px-3">
          <div className="d-flex flex-items-baseline">
            <div className="flex-1 text-bold">{pluralize('configuration', configurationsCount, true)}</div>
            <Button
              data-testid="new-configuration"
              as={Link}
              to={settingsOrgSecurityConfigurationsNewPath({org: organization})}
            >
              New configuration
            </Button>
          </div>
        </div>
        {githubRecommendedConfiguration && (
          <SecurityConfigurationRow
            configuration={githubRecommendedConfiguration}
            isLast={false}
            isGithubRecommended={true} // Mark as GitHub recommended
            confirmConfigApplication={confirmConfigApplication}
          />
        )}
        {customSecurityConfigurations.map((config, index) => (
          <SecurityConfigurationRow
            configuration={config}
            isLast={index === customSecurityConfigurations.length - 1}
            key={config.id}
            confirmConfigApplication={confirmConfigApplication}
          />
        ))}
      </div>
    </>
  )
}

export default SecurityConfigurationTable
