import {Button, ButtonGroup, IconButton, ActionList, ActionMenu} from '@primer/react'
import {CopilotIcon, TriangleDownIcon} from '@primer/octicons-react'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import styles from './CopilotActionsChatButton.module.css'
import {clsx} from 'clsx'

const ACTIONS_CHAT_BUTTON_ID = 'copilot-actions-chat-button'

export function CopilotActionsChatButton() {
  const handleSuggestFix = () =>
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      content:
        'Using the following logs, investigate related files and suggest code to fix the problem or problems identified.',
      references: [],
      id: ACTIONS_CHAT_BUTTON_ID,
    })

  const handleExplainError = () =>
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      content: 'Explain the error in this job.',
      references: [],
      id: ACTIONS_CHAT_BUTTON_ID,
    })

  return (
    <>
      {/* Compact variant */}
      <div className={clsx(styles.copilotActionsChatButton, styles.compact)}>
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton
              icon={CopilotIcon}
              aria-label="Ask Copilot about these logs"
              className={styles.buttonBorder}
              style={{borderTop: 'none'}}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item onSelect={handleSuggestFix}>Suggest a fix</ActionList.Item>
              <ActionList.Item onSelect={handleExplainError}>Explain error</ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>

      {/* Expanded variant */}
      <div className={clsx(styles.copilotActionsChatButton, styles.expanded)}>
        <ButtonGroup>
          <Button
            leadingVisual={CopilotIcon}
            onClick={handleSuggestFix}
            className={styles.buttonBorder}
            style={{borderTop: 'none'}}
          >
            Suggest a fix
          </Button>
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                className={clsx(styles.expandButton, styles.buttonBorder)}
                icon={TriangleDownIcon}
                aria-label="Ask Copilot about these logs"
                style={{borderTop: 'none'}}
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay align="end">
              <ActionList>
                <ActionList.Item onSelect={handleExplainError}>Explain error</ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </ButtonGroup>
      </div>
    </>
  )
}
