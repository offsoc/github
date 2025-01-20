import type {SecurityCampaign, SecurityCampaignForm} from '@github-ui/security-campaigns-shared/SecurityCampaign'
import type {User} from '@github-ui/security-campaigns-shared/types/user'
import type {MutateOptions} from '@tanstack/react-query'
import {SecurityCampaignFormWrapper} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormWrapper'
import {SecurityCampaignFormDialogInner} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormDialogInner'
import {SecurityCampaignFormContents} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormContents'

export interface EditSecurityCampaignFormDialogProps {
  setIsOpen: (isOpen: boolean) => void
  campaign?: SecurityCampaign
  currentUser?: User
  allowDueDateInPast: boolean
  submitForm: (campaign: SecurityCampaignForm, options: MutateOptions<unknown, Error, unknown>) => void
  isPending: boolean
  formError: Error | null
  resetForm: () => void
  campaignManagersPath: string

  // The default due date for the campaign.
  // Only used for testing purposes because there's a bug opening the datepicker in the tests.
  // See https://github.com/github/code-scanning/issues/14686
  defaultDueDate?: Date
}

export function EditSecurityCampaignFormDialog({
  setIsOpen,
  campaign,
  currentUser,
  allowDueDateInPast,
  submitForm,
  isPending,
  formError,
  resetForm,
  campaignManagersPath,
  defaultDueDate,
}: EditSecurityCampaignFormDialogProps) {
  const handleSubmitForm = async (newCampaign: SecurityCampaignForm) => {
    submitForm(newCampaign, {
      onSuccess: () => setIsOpen(false),
    })
  }

  return (
    <SecurityCampaignFormWrapper
      campaign={campaign}
      currentUser={currentUser}
      allowDueDateInPast={allowDueDateInPast}
      submitForm={handleSubmitForm}
      reset={resetForm}
      isPending={isPending}
      formError={formError}
      defaultDueDate={defaultDueDate}
    >
      <SecurityCampaignFormDialogInner setIsOpen={setIsOpen}>
        <SecurityCampaignFormContents campaignManagersPath={campaignManagersPath} />
      </SecurityCampaignFormDialogInner>
    </SecurityCampaignFormWrapper>
  )
}
