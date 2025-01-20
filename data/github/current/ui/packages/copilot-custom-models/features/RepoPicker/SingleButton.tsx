import {ActionList, AnchoredOverlay, Box, Button, Octicon} from '@primer/react'
import {RepoIcon} from '@primer/octicons-react'
import {PickerDialog} from './PickerDialog'
import type {QueryFn} from './types'
import {useSelectedRepos} from './SelectedReposProvider'
import {useOverlayControls} from '../../hooks/use-overlay-controls'

interface Props {
  queryFn: QueryFn
}

export function SingleButton({queryFn}: Props) {
  const {close: closeOverlay, isOpen: isOverlayOpen, open: openOverlay} = useOverlayControls()
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()
  const {count, setAll} = useSelectedRepos()

  const isChoosingAllRepos = !count

  const repositoryWord = count === 1 ? 'repository' : 'repositories'
  const label = isChoosingAllRepos ? 'All repositories' : `${count} ${repositoryWord}`

  const handleSelectedReposClick = () => {
    closeOverlay()
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
          <Button data-testid="picker-button" {...props}>
            <Box sx={{alignItems: 'center', display: 'flex', gap: '8px'}}>
              <Octicon icon={RepoIcon} size={16} />
              <span>{label}</span>
            </Box>
          </Button>
          {isDialogOpen && <PickerDialog closeDialog={closeDialog} queryFn={queryFn} />}
        </>
      )}
    >
      <ActionList role="menu" selectionVariant="single" showDividers sx={{width: '325px'}}>
        <ActionList.Item onSelect={handleAllReposClick} role="menuitemradio" selected={isChoosingAllRepos}>
          All repositories
          <ActionList.Description variant="block">
            Select all repositories within the organization
          </ActionList.Description>
        </ActionList.Item>

        <ActionList.Item onSelect={handleSelectedReposClick} role="menuitemradio" selected={!isChoosingAllRepos}>
          Selected repositories
          <ActionList.Description variant="block">
            Select a specific list of selected repositories
          </ActionList.Description>
        </ActionList.Item>
      </ActionList>
    </AnchoredOverlay>
  )
}
