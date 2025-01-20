import {Button} from '@primer/react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {useSelectedRepos} from './SelectedReposProvider'
import {ListDialog} from './ListDialog'
import {useOverlayControls} from '../../hooks/use-overlay-controls'

export function ListButton() {
  const {count, fetchSelected} = useSelectedRepos()
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()

  if (!count) return null

  const handleOpen = (): void => {
    fetchSelected?.()
    openDialog()
  }

  return (
    <>
      <Button onClick={handleOpen} trailingVisual={TriangleDownIcon}>
        Repositories: {count} selected
      </Button>
      {isDialogOpen && <ListDialog closeDialog={closeDialog} />}
    </>
  )
}
