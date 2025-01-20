import {AlertIcon} from '@primer/octicons-react'
import {Blankslate, Dialog} from '@primer/react/experimental'

export interface ErrorDialogProps {
  title: string
  error: JSX.Element
}

export type SetError = (error: ErrorDialogProps) => void

export function ErrorDialog({title, error, onClose}: ErrorDialogProps & {onClose: () => void}) {
  return (
    <Dialog onClose={onClose} title={title}>
      <Dialog.Body>
        <Blankslate>
          <Blankslate.Visual>
            <AlertIcon size="medium" className="fgColor-danger" />
          </Blankslate.Visual>
          {error}
        </Blankslate>
      </Dialog.Body>
    </Dialog>
  )
}
