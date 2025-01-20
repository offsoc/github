import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {HistoryIcon} from '@primer/octicons-react'
import {ActionMenu} from '@primer/react'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {threadName} from '../utils/copilot-chat-helpers'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {SelectMenu, type SelectMenuItem} from './SelectMenu'

export const PreviousThreadsHeaderMenu = () => {
  const {threads, selectedThreadID, mode} = useChatState()
  const manager = useChatManager()
  const [isLoading, setIsLoading] = useState(false)

  const items = useMemo(
    () =>
      manager.sortThreads(threads).map(t => ({
        id: t.id,
        text: threadName(t),
        // TODO: show avatar stack for agents
        href: `/copilot/c/${t.id}`,
      })),
    [threads, manager],
  )

  const handleSelect = useCallback(
    async (item: SelectMenuItem) => {
      const t = threads.get(item.id)
      if (!t) return

      await manager.selectThread(t)
    },
    [threads, manager],
  )

  useEffect(() => {
    const loadThreads = async () => {
      setIsLoading(true)
      await manager.fetchThreads()
      setIsLoading(false)
    }

    void loadThreads()
  }, [manager])

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButtonWithTooltip
          icon={HistoryIcon}
          label="Conversation history"
          tooltipDirection="s"
          variant="invisible"
          sx={{color: 'fg.muted'}}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium">
        <SelectMenu
          title="Previous conversations"
          searchPlaceholder="Search previous conversations"
          items={items}
          selectedItemID={selectedThreadID}
          onSelect={handleSelect}
          loading={isLoading}
          asLinks={mode === 'immersive'}
        />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
