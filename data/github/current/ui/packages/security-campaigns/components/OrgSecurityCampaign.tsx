import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {SecurityCampaign, SecurityCampaignForm} from '@github-ui/security-campaigns-shared/SecurityCampaign'
import {Box, Flash, Heading, Label, Text} from '@primer/react'
import type {MutateOptions} from '@tanstack/react-query'
import {OrgProgressMetric} from '../components/OrgProgressMetric'
import {CampaignManagerText} from './CampaignManagerText'
import {useCallback, useMemo, useState} from 'react'
import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import {CampaignActionMenu} from '../components/CampaignActionMenu'
import {OrgAlertsList, type OrgAlertsListProps} from '../components/OrgAlertsList'
import {
  useUpdateSecurityCampaignMutation,
  type UpdateSecurityCampaignRequest,
  type UpdateSecurityCampaignResponse,
} from '../hooks/use-update-security-campaign-mutation'
import {useDeleteSecurityCampaignMutation} from '../hooks/use-delete-security-campaign-mutation'
import {
  ResolutionFilterProvider,
  SeverityFilterProvider,
  SortFilterProvider,
  StateFilterProvider,
} from '../filter-providers/StaticProviders'
import {
  RuleFilterProvider,
  RepositoryFilterProvider,
  TeamFilterProvider,
  TopicFilterProvider,
  ToolFilterProvider,
} from '../filter-providers/DynamicProviders'
import {OrgAlertsFilter} from './OrgAlertsFilter'
import {defaultQuery} from './AlertsList'
import {FilterRevert} from '@github-ui/filter'
import {EditSecurityCampaignFormDialog} from './EditSecurityCampaignFormDialog'
import {DeleteCampaignConfirmationDialog} from './DeleteCampaignConfirmationDialog'
import {RepoStatusMetric} from './RepoStatusMetric'
import type {AlertsGroup} from '../types/get-alerts-groups-request'
import {parseAlertsGroup} from '../types/get-alerts-groups-request'
import {AlertsGroupsMenu} from './AlertsGroupsMenu'
import {OrgAlertsGroups} from './OrgAlertsGroups'
import {useCloseSecurityCampaignMutation} from '../hooks/use-close-security-campaign-mutation'

export interface OrgSecurityCampaignPayload {
  campaign: SecurityCampaign
  alertsPath: string
  alertsGroupsPath: string
  campaignManagersPath: string
  securityOverviewPath: string
  orgLevelView: boolean
  suggestionsPath: string
  isAlertsGroupsEnabled: boolean
  isClosedCampaignsFeatureEnabled: boolean
}

function OrgSecurityCampaignAlerts({
  group,
  isAlertsGroupsEnabled,
  onGroupChange,
  ...props
}: OrgAlertsListProps & {
  group: AlertsGroup | null
  isAlertsGroupsEnabled: boolean
  onGroupChange: (group: AlertsGroup | null) => void
}) {
  const actions = useMemo(
    () =>
      isAlertsGroupsEnabled
        ? [{key: 'group-by', render: () => <AlertsGroupsMenu group={group} setGroup={onGroupChange} />}]
        : [],
    [group, onGroupChange, isAlertsGroupsEnabled],
  )

  if (group === null) {
    return <OrgAlertsList {...props} actions={actions} />
  }

  return <OrgAlertsGroups {...props} group={group} actions={actions} />
}

export function OrgSecurityCampaign() {
  const payload = useRoutePayload<OrgSecurityCampaignPayload>()

  const [campaign, setCampaign] = useState(payload.campaign)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen] = useState(false)

  const {
    mutate: mutateEdit,
    isPending: isEditPending,
    error: editError,
    reset,
  } = useUpdateSecurityCampaignMutation(payload.campaign.updatePath)
  const {
    mutate: mutateDelete,
    error: deleteError,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
  } = useDeleteSecurityCampaignMutation(payload.campaign.deletePath)

  const {mutate: mutateClose, error: closeError} = useCloseSecurityCampaignMutation(payload.campaign.closePath)
  const editCampaign = async (
    updatedCampaign: SecurityCampaignForm,
    {onSuccess, ...options}: MutateOptions<UpdateSecurityCampaignResponse, Error, UpdateSecurityCampaignRequest>,
  ) => {
    mutateEdit(
      {
        campaignName: updatedCampaign.name,
        campaignDescription: updatedCampaign.description,
        campaignDueDate: updatedCampaign.endsAt,
        campaignManager: updatedCampaign.manager?.id ?? 0,
      },
      {
        ...options,
        onSuccess: (response, variables, context) => {
          onSuccess?.(response, variables, context)
          setCampaign(oldCampaign => ({...oldCampaign, ...updatedCampaign}))
        },
      },
    )
  }

  const navigate = useNavigate()
  const deleteCampaign = async () => {
    mutateDelete(undefined, {
      onSuccess: () => {
        navigate(payload.securityOverviewPath)
      },
      onError: () => {
        setIsDeleteConfirmationDialogOpen(false)
      },
    })
  }

  const closeCampaign = async () => {
    mutateClose(undefined, {
      onSuccess: response => {
        window.location.href = response.redirect // This is used instead of navigate as navigate does not show the flash message
      },
    })
  }

  // Order determins the position of the filter in suggestion list.
  const filterProviders = useMemo(
    () => [
      new RepositoryFilterProvider(payload.suggestionsPath),
      new ResolutionFilterProvider(),
      new RuleFilterProvider(payload.suggestionsPath),
      new SeverityFilterProvider(),
      new SortFilterProvider(),
      new StateFilterProvider(),
      new TeamFilterProvider(payload.suggestionsPath),
      new ToolFilterProvider(payload.suggestionsPath),
      new TopicFilterProvider(payload.suggestionsPath),
    ],
    [payload.suggestionsPath],
  )

  const [params, setParams] = useSearchParams()

  const [group, setGroup] = useState<AlertsGroup | null>(parseAlertsGroup(params.get('group')))

  const onGroupChange = useCallback(
    (v: AlertsGroup | null) => {
      setGroup(v)
      if (v == null) {
        setParams(prevParams => {
          const next = new URLSearchParams(prevParams)
          next.delete('group')
          return next
        })
      } else {
        setParams(prevParams => {
          const next = new URLSearchParams(prevParams)
          next.set('group', v)
          return next
        })
      }
    },
    [setGroup, setParams],
  )

  const [query, setQuery] = useState<string>(defaultQuery)
  const showRevert = query !== defaultQuery

  const onStateFilterChange = (state: 'open' | 'closed') => {
    setQuery(oldQuery => {
      const queryWithoutState = oldQuery.replaceAll(/is:(open|closed)/g, '').trim()
      return `is:${state} ${queryWithoutState}`
    })
  }

  return (
    <>
      {isEditDialogOpen && (
        <EditSecurityCampaignFormDialog
          setIsOpen={setIsEditDialogOpen}
          campaign={campaign}
          allowDueDateInPast={true}
          submitForm={editCampaign}
          isPending={isEditPending}
          formError={editError}
          resetForm={reset}
          campaignManagersPath={payload.campaignManagersPath}
        />
      )}
      {isDeleteConfirmationDialogOpen && (
        <DeleteCampaignConfirmationDialog
          setIsOpen={setIsDeleteConfirmationDialogOpen}
          deleteCampaign={deleteCampaign}
          disabled={isDeletePending || isDeleteSuccess}
        />
      )}
      {deleteError && (
        <Flash variant="danger" sx={{mb: 2}}>
          {deleteError.message}
        </Flash>
      )}
      {closeError && (
        <Flash variant="danger" sx={{mb: 2}}>
          {closeError.message}
        </Flash>
      )}
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 2}}>
          <Heading data-hpc as="h2">
            {campaign.name}
          </Heading>
          <CampaignManagerText manager={campaign.manager} />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <Label variant="success">Beta</Label>
          <CampaignActionMenu
            onEditCampaignClicked={() => setIsEditDialogOpen(true)}
            onDeleteCampaignClicked={() => setIsDeleteConfirmationDialogOpen(true)}
            onCloseCampaignClicked={closeCampaign}
            isClosedCampaignsFeatureEnabled={payload.isClosedCampaignsFeatureEnabled}
          />
        </Box>
      </Box>
      <Text as="p" sx={{color: 'fg.muted'}}>
        {campaign.description}
      </Text>
      <Box sx={{display: 'flex', gap: 2}}>
        <OrgProgressMetric
          alertsPath={payload.alertsPath}
          endsAt={new Date(campaign.endsAt)}
          createdAt={new Date(campaign.createdAt)}
        />
        <RepoStatusMetric endsAt={new Date(campaign.endsAt)} alertsPath={payload.alertsPath} />
      </Box>
      <Box sx={{flexGrow: 1}}>
        <Box sx={{flexGrow: 1, mt: 2}}>
          <OrgAlertsFilter providers={filterProviders} query={query} setQuery={setQuery} />
          {showRevert && (
            <Box sx={{mt: 1}}>
              <FilterRevert
                as="button"
                onClick={() => {
                  setQuery(defaultQuery)
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{mt: 2}}>
        <OrgSecurityCampaignAlerts
          group={group}
          onGroupChange={onGroupChange}
          alertsPath={payload.alertsPath}
          alertsGroupsPath={payload.alertsGroupsPath}
          query={query}
          onStateFilterChange={onStateFilterChange}
          isAlertsGroupsEnabled={payload.isAlertsGroupsEnabled}
        />
      </Box>
    </>
  )
}
