import {Link} from '@primer/react'
import {ReposDialog} from './ReposDialog'
import {useOverlayControls} from '../../hooks/use-overlay-controls'
import {DatumText} from './DatumText'
import {usePipelineDetails} from '../PipelineDetails'

export function ReposDialogButton() {
  const {cardPipeline: pipelineDetails} = usePipelineDetails()
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()

  const formattedCount = pipelineDetails.repositoryCount.toLocaleString()

  return (
    <div>
      <Link as="button" onClick={openDialog}>
        <DatumText>{formattedCount}</DatumText>
      </Link>
      {isDialogOpen && <ReposDialog onClose={closeDialog} />}
    </div>
  )
}
