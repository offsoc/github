import {ActionList, AnchoredOverlay, Button} from '@primer/react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {PickerDialog} from './PickerDialog'
import type {QueryFn} from './types'
import {useSelectedRepos} from './SelectedReposProvider'
import {useOverlayControls} from '../../hooks/use-overlay-controls'

interface Props {
  queryFn: QueryFn
}

export function PickerButton({queryFn}: Props) {
  const {close: closeOverlay, isOpen: isOverlayOpen, open: openOverlay} = useOverlayControls()
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()
  const {count, fetchSelected, setAll} = useSelectedRepos()

  const isChoosingAllRepos = !count

  const label = isChoosingAllRepos ? 'All repositories' : 'Select repositories'

  const handleSelectedReposClick = () => {
    closeOverlay()
    fetchSelected?.()
    openDialog()
  }

  const handleAllReposClick = () => {
    setAll([])
    closeOverlay()
  }

  return (
    <AnchoredOverlay
      open={isOverlayOpen}
      onOpen={openOverlay}
      onClose={closeOverlay}
      renderAnchor={props => (
        <>
          <Button data-testid="picker-button" trailingVisual={TriangleDownIcon} sx={{width: 'fit-content'}} {...props}>
            {label}
          </Button>
          {isDialogOpen && <PickerDialog closeDialog={closeDialog} queryFn={queryFn} />}
        </>
      )}
    >
      <ActionList role="menu" selectionVariant="single" showDividers sx={{width: '325px'}}>
        <ActionList.Item onSelect={handleSelectedReposClick} role="menuitemradio" selected={!isChoosingAllRepos}>
          Selected repositories
          <ActionList.Description variant="block">
            The custom model will be trained based on specifically selected repositories
          </ActionList.Description>
        </ActionList.Item>
        <ActionList.Item onSelect={handleAllReposClick} role="menuitemradio" selected={isChoosingAllRepos}>
          All repositories
          <ActionList.Description variant="block">
            The custom model will be trained based on all private and public repositories of this organization
          </ActionList.Description>
        </ActionList.Item>
      </ActionList>
    </AnchoredOverlay>
  )
}
