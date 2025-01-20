import {Dialog, Box} from '@primer/react'
import {dialogBoxStyle} from '../utils/style'
import {Constants} from '../constants/constants'

interface IStateDetailsDialogProps {
  stateDetails: string
  showStateDetailsDialog: boolean
  setShowStateDetailsDialog: (showDialog: boolean) => void
  returnFocusRef: React.RefObject<HTMLElement>
}

export function StateDetailsDialog(props: IStateDetailsDialogProps) {
  return (
    <Dialog
      returnFocusRef={props.returnFocusRef}
      isOpen={props.showStateDetailsDialog}
      onDismiss={() => props.setShowStateDetailsDialog(false)}
    >
      <Dialog.Header>{Constants.stateDetails}</Dialog.Header>
      <Box sx={dialogBoxStyle}>{props.stateDetails}</Box>
    </Dialog>
  )
}
