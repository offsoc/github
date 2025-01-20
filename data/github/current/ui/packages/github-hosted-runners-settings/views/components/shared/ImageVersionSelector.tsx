import {Text, ActionMenu, ActionList, FormControl} from '@primer/react'
import {ImageVersionState, type ImageVersion} from '../../../types/image'
import {TriangleDownIcon} from '@primer/octicons-react'

type Props = {
  imageVersions: ImageVersion[]
  selectedImageVersion: ImageVersion | null
  setSelectedImageVersion: (version: ImageVersion | null) => void
  hideLabel?: boolean
}

export function ImageVersionSelector({imageVersions, selectedImageVersion, setSelectedImageVersion, hideLabel}: Props) {
  if (!imageVersions.length) {
    return <Text sx={{color: 'danger.fg'}}>No image versions available.</Text>
  }

  const isSelected = (imageVersion: ImageVersion) => {
    return (
      selectedImageVersion?.version === imageVersion.version ||
      (!selectedImageVersion && imageVersion.version === imageVersions[0]?.version)
    )
  }

  return (
    <FormControl>
      <FormControl.Label visuallyHidden={hideLabel}>Image version</FormControl.Label>
      <ActionMenu>
        <ActionMenu.Button data-testid="image-versions-selector-btn" trailingAction={TriangleDownIcon} size="medium">
          <Text sx={{color: 'fg.muted'}}>Version: </Text>
          {selectedImageVersion ? selectedImageVersion.version : imageVersions[0]?.version}
        </ActionMenu.Button>
        <ActionMenu.Overlay>
          <ActionList selectionVariant="single">
            {imageVersions.map(version => (
              <ActionList.Item
                key={version.version}
                selected={isSelected(version)}
                onSelect={() => setSelectedImageVersion(version)}
              >
                {version.version}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </FormControl>
  )
}

export function getAvailableImageVersions(imageVersions: ImageVersion[]) {
  // we don't allow creating runner with failed or currently being deleted image version
  return imageVersions.filter(
    version => ![ImageVersionState.ImportFailed, ImageVersionState.Deleting].includes(version.state),
  )
}
