import {useState} from 'react'
import {Box, Button, Dialog, Flash, Octicon} from '@primer/react'
import {AlertIcon} from '@primer/octicons-react'
import {deleteImageDefinition} from '../../../services/custom-images'

interface Props {
  imageDefinitionId: string
  entityLogin: string
  isEnterprise: boolean
  onCancel(): void
  onDismiss(): void
  onSuccess(): void
}
export function DeleteCustomImageDialog({
  imageDefinitionId,
  entityLogin,
  isEnterprise,
  onDismiss,
  onCancel,
  onSuccess,
}: Props) {
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDeleteClick() {
    setDeleting(true)
    setErrorMessage('')

    const result = await deleteImageDefinition(imageDefinitionId, entityLogin, isEnterprise)
    setDeleting(false)

    if (result.success) {
      onSuccess()
    } else {
      setErrorMessage(result.errorMessage)
    }
  }

  return (
    <Dialog
      data-testid="delete-definition-dialog"
      isOpen={true}
      onDismiss={onDismiss}
      aria-labelledby="delete-definition-dialog"
    >
      <Dialog.Header id="delete-definition-dialog">Delete custom image</Dialog.Header>
      {errorMessage && (
        <Box sx={{mx: 3, mt: 2}}>
          <ErrorBanner>{errorMessage}</ErrorBanner>
        </Box>
      )}
      <div>
        <Box sx={{p: 3}}>
          <span>
            Deleting this custom image will free up its storage space. To recreate the custom image, you will need to
            re-run the workflow file.
          </span>
        </Box>
        <Box as="hr" sx={{m: 0}} />
        <Box sx={{p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
          <Button data-testid="image-delete-cancel-button" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDeleteClick} disabled={deleting} data-testid="image-delete-button">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </div>
    </Dialog>
  )
}

function ErrorBanner({children}: React.PropsWithChildren) {
  return (
    <Flash data-testid="server-error-banner" variant="danger">
      <Box sx={{display: 'flex', gap: 1}}>
        <div>
          <Octicon icon={AlertIcon} />
        </div>
        <div>{children}</div>
      </Box>
    </Flash>
  )
}
