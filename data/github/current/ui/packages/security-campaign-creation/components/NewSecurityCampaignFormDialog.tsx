import {Box, UnderlineNav} from '@primer/react'
import {SecurityCampaignFormContents} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormContents'
import {SecurityCampaignFormDialogInner} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormDialogInner'
import {SecurityCampaignFormWrapper} from '@github-ui/security-campaigns-shared/components/SecurityCampaignFormWrapper'
import type {SecurityCampaign, SecurityCampaignForm} from '@github-ui/security-campaigns-shared/SecurityCampaign'
import type {User} from '@github-ui/security-campaigns-shared/types/user'
import type {MutateOptions} from '@tanstack/react-query'
import {useState} from 'react'
import {useAlertsSummaryQuery} from '../hooks/use-alerts-summary-query'
import {RepositoriesPanel} from './RepositoriesPanel'

enum SelectedTab {
  General = 'general',
  Repositories = 'repositories',
}

export interface NewSecurityCampaignFormDialogProps {
  setIsOpen: (isOpen: boolean) => void
  campaign?: SecurityCampaign
  currentUser?: User
  allowDueDateInPast: boolean
  submitForm: (campaign: SecurityCampaignForm, options: MutateOptions<unknown, Error, unknown>) => void
  isPending: boolean
  formError: Error | null
  resetForm: () => void

  query: string
  campaignManagersPath: string
  campaignAlertsSummaryPath: string

  // The default due date for the campaign.
  // Only used for testing purposes because there's a bug opening the datepicker in the tests.
  // See https://github.com/github/code-scanning/issues/14686
  defaultDueDate?: Date
}

export function NewSecurityCampaignFormDialog({
  setIsOpen,
  campaign,
  currentUser,
  allowDueDateInPast,
  submitForm,
  isPending,
  formError,
  resetForm,
  query,
  campaignManagersPath,
  campaignAlertsSummaryPath,
  defaultDueDate,
}: NewSecurityCampaignFormDialogProps) {
  const [selectedTab, setSelectedTab] = useState<SelectedTab>(SelectedTab.General)

  const handleSubmitForm = async (newCampaign: SecurityCampaignForm) => {
    submitForm(newCampaign, {
      onSuccess: () => setIsOpen(false),
    })
  }

  const {data, isPending: isSummaryPending} = useAlertsSummaryQuery(campaignAlertsSummaryPath, {
    query,
  })

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
        <UnderlineNav aria-label="Select a tab" loadingCounters={isSummaryPending}>
          <UnderlineNav.Item
            aria-current={selectedTab === SelectedTab.General ? 'location' : undefined}
            onSelect={() => setSelectedTab(SelectedTab.General)}
          >
            General
          </UnderlineNav.Item>
          <UnderlineNav.Item
            counter={data?.repositories.length ?? 0}
            aria-current={selectedTab === SelectedTab.Repositories ? 'location' : undefined}
            onSelect={() => setSelectedTab(SelectedTab.Repositories)}
          >
            Repositories
          </UnderlineNav.Item>
        </UnderlineNav>
        <Box sx={{height: 430}}>
          {selectedTab === SelectedTab.General && (
            <Box sx={{marginTop: 2}}>
              <SecurityCampaignFormContents campaignManagersPath={campaignManagersPath} />
            </Box>
          )}
          {selectedTab === SelectedTab.Repositories && <RepositoriesPanel alertsSummary={data} />}
        </Box>
      </SecurityCampaignFormDialogInner>
    </SecurityCampaignFormWrapper>
  )
}
