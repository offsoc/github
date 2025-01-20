import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {AlertIcon, CopilotIcon} from '@primer/octicons-react'
import {ActionList, Spinner} from '@primer/react'
import {DiffLinesDiscussMenuItem} from '../shared/DiffLinesDiscussMenuItem'
import {DiffChatWrapper, type DiffChatWrapperProps} from './DiffChatWrapper'

// wrapper/loader
export type CopilotDiffChatBlobActionsMenuItemsProps = DiffChatWrapperProps
export const CopilotDiffChatBlobActionsMenuItems: React.FC<CopilotDiffChatBlobActionsMenuItemsProps> = props => (
  <DiffChatWrapper
    errorFallback={<MenuItemError />}
    suspenseFallback={<MenuItemLoading />}
    Component={BaseCopilotDiffChatBlobActionsMenuItems}
    {...props}
  />
)

const MenuItemError: React.FC = () => (
  <>
    <ActionList.Divider />
    <ActionList.Item disabled>
      <ActionList.LeadingVisual>
        <AlertIcon />
      </ActionList.LeadingVisual>
      Copilot failed to load
    </ActionList.Item>
  </>
)

const MenuItemLoading: React.FC = () => (
  <>
    <ActionList.Divider />
    <ActionList.Item disabled>
      <ActionList.LeadingVisual>
        <Spinner size="small" />
      </ActionList.LeadingVisual>
      Copilot is loading...
    </ActionList.Item>
  </>
)

interface BaseCopilotDiffChatBlobActionsMenuItemsProps {
  fileDiffReference: FileDiffReference
}

// actual contents
const BaseCopilotDiffChatBlobActionsMenuItems: React.FC<BaseCopilotDiffChatBlobActionsMenuItemsProps> = props => (
  <>
    <ActionList.Divider />
    <DiffLinesDiscussMenuItem
      eventContext={{prx: true}}
      leadingVisual={<CopilotIcon />}
      fileDiffReference={props.fileDiffReference}
    />
  </>
)
