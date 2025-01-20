import {ArchiveIcon, KebabHorizontalIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, type SxProp} from '@primer/react'

export interface CampaignActionMenuProps {
  onEditCampaignClicked: () => void
  onDeleteCampaignClicked: () => void
  onCloseCampaignClicked: () => void
  isClosedCampaignsFeatureEnabled: boolean
}

export function CampaignActionMenu({
  onEditCampaignClicked,
  onDeleteCampaignClicked,
  onCloseCampaignClicked,
  isClosedCampaignsFeatureEnabled,
  sx,
}: CampaignActionMenuProps & SxProp) {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} aria-label="Open campaign options" sx={sx} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Item onSelect={onEditCampaignClicked}>
            <PencilIcon /> Edit
          </ActionList.Item>
          {isClosedCampaignsFeatureEnabled && (
            <ActionList.Item onSelect={onCloseCampaignClicked}>
              <ArchiveIcon /> Close campaign
            </ActionList.Item>
          )}
          <ActionList.Item variant="danger" onSelect={onDeleteCampaignClicked}>
            <TrashIcon /> Delete
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
