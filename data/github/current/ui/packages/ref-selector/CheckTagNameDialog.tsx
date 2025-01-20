import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {useClientValue} from '@github-ui/use-client-value'
import {Box, Button, Dialog} from '@primer/react'
import {createPortal} from 'react-dom'

export function CheckTagNameDialog({
  isOpen,
  onDismiss,
  onConfirm,
}: {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
}) {
  const [body] = useClientValue<HTMLElement | null>(() => document.body, null, [ssrSafeDocument?.body])

  return body
    ? createPortal(
        <Dialog isOpen={isOpen} onDismiss={onDismiss}>
          <Dialog.Header>Create branch</Dialog.Header>
          <Box sx={{p: 3}}>
            <span>
              A tag already exists with the provided branch name. Many Git commands accept both tag and branch names, so
              creating this branch may cause unexpected behavior. Are you sure you want to create this branch?
            </span>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
              <Button onClick={onDismiss}>Cancel</Button>
              <Button variant="danger" onClick={onConfirm} sx={{ml: 2}}>
                Create
              </Button>
            </Box>
          </Box>
        </Dialog>,
        document.body,
      )
    : null
}
