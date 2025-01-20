import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, ButtonGroup} from '@primer/react'
import {useCallback, useState} from 'react'

import {publishAddCopilotChatReference, publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type CopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {AskCopilotButton} from '../AskCopilotButton'
import styles from './CopilotCodeLinesMenu.module.css'

const DROPDOWN_BUTTON_ID = 'code-line-dropdown-copilot-button'

export default function CopilotCodeLinesMenu({
  copilotAccessAllowed,
  messageReference,
  hideDropdown,
  id,
}: {
  copilotAccessAllowed: boolean
  messageReference: CopilotChatReference
  hideDropdown?: boolean
  id?: string
}) {
  const [open, setOpen] = useState(false)
  const suggestIcebreakerEnabled = useFeatureFlag('copilot_smell_icebreaker_ux')

  const handleExplain = () => {
    publishOpenCopilotChat({
      content: 'Explain',
      intent: CopilotChatIntents.explain,
      references: [messageReference],
      id: DROPDOWN_BUTTON_ID,
    })
    setOpen(false)
  }

  const handleSuggest = () => {
    publishOpenCopilotChat({
      content: 'Suggest improvements to this code.',
      intent: CopilotChatIntents.suggest,
      references: [messageReference],
      id: DROPDOWN_BUTTON_ID,
    })
    setOpen(false)
  }

  const handleAskAbout = useCallback(() => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references: [messageReference],
      id,
    })
    setOpen(false)
  }, [id, messageReference])

  const handleAddReferenceCallback = () => {
    handleAddReference(messageReference, true, DROPDOWN_BUTTON_ID)
    setOpen(false)
  }

  return copilotAccessAllowed ? (
    <ButtonGroup className={hideDropdown ? 'pr-0' : ''}>
      <AskCopilotButton
        referenceType={messageReference.type}
        onClick={hideDropdown ? () => handleAddReference(messageReference, true, id) : handleAskAbout}
        id={id}
      />
      {hideDropdown ? undefined : (
        <ActionMenu open={open} onOpenChange={setOpen}>
          <ActionMenu.Button
            // This is all hacky and I wish we could use ActionMenu.Anchor
            // But ActionMenu.Anchor doesn't accept an ID parameter
            // TODO: revert back to how this was before once https://github.com/primer/react/issues/4299 is fixed
            id={DROPDOWN_BUTTON_ID}
            trailingAction={TriangleDownIcon}
            size="small"
            aria-label="Copilot menu"
            className={styles['menu-button']}
          >
            <div style={{width: 0}} />
          </ActionMenu.Button>
          <ActionMenu.Overlay
            align="end"
            onKeyDown={e => {
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              if (e.key === 'Escape') {
                e?.stopPropagation()
                setOpen(false)
              }
            }}
          >
            <ActionList>
              <ActionList.Item onSelect={handleExplain}>Explain</ActionList.Item>
              {suggestIcebreakerEnabled ? (
                <ActionList.Item onSelect={handleSuggest}>Suggest improvements</ActionList.Item>
              ) : null}
              <ActionList.Divider />
              <ActionList.Item onSelect={handleAddReferenceCallback}>Attach to current thread</ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </ButtonGroup>
  ) : null
}

export const handleAddReference = (messageReference: CopilotChatReference, shouldAppend?: boolean, id?: string) => {
  if (shouldAppend) {
    publishAddCopilotChatReference(messageReference, true, id)
    publishOpenCopilotChat({intent: CopilotChatIntents.conversation, id})
  } else {
    publishOpenCopilotChat({intent: CopilotChatIntents.conversation, references: [messageReference], id})
  }
}
