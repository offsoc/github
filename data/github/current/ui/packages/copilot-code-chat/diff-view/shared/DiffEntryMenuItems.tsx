import {publishAddCopilotChatReference, publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList} from '@primer/react'
import {clsx} from 'clsx'
import styles from './DiffEntryMenuItems.module.css'

interface CopilotChatDiffMenuItemProps {
  fileDiffReference: FileDiffReference | undefined
}

const sharedItemProps = {
  className: clsx(styles['code-chat-menu-item'], 'px-5'),
  role: 'menuitem',
} as const

export const DiffEntryMenuItems: React.FC<CopilotChatDiffMenuItemProps> = ({fileDiffReference}) => {
  const {addToast} = useToastContext()

  if (fileDiffReference === undefined) {
    return <BuildMenu inactiveText="Copilot is not available for this file type" />
  }

  const handleDiscuss = () => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references: [fileDiffReference],
    })
    sendEvent('copilot.file-diff.menu.discuss')
  }

  const handleAttach = () => {
    publishAddCopilotChatReference(fileDiffReference)
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({message: 'Reference added to thread', type: 'success'})
    sendEvent('copilot.file-diff.menu.add')
  }

  return <BuildMenu handleAttach={handleAttach} handleDiscuss={handleDiscuss} />
}

interface BuildMenuProps {
  handleDiscuss?: () => void
  handleAttach?: () => void
  inactiveText?: string
}

const BuildMenu = ({handleDiscuss, handleAttach, inactiveText}: BuildMenuProps) => (
  <>
    <ActionList.Item {...sharedItemProps} inactiveText={inactiveText} onSelect={handleDiscuss}>
      Ask Copilot about this diff
    </ActionList.Item>
    <ActionList.Item {...sharedItemProps} inactiveText={inactiveText} onSelect={handleAttach}>
      Attach to current thread
    </ActionList.Item>
  </>
)
