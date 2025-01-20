import {Box, Button, Dialog} from '@primer/react'

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
      <Box sx={{p: 3}}>
        <span>{text}</span>
        <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
          <Button type="button" onClick={onDismiss}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} sx={{ml: 2}}>
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
