import type React from 'react'
import pluralize from 'pluralize'
import {Spinner, Text, Link as PrimerLink} from '@primer/react'
import Flash from './Flash'
import ControlGroupDropDown from './ControlGroupDropDown'
import {useNewRepoPolicyDropdown} from '../hooks/UseNewRepoPolicyDropdown'
import {
  RequestStatus,
  type ConfigurationConfirmationSummary,
  type PendingConfigurationChanges,
} from '../security-products-enablement-types'
import {testIdProps} from '@github-ui/test-id-props'

type ConfirmationDialogProps = {
  confirmationDialogSummary: ConfigurationConfirmationSummary | null
  pendingConfigurationChanges: PendingConfigurationChanges
  hasPublicRepos: boolean
  showDefaultForNewReposDropDown?: boolean
  ghasPurchased: boolean
  docsBillingUrl: string
}

type ErrorObject = {
  message: string
  variant: 'danger' | 'warning' | undefined
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  confirmationDialogSummary,
  pendingConfigurationChanges,
  showDefaultForNewReposDropDown = false,
  hasPublicRepos,
  ghasPurchased,
  docsBillingUrl,
}) => {
  const {config} = pendingConfigurationChanges
  const {
    public_repo_count,
    private_and_internal_repo_count,
    licenses_needed,
    private_and_internal_repos_count_exceeding_licenses,
    requestStatus,
  } = confirmationDialogSummary || {}

  const getConfirmationDialogErrors = (): ErrorObject[] => {
    const errors: Array<{message: string; variant: string}> = []

    const exceeded_message =
      private_and_internal_repos_count_exceeding_licenses === 0
        ? `Private repositories that do not have GitHub Advanced Security will only have free features enabled.`
        : `${private_and_internal_repos_count_exceeding_licenses} private ${pluralize(
            'repository',
            private_and_internal_repos_count_exceeding_licenses,
          )} do not have GitHub Advanced Security and will only have free features enabled.`

    const additional_license_sentence =
      licenses_needed && licenses_needed > 0
        ? `You need ${licenses_needed} additional ${pluralize('license', licenses_needed)}. `
        : ''

    if (confirmationDialogSummary?.errors) {
      for (const error of confirmationDialogSummary?.errors) {
        switch (error) {
          case 'internal_ghas_error':
            errors.push({
              message: 'An error ocurred and license usage could not be calculated.',
              variant: 'danger',
            })
            break
          case 'license_limit_exceeded':
            errors.push({
              message: `${additional_license_sentence}${exceeded_message}`,
              variant: 'warning',
            })
            break
          case 'blocked_by_enterprise_policy':
            errors.push({
              message:
                'Modifying GitHub Advanced Security and related settings has been blocked by an enterprise policy. Continue with free features for all repositories, or cancel and change your selection.',
              variant: 'warning',
            })
            break
          case 'ghas_not_purchased':
            if (private_and_internal_repo_count && private_and_internal_repo_count > 0)
              errors.push({
                message:
                  'This organization does not have GitHub Advanced Security. Private repositories will only have free features enabled.',
                variant: 'warning',
              })
            break
          default:
            // If the error is not recognized, skip it
            break
        }
      }
    }
    return errors.map(error => ({message: error.message, variant: error.variant as 'danger' | 'warning'}))
  }

  const publicReposSection = (
    <li>
      <Text sx={{fontWeight: 'bold'}}>{public_repo_count}</Text> public {pluralize('repository', public_repo_count)}
    </li>
  )

  const applyReposSection = (
    <p>
      This will apply {pendingConfigurationChanges.config.name} to{' '}
      {pluralize('repository', confirmationDialogSummary?.total_repo_count, true)}.
    </p>
  )

  const enforceReposSection = (
    <p>
      This will <Text sx={{fontWeight: 'bold'}}>apply and enforce</Text> {pendingConfigurationChanges.config.name} to{' '}
      {pluralize('repository', confirmationDialogSummary?.total_repo_count, true)}. Repository admins will not to be
      able change security settings set by this configuration.
    </p>
  )

  const privateAndInternalReposSection = (
    <li>
      <Text sx={{fontWeight: 'bold'}}>{private_and_internal_repo_count}</Text> private and internal{' '}
      {pluralize('repository', private_and_internal_repo_count)}
    </li>
  )

  const unableToCalculateLicenseMessage = (
    <>
      We are currently unable to calculate the required number of licenses for this application. To get an estimate, try
      selecting fewer repositories at a time. Alternatively, you can proceed by clicking &#39;Apply&#39;.
    </>
  )

  const licensesNeededSection = (
    <li>
      {licenses_needed === null ? (
        unableToCalculateLicenseMessage
      ) : (
        <>
          <Text sx={{fontWeight: 'bold'}}>{licenses_needed}</Text> GitHub Advanced Security{' '}
          {pluralize('license', licenses_needed)} required
        </>
      )}
      <br />
      <PrimerLink inline href={docsBillingUrl} target="_blank">
        Learn about license consumption
      </PrimerLink>
    </li>
  )

  const summarySection = () => {
    switch (requestStatus) {
      case RequestStatus.InProgress:
        return (
          <div className="text-center">
            <Spinner size="small" />
          </div>
        )
      case RequestStatus.Success:
        return (
          <div>
            {config.enforcement === 'enforced' ? enforceReposSection : applyReposSection}
            <ul className="ml-4 pt-2">
              {publicReposSection}
              {privateAndInternalReposSection}
              {ghasPurchased && licensesNeededSection}
            </ul>
          </div>
        )
      default:
        return unableToCalculateLicenseMessage
    }
  }

  const DefaultForNewReposDropDown = () => {
    const {options, onSelect} = useNewRepoPolicyDropdown({hasPublicRepos})

    const newRepoDefaultProps = {
      title: 'Use as default for newly created repositories:',
      testId: 'repo-default',
      options,
      onSelect,
    }

    return <ControlGroupDropDown {...newRepoDefaultProps} />
  }

  return (
    <div {...testIdProps('confirmation-dialog-content')}>
      {getConfirmationDialogErrors().map((error, index) => (
        <Flash key={index} message={error.message} variant={error.variant} />
      ))}
      {summarySection()}
      {requestStatus === RequestStatus.Success && (
        <>
          <br />
          {showDefaultForNewReposDropDown && DefaultForNewReposDropDown()}
        </>
      )}
    </div>
  )
}

export default ConfirmationDialog
