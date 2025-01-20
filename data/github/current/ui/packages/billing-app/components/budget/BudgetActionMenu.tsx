import {KebabHorizontalIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Dialog, IconButton, Text} from '@primer/react'
import {useContext, useRef, useState} from 'react'

import {PageContext} from '../../App'

type BudgetActionMenuProps = {
  budgetId: string
  productName: string
  targetType: string
  targetName: string
  editLink: string
  onDeleteClick: () => void
}

export default function BudgetActionMenu({
  budgetId,
  productName,
  targetType,
  targetName,
  editLink,
  onDeleteClick,
}: BudgetActionMenuProps) {
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)

  const onDeleteDialogOpen = () => setIsDeleteDialogOpen(true)
  const onDeleteDialogClose = () => setIsDeleteDialogOpen(false)
  const onDeleteBudget = () => {
    onDeleteClick()
    onDeleteDialogClose()
  }

  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label={`View actions for ${targetType} ${targetName}'s budget`}
            name="action-icon"
            sx={{ml: 3}}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.LinkItem href={editLink}>
              <ActionList.LeadingVisual>
                <PencilIcon />
              </ActionList.LeadingVisual>
              Edit
            </ActionList.LinkItem>
            {!isStafftoolsRoute && (
              <ActionList.Item data-testid={`delete-budget-${budgetId}`} variant="danger" onSelect={onDeleteDialogOpen}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete
              </ActionList.Item>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {isDeleteDialogOpen && (
        <Dialog
          aria-labelledby="delete-budget-header"
          isOpen={isDeleteDialogOpen}
          onDismiss={onDeleteDialogClose}
          returnFocusRef={returnFocusRef}
          sx={{width: ['100%', 320]}}
        >
          <Dialog.Header sx={{border: 0, bg: 'transparent'}}>Delete budget</Dialog.Header>
          <Box sx={{px: 3}}>
            <Text as="p" sx={{mb: 2}}>
              <strong>
                Are you sure you want to delete the {productName} budget for {targetName}?
              </strong>
            </Text>
            <p>Once deleted, the budget will no longer exist.</p>
          </Box>
          {/* TODO: Use Dialog.Footer
            As of 2024-06-03 Dialog.Footer is not yet implemented in Primer React
          */}
          <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 3}}>
            <Button onClick={onDeleteDialogClose} sx={{mr: 2}}>
              Cancel
            </Button>
            <Button onClick={onDeleteBudget} variant="danger">
              Delete budget
            </Button>
          </Box>
        </Dialog>
      )}
    </>
  )
}
