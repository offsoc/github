import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {LineRange} from '@github-ui/diff-lines'
import {AlertIcon, CopilotIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Spinner} from '@primer/react'
import {useMemo} from 'react'
import {DiffLinesAttachMenuItem} from '../shared/DiffLinesAttachMenuItem'
import {DiffLinesDiscussMenuItem} from '../shared/DiffLinesDiscussMenuItem'
import {DiffLinesExplainMenuItem} from '../shared/DiffLinesExplainMenuItem'
import {DiffChatWrapper, type DiffChatWrapperProps} from './DiffChatWrapper'

interface ContextMenuWrapperProps {
  selectedRange?: LineRange
}

// wrapper/loader
export const CopilotDiffChatContextMenu: React.FC<DiffChatWrapperProps<ContextMenuWrapperProps>> = ({
  selectedRange,
  ...props
}) => (
  <DiffChatWrapper
    errorFallback={<MenuItemError />}
    suspenseFallback={<MenuItemLoading />}
    componentProps={{selectedRange}}
    Component={BaseCopilotDiffChatContextMenu}
    {...props}
  />
)

const MenuItemError: React.FC = () => (
  <ActionList.Item disabled>
    <ActionList.LeadingVisual>
      <AlertIcon />
    </ActionList.LeadingVisual>
    Copilot failed to load
  </ActionList.Item>
)

const MenuItemLoading: React.FC = () => (
  <ActionList.Item disabled>
    <ActionList.LeadingVisual>
      <Spinner size="small" />
    </ActionList.LeadingVisual>
    Copilot is loading...
  </ActionList.Item>
)

interface BaseCopilotDiffChatContextMenuProps {
  fileDiffReference: FileDiffReference
  selectedRange?: LineRange
}

// actual contents
const BaseCopilotDiffChatContextMenu: React.FC<BaseCopilotDiffChatContextMenuProps> = ({
  fileDiffReference,
  selectedRange,
}) => {
  const referenceWithRange = useMemo(() => {
    const ref = {...fileDiffReference}
    if (selectedRange) {
      ref.selectedRange = {
        start: `${selectedRange?.startOrientation[0]?.toUpperCase() ?? ''}${selectedRange?.startLineNumber}`,
        end: `${selectedRange?.endOrientation[0]?.toUpperCase() ?? ''}${selectedRange?.endLineNumber}`,
      }
    }
    return ref
  }, [fileDiffReference, selectedRange])

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <CopilotIcon />
          </ActionList.LeadingVisual>
          Copilot
        </ActionList.Item>
      </ActionMenu.Anchor>

      <ActionMenu.Overlay>
        <ActionList>
          <DiffLinesDiscussMenuItem fileDiffReference={referenceWithRange} eventContext={{prx: true}} />
          <DiffLinesExplainMenuItem fileDiffReference={referenceWithRange} eventContext={{prx: true}} />
          <DiffLinesAttachMenuItem fileDiffReference={referenceWithRange} eventContext={{prx: true}} />
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
