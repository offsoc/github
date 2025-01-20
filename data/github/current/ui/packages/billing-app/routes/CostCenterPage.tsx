import {useContext, useState, useCallback, useRef} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate} from 'react-router-dom'
import {LinkButton, Text, Dialog, Box, Button, Breadcrumbs, Truncate} from '@primer/react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import {PageContext} from '../App'
import {AzureSubscriptionDetails} from '../components/cost_centers/AzureSubscriptionDetails'
import {CostCenterResourceSelector} from '../components/cost_centers/CostCenterResourceSelector'
import CostCenterMembersList from '../components/cost_centers/CostCenterMembersList'
import Layout from '../components/Layout'
import {CostCenterState, CostCenterType} from '../enums/cost-centers'
import useRoute from '../hooks/use-route'
import {doRequest, HTTPMethod} from '../hooks/use-request'
import {COST_CENTERS_ROUTE, EDIT_COST_CENTER_ROUTE, DELETE_COST_CENTER_ROUTE} from '../routes'

import type {Customer} from '../types/common'
import type {CostCenter, Subscription, CostCenterPicker} from '../types/cost-centers'

export interface CostCenterPagePayload {
  costCenter: CostCenter
  customer: Customer
  encodedAzureSubscriptionUri: string
  subscriptions: Subscription[]
  isCopilotStandalone: boolean
}

export function CostCenterPage() {
  const navigate = useNavigate()
  const payload = useRoutePayload<CostCenterPagePayload>()
  const {costCenter, customer, encodedAzureSubscriptionUri, subscriptions, isCopilotStandalone} = payload
  const {
    costCenterKey: {targetId, targetType, uuid},
    resources,
    costCenterState,
  } = costCenter
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const {path: costCentersPath} = useRoute(COST_CENTERS_ROUTE)
  const {path: editCostCenterPath} = useRoute(EDIT_COST_CENTER_ROUTE, {costCenterUUID: uuid})
  const {path: deleteCostCenterPath} = useRoute(DELETE_COST_CENTER_ROUTE, {costCenterUUID: uuid})
  const {path: allCostCentersRoute} = useRoute(COST_CENTERS_ROUTE)
  const {addToast} = useToastContext()
  const returnFocusRef = useRef(null)

  const onDeleteDialogOpen = useCallback(() => setIsDeleteDialogOpen(true), [])
  const onDeleteDialogClose = useCallback(() => setIsDeleteDialogOpen(false), [])
  const handleDeleteCostCenter = useCallback(async (costCenterData: CostCenter) => {
    const {ok, data} = await doRequest(HTTPMethod.DELETE, deleteCostCenterPath, costCenterData)
    if (!ok) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: data.error,
      })
    } else {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'success',
        message: 'Successfully deleted cost center.',
      })
    }
    setIsDeleteDialogOpen(false)
    navigate(allCostCentersRoute)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const disablePicker: CostCenterPicker[] = []
  if (isCopilotStandalone) {
    disablePicker.push('org', 'repo')
  }

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-muted)',
          paddingBottom: 2,
          marginBottom: 3,
          flexDirection: ['column', 'row'],
        }}
      >
        <Breadcrumbs sx={{ol: {display: 'flex'}, '*::after': {fontSize: '24px'}}}>
          <Breadcrumbs.Item href={costCentersPath} sx={{fontSize: '24px'}}>
            Cost centers
          </Breadcrumbs.Item>
          <Breadcrumbs.Item selected as="h2" sx={{fontSize: '24px', flex: '1 1 auto'}}>
            <Truncate title={costCenter.name} expandable={true} maxWidth={[180, 240, 400, 660]}>
              {costCenter.name}
            </Truncate>
          </Breadcrumbs.Item>
        </Breadcrumbs>
        {costCenterState === CostCenterState.Active && !isStafftoolsRoute && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: ['column', 'row'],
              width: ['100%', 'auto'],
            }}
          >
            <LinkButton
              href={editCostCenterPath}
              sx={{ml: 'auto', mt: [2, 0], width: ['100%', 'auto']}}
              data-testid={`edit-cost-center-${uuid}`}
            >
              Edit
            </LinkButton>
            <Button
              sx={{ml: [0, 2], mt: [2, 0], width: ['100%', 'auto']}}
              variant="danger"
              data-testid={`delete-cost-center-${uuid}`}
              onClick={onDeleteDialogOpen}
              ref={returnFocusRef}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{maxWidth: '65ch'}}>
        <CostCenterResourceSelector
          customer={customer}
          resources={resources}
          setCostCenterResources={() => {}}
          viewOnly={true}
          disablePicker={disablePicker}
        />
        <CostCenterMembersList resources={resources} />
        {targetType === CostCenterType.AzureSubscription && (
          <AzureSubscriptionDetails
            encodedAzureSubscriptionUri={encodedAzureSubscriptionUri}
            setAzureTargetId={() => {}}
            subscriptions={subscriptions}
            targetId={targetId}
            viewOnly={true}
          />
        )}
      </Box>
      {isDeleteDialogOpen && (
        <Dialog
          aria-labelledby="delete-cost-center-header"
          data-testid="delete-cost-center-dialog"
          isOpen={isDeleteDialogOpen}
          onDismiss={onDeleteDialogClose}
          returnFocusRef={returnFocusRef}
          sx={{width: 320}}
        >
          <Dialog.Header sx={{border: 0, bg: 'transparent'}}>Delete cost center</Dialog.Header>
          <Box sx={{px: 3}}>
            <Text as="p" sx={{mb: 2}}>
              <strong>Are you sure you want to delete {costCenter.name}?</strong>
            </Text>
            <p>
              Once deleted, usage and spend incurred by resources included in this cost center will be attributed to
              your enterprise account.
            </p>
          </Box>
          {/* TODO: Use Dialog.Footer
            As of 2024-01-25 Dialog.Footer is not yet implemented in Primer React
          */}
          <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 3}}>
            <Button onClick={onDeleteDialogClose} sx={{mr: 2}}>
              Cancel
            </Button>
            <Button onClick={() => handleDeleteCostCenter(costCenter)} variant="danger">
              Delete cost center
            </Button>
          </Box>
        </Dialog>
      )}
    </Layout>
  )
}
