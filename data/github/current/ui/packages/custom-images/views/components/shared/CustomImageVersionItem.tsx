import {createRef, useState} from 'react'
import {IconButton, Box} from '@primer/react'
import {agoString} from '@github-ui/ago'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'
import {TrashIcon} from '@primer/octicons-react'
import {type ImageVersion, ImageVersionState} from '@github-ui/github-hosted-runners-settings/types/image'
import {DeleteCustomImageVersionDialog} from './DeleteCustomImageVersionDialog'
import {ImageStateIndicator} from './ImageStateIndicator'

interface Props {
  entityLogin: string
  imageDefinitionId: string
  isEnterprise: boolean
  isLatest: boolean
  version: ImageVersion
}

export default function CustomImageVersionItem(props: Props) {
  const {entityLogin, imageDefinitionId, isEnterprise, isLatest, version} = props
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
  const [imageVersionState, setImageVersionState] = useState<ImageVersionState | null>(version.state)
  const contextMenuButtonRef = createRef<HTMLButtonElement>()

  function openDeleteDialog() {
    setDeleteDialogIsOpen(true)
  }

  function closeDeleteDialog() {
    setDeleteDialogIsOpen(false)
    contextMenuButtonRef.current?.focus()
  }

  function handleDeleteDialogSuccess() {
    setImageVersionState(ImageVersionState.Deleting)
    setDeleteDialogIsOpen(false)
  }

  function handleTrashClick() {
    openDeleteDialog()
  }

  const size = version.size ?? 0

  return (
    <>
      <ListItem
        title={
          <ListItemTitle
            value={`Version ${version.version}`}
            trailingBadges={
              isLatest && imageVersionState !== ImageVersionState.Deleting // don't show latest batch if we deleted the latest
                ? [<ListItemTrailingBadge title="latest" key={0} data-testid="latest-label" />]
                : []
            }
          />
        }
        metadata={
          <ListItemMetadata>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              {!!version.lastUsedOn && (
                <span className="text-small color-fg-muted flex-shrink-0" data-testid="last-used-ago-text">
                  Last used {agoString(new Date(version.lastUsedOn))}
                </span>
              )}
              <ImageStateIndicator imageState={imageVersionState} />
            </Box>
            {imageVersionState !== ImageVersionState.Deleting && (
              // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
              <IconButton
                unsafeDisableTooltip={true}
                icon={TrashIcon}
                aria-label="Delete"
                variant="invisible"
                onClick={handleTrashClick}
                data-testid="trash-button"
                sx={{ml: 2}}
              />
            )}
          </ListItemMetadata>
        }
        sx={{pl: 2}}
      >
        <ListItemMainContent>
          <ListItemDescription>
            <span className="text-small color-fg-muted flex-shrink-0" data-testid="version-description">
              {size} GB created {agoString(new Date(version.createdOn))}
            </span>
          </ListItemDescription>
        </ListItemMainContent>
      </ListItem>
      {deleteDialogIsOpen && (
        <DeleteCustomImageVersionDialog
          imageDefinitionId={imageDefinitionId}
          version={version.version}
          entityLogin={entityLogin}
          isEnterprise={isEnterprise}
          onCancel={closeDeleteDialog}
          onDismiss={closeDeleteDialog}
          onSuccess={handleDeleteDialogSuccess}
        />
      )}
    </>
  )
}
