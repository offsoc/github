import {Button, Dialog} from '@primer/react'

export function DangerConfirmationDialog({
  isOpen,
  title,
  text,
  buttonText,
  onDismiss,
  onConfirm,
}: {
  isOpen: boolean
  title: string
  text: string
  buttonText: string
  onDismiss: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog isOpen={isOpen} onDismiss={onDismiss}>
      <Dialog.Header>{title}</Dialog.Header>
      <div className="p-3">
        <span>{text}</span>
        <div className="d-flex flex-justify-center mt-3">
          <Button type="button" onClick={onDismiss}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} className="ml-2">
            {buttonText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
