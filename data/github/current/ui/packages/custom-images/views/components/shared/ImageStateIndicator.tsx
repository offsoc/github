import {Octicon} from '@primer/react'
import {DotFillIcon} from '@primer/octicons-react'
import {ImageDefinitionState, ImageVersionState} from '@github-ui/github-hosted-runners-settings/types/image'

function getDisplayText(imageState: ImageDefinitionState | ImageVersionState | null) {
  switch (imageState) {
    case ImageVersionState.Deleting:
      return 'Deleting'
    case ImageDefinitionState.Provisioning:
    case ImageVersionState.ImportingBlob:
    case ImageVersionState.ProvisioningImageVersion:
      return 'Provisioning'
    case ImageVersionState.Generating:
      return 'Generating'
    case ImageVersionState.Ready:
      return 'Ready'
    case ImageVersionState.ImportFailed:
      return 'Import failed'
    default:
      return 'Unknown'
  }
}

function getDotFillIconColor(imageState: ImageDefinitionState | ImageVersionState | null) {
  switch (imageState) {
    case ImageVersionState.ImportFailed:
      return 'danger.fg'
    case ImageDefinitionState.Ready:
    case ImageVersionState.Ready:
      return 'success.fg'
    case ImageDefinitionState.Deleting:
    case ImageVersionState.Deleting:
      return 'neutral.fg'
    default:
      return 'attention.fg'
  }
}

export function ImageStateIndicator({imageState}: {imageState: ImageDefinitionState | ImageVersionState | null}) {
  const stateText = getDisplayText(imageState)
  const iconColor = getDotFillIconColor(imageState)

  return (
    <>
      <Octicon icon={DotFillIcon} size={16} sx={{mr: 1, ml: 2, color: iconColor}} />
      <span data-testid="image-state-text">{stateText}</span>
    </>
  )
}
