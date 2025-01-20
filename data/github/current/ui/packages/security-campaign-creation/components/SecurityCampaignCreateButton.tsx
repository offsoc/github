import {useCallback, useState} from 'react'
import {Box, Button} from '@primer/react'
import type {MutateOptions} from '@tanstack/react-query'
import {useClickAnalytics} from '@github-ui/use-analytics'
import type {SecurityCampaignForm} from '@github-ui/security-campaigns-shared/SecurityCampaign'
import {SecurityCampaignsLimitDialog} from '../SecurityCampaignsLimitDialog'
import type {User} from '@github-ui/security-campaigns-shared/types/user'
import {
  useCreateSecurityCampaignMutation,
  type CreateSecurityCampaignRequest,
  type CreateSecurityCampaignResponse,
} from '../hooks/use-create-security-campaign-mutation'
import {SecurityCampaignsAlertsLimitDialog} from './SecurityCampaignsAlertsLimitDialog'
import {SecurityCampaignsOnboardingNotice} from '../SecurityCampaignsOnboardingNotice'
import {SecurityCampaignsNoAlertsDialog} from './SecurityCampaignNoAlertsDialog'
import {NewSecurityCampaignFormDialog} from './NewSecurityCampaignFormDialog'
import {assertNever} from '../utils/assert-never'

export interface SecurityCampaignCreateButtonProps {
  // The query that should be used to filter the alerts.
  query: string

  // The number of campaigns the organization has.
  orgCampaignsCount: number

  // The maximum number of campaigns allowed for an org.
  maxCampaigns: number

  // The URL to POST to create a campaign.
  campaignCreationPath: string

  // The URL to GET to fetch possible campaign managers.
  campaignManagersPath: string

  // The URL to GET to fetch the alerts summary.
  campaignAlertsSummaryPath: string

  // The current user.
  currentUser: User

  // A flag indicating whether to show the onboarding notice or not.
  showOnboardingNotice: boolean

  // The URL to POST to dismiss the onboarding notice.
  dismissOnboardingNoticePath: string

  // The default due date for the campaign.
  // Only used for testing purposes because there's a bug opening the datepicker in the tests.
  // See https://github.com/github/code-scanning/issues/14686
  defaultDueDate?: Date

  // Number of alerts matching the query
  alertsCount: number

  // Alerts limit per campaign
  maxAlerts: number
}

export function SecurityCampaignCreateButton({
  query,
  orgCampaignsCount,
  maxCampaigns,
  campaignCreationPath,
  campaignManagersPath,
  campaignAlertsSummaryPath,
  currentUser,
  showOnboardingNotice,
  dismissOnboardingNoticePath,
  defaultDueDate,
  alertsCount,
  maxAlerts,
}: SecurityCampaignCreateButtonProps) {
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false)
  const [isAlertsLimitDialogOpen, setIsAlertsLimitDialogOpen] = useState(false)
  const [isNoAlertsDialogOpen, setIsNoAlertsDialogOpen] = useState(false)

  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const {mutate, isPending, error, reset} = useCreateSecurityCampaignMutation(campaignCreationPath)

  const handleSubmit = async (
    campaign: SecurityCampaignForm,
    {onSuccess, ...options}: MutateOptions<CreateSecurityCampaignResponse, Error, CreateSecurityCampaignRequest>,
  ) => {
    mutate(
      {
        campaignName: campaign.name,
        campaignDescription: campaign.description,
        campaignDueDate: campaign.endsAt,
        campaignManager: campaign.manager?.id ?? 0,
        query,
      },
      {
        ...options,
        onSuccess: (response, variables, context) => {
          onSuccess?.(response, variables, context)
          window.open(response.campaignPath, '_self')
        },
      },
    )
  }

  const isAlertsEmpty = alertsCount === 0
  const maxCampaignsReached = orgCampaignsCount >= maxCampaigns
  const showCampaignLimitDialog = isCreationDialogOpen && maxCampaignsReached
  const showCreationDialog = isCreationDialogOpen && !maxCampaignsReached

  const sendCreateAnalyticsEvent = useCallback(
    (shownDialog: 'creation' | 'no_alerts' | 'alerts_limit' | 'campaigns_limit') => {
      sendClickAnalyticsEvent({
        category: 'security_campaigns',
        action: 'create',
        label: `location:security_center_alerts_code_scanning;dialog:${shownDialog};alerts_count:${alertsCount};org_campaigns_count:${orgCampaignsCount}`,
      })
    },
    [sendClickAnalyticsEvent, alertsCount, orgCampaignsCount],
  )

  const continueToCreationDialog = () => {
    setIsAlertsLimitDialogOpen(false)
    setIsCreationDialogOpen(true)
    sendCreateAnalyticsEvent('creation')
  }

  const getShownDialog = () => {
    if (isAlertsEmpty) {
      return 'no_alerts' as const
    }
    if (alertsCount > maxAlerts && !maxCampaignsReached) {
      return 'alerts_limit' as const
    }
    if (maxCampaignsReached) {
      return 'campaigns_limit' as const
    }
    return 'creation' as const
  }

  const handleOnClick = () => {
    const shownDialog = getShownDialog()

    sendCreateAnalyticsEvent(shownDialog)

    switch (shownDialog) {
      case 'no_alerts':
        setIsNoAlertsDialogOpen(true)
        break
      case 'alerts_limit':
        setIsAlertsLimitDialogOpen(true)
        break
      case 'campaigns_limit':
      case 'creation':
        // The campaigns limit dialog is controlled by isCreationDialogOpen as well
        setIsCreationDialogOpen(true)
        break
      default:
        assertNever(shownDialog)
    }
  }

  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Box sx={{position: 'relative'}}>
          <Button onClick={handleOnClick} size="small" inactive={isAlertsEmpty}>
            Create campaign
          </Button>
          <SecurityCampaignsOnboardingNotice show={showOnboardingNotice} dismissPath={dismissOnboardingNoticePath} />
        </Box>
      </Box>
      {isNoAlertsDialogOpen && <SecurityCampaignsNoAlertsDialog setIsOpen={setIsNoAlertsDialogOpen} />}
      {showCampaignLimitDialog && (
        <SecurityCampaignsLimitDialog maxCampaigns={maxCampaigns} setIsOpen={setIsCreationDialogOpen} />
      )}
      {isAlertsLimitDialogOpen && (
        <SecurityCampaignsAlertsLimitDialog
          maxAlerts={maxAlerts}
          setIsOpen={setIsAlertsLimitDialogOpen}
          continueToCreationDialog={continueToCreationDialog}
        />
      )}
      {showCreationDialog && (
        <NewSecurityCampaignFormDialog
          setIsOpen={setIsCreationDialogOpen}
          allowDueDateInPast={false}
          submitForm={handleSubmit}
          isPending={isPending}
          formError={error}
          resetForm={reset}
          defaultDueDate={defaultDueDate}
          currentUser={currentUser}
          query={query}
          campaignManagersPath={campaignManagersPath}
          campaignAlertsSummaryPath={campaignAlertsSummaryPath}
        />
      )}
    </>
  )
}
