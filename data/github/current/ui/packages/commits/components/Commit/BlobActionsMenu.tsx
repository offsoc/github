import {
  CopilotDiffChatBlobActionsMenuItems,
  type CopilotDiffChatBlobActionsMenuItemsProps,
} from '@github-ui/copilot-code-chat/CopilotDiffChatBlobActionsMenuItems'
import type {Repository} from '@github-ui/current-repository'
import {blobPath} from '@github-ui/paths'
import {EyeIcon, KebabHorizontalIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'

interface BlobActionsMenuProps {
  oid: string
  path: string
  repo: Repository
  isViewable?: boolean
  copilotDiffChatProps?: CopilotDiffChatBlobActionsMenuItemsProps
}

export default function BlobActionsMenu({
  oid,
  path,
  repo,
  isViewable = true,
  copilotDiffChatProps,
}: BlobActionsMenuProps) {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <button className="Button Button--iconOnly Button--invisible" aria-label="More options">
          <KebabHorizontalIcon />
        </button>
      </ActionMenu.Anchor>

      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.LinkItem
            href={blobPath({
              repo: repo.name,
              owner: repo.ownerLogin,
              filePath: path,
              commitish: oid,
            })}
            inactiveText={isViewable ? undefined : 'Action unavailable'}
          >
            <ActionList.LeadingVisual>
              <EyeIcon />
            </ActionList.LeadingVisual>
            View file
          </ActionList.LinkItem>
          <ActionList.Item inactiveText="Action unavailable">
            <ActionList.LeadingVisual>
              <PencilIcon />
            </ActionList.LeadingVisual>
            Edit file
          </ActionList.Item>
          <ActionList.Item inactiveText="Action unavailable">
            <ActionList.LeadingVisual>
              <TrashIcon />
            </ActionList.LeadingVisual>
            Delete file
          </ActionList.Item>
          {copilotDiffChatProps && <CopilotDiffChatBlobActionsMenuItems {...copilotDiffChatProps} />}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
