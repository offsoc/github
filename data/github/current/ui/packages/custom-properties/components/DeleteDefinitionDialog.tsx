import type {CheckPropertyUsagesResponse, PropertyDefinition} from '@github-ui/custom-properties-types'
import sudo from '@github-ui/sudo'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Box, Button, Dialog} from '@primer/react'
import {useEffect, useState} from 'react'

import {useSetFlash} from '../contexts/FlashContext'
import {useCheckUsagePath} from '../hooks/use-check-usage-path'
import {useDeletePropertyPath, useListPropertiesPath} from '../hooks/use-properties-paths'
import {DefinitionUsageBanner, ServerErrorFormBanner} from './Banners'

interface Props {
  definition: PropertyDefinition
  onCancel(): void
  onDismiss(): void
}
export function DeleteDefinitionDialog({definition, onDismiss, onCancel}: Props) {
  const setFlash = useSetFlash()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [serverErrorMessage, setServerErrorMessage] = useState('')
  const [usages, setUsages] = useState<CheckPropertyUsagesResponse | undefined>()

  const deletePath = useDeletePropertyPath(definition.propertyName)
  const listPropertiesPath = useListPropertiesPath()

  const allowDeletion = usages?.propertyConsumerUsages.length === 0

  async function deleteDefinition() {
    setDeleting(true)
    setServerErrorMessage('')

    if (!(await sudo())) {
      setServerErrorMessage('Unauthorized')
      setDeleting(false)
      return
    }

    const result = await verifiedFetchJSON(deletePath, {method: 'DELETE'})
    if (result.ok) {
      setFlash('definition.deleted.success')
      navigate(listPropertiesPath)
    } else {
      setServerErrorMessage('Something went wrong')
      setDeleting(false)
    }
  }

  const checkUsagePath = useCheckUsagePath(definition.propertyName)

  useEffect(() => {
    async function checkUsages() {
      const result = await verifiedFetchJSON(checkUsagePath)
      if (result.ok) {
        setUsages(await result.json())
      }
    }

    checkUsages()
  }, [definition.propertyName, checkUsagePath])

  return (
    <Dialog
      data-testid="delete-definition-dialog"
      isOpen={true}
      onDismiss={onDismiss}
      aria-labelledby="delete-definition-dialog"
    >
      <Dialog.Header id="delete-definition-dialog">Delete property</Dialog.Header>
      {serverErrorMessage && (
        <Box sx={{mx: 3, mt: 2}}>
          <ServerErrorFormBanner>{serverErrorMessage}</ServerErrorFormBanner>
        </Box>
      )}

      <div>
        <Box sx={{p: 3}}>
          {usages === undefined ? (
            <span>Checking usages...</span>
          ) : (
            <DefinitionUsageBanner
              name={definition.propertyName}
              repoCount={usages.repositoriesCount}
              usages={usages.propertyConsumerUsages}
            />
          )}
        </Box>
        <Box sx={{px: 3, pb: 3}}>
          <span>
            This will permanently delete this property. <strong>This cannot be undone.</strong>
          </span>
        </Box>

        <Box as="hr" sx={{m: 0}} />

        <Box sx={{p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
          <Button onClick={onCancel}>Cancel</Button>

          {allowDeletion && (
            <Button variant="danger" onClick={deleteDefinition} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </Box>
      </div>
    </Dialog>
  )
}
