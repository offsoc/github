// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useNavigate} from '@github-ui/use-navigate'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Dialog, IconButton, Text} from '@primer/react'
import {useCallback, useContext, useRef, useState} from 'react'

import {PageContext} from '../../App'
import {HTTPMethod, doRequest} from '../../hooks/use-request'
import useRoute from '../../hooks/use-route'
import {
  COST_CENTERS_ROUTE,
  DELETE_COST_CENTER_ROUTE,
  EDIT_COST_CENTER_ROUTE,
  VIEW_COST_CENTER_ROUTE,
} from '../../routes'
import type {CostCenter} from '../../types/cost-centers'
import {CostCenterState} from '../../enums/cost-centers'

type CostCenterActionMenuProps = {
  costCenter: CostCenter
}

export default function CostCenterActionMenu({costCenter}: CostCenterActionMenuProps) {
  const {
    costCenterKey: {uuid},
    name,
    costCenterState,
  } = costCenter

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {path: allCostCentersRoute} = useRoute(COST_CENTERS_ROUTE)
  const {path: viewCostCenterPath} = useRoute(VIEW_COST_CENTER_ROUTE, {costCenterUUID: uuid})
  const {path: editCostCenterPath} = useRoute(EDIT_COST_CENTER_ROUTE, {costCenterUUID: uuid})
  const {path: deleteCostCenterPath} = useRoute(DELETE_COST_CENTER_ROUTE, {costCenterUUID: uuid})

  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute

  const navigate = useNavigate()
  const {addToast} = useToastContext()
  const returnFocusRef = useRef(null)

  const onDeleteDialogOpen = useCallback(() => setIsDeleteDialogOpen(true), [])
  const onDeleteDialogClose = useCallback(() => setIsDeleteDialogOpen(false), [])
  const onDeleteCostCenter = useCallback(async () => {
    const {ok, data} = await doRequest(HTTPMethod.DELETE, deleteCostCenterPath, costCenter)
    if (!ok) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: data.error,
        role: 'alert',
      })
    } else {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'success',
        message: `Successfully deleted cost center ${name}.`,
        role: 'status',
      })
    }
    setIsDeleteDialogOpen(false)
    navigate(allCostCentersRoute)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div data-testid={`cost-center-${uuid}-action-menu`}>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label={`View actions for cost center ${name}`}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.LinkItem data-testid={`view-cost-center-${uuid}`} href={viewCostCenterPath}>
              View details
            </ActionList.LinkItem>
            {costCenterState === CostCenterState.Active && !isStafftoolsRoute && (
              <>
                <ActionList.LinkItem data-testid={`edit-cost-center-${uuid}`} href={editCostCenterPath}>
                  Edit
                </ActionList.LinkItem>
                <ActionList.Item
                  data-testid={`delete-cost-center-${uuid}`}
                  onSelect={onDeleteDialogOpen}
                  ref={returnFocusRef}
                  variant="danger"
                >
                  Delete
                </ActionList.Item>
              </>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
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
              <strong>Are you sure you want to delete {name}?</strong>
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
            <Button onClick={onDeleteCostCenter} variant="danger">
              Delete cost center
            </Button>
          </Box>
        </Dialog>
      )}
    </div>
  )
}
