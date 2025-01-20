import type {DialogProps} from '@primer/react/experimental'
import {Dialog} from '@primer/react/experimental'

interface MessageDialogProps extends DialogProps {
  message: string
}

export function MessageDialog({message, ...dialogProps}: MessageDialogProps) {
  return <Dialog {...dialogProps}>{message}</Dialog>
}
