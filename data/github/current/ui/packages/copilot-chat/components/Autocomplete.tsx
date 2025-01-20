import {GitHubAvatar} from '@github-ui/github-avatar'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {ArrowRightIcon} from '@primer/octicons-react'
import {ActionList, Octicon} from '@primer/react'
import type {ShowSuggestionsEvent, Suggestion} from '@primer/react/drafts'
import type {DetailedHTMLProps, InputHTMLAttributes, ReactElement} from 'react'
import {useCallback, useEffect, useState} from 'react'

import {findAgentCorrespondents} from '../utils/copilot-chat-helpers'
import {getSlashCommands, SLASH_COMMAND_PREFIX} from '../utils/copilot-slash-commands'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {COPILOT_CHAT_MENU_PORTAL_ROOT} from './PortalContainerUtils'

const MENTION_KEY_PREFIX = '@'
const GOTO_MARKETPLACE_URL = 'https://github.com/marketplace?type=apps&copilot_app=true'

type SuggestionWithRedirect = Suggestion & {
  redirectTo?: string
}

export function Autocomplete({
  children,
  textAreaRef,
}: {
  children: ReactElement<DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>>
  textAreaRef: React.RefObject<HTMLTextAreaElement>
}) {
  const manager = useChatManager()
  const {agents, agentsPath, messages} = useChatState()

  const [suggestions, setSuggestions] = useState<Suggestion[] | 'loading'>([])
  const [mounted, setMounted] = useState(() => typeof document !== 'undefined')
  const [overlayVisible, setOverlayVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSlashCommandsAutoComplete = useCallback(
    (event: ShowSuggestionsEvent) => {
      // Only allow slash commands at the beginning of the input
      // Note: state text is missing the last character updated - using the ref value instead here
      // otherwise will not see full command list when entering `/`
      const $text = textAreaRef.current?.value ?? ''
      const slashCommands = getSlashCommands({manager})
      const selectionStart = textAreaRef.current?.selectionStart ?? 0

      if (
        ($text[0] ?? '') !== event.trigger.triggerChar ||
        (selectionStart > 1 && $text[selectionStart - 2]?.match(/\s/))
      )
        return

      const matchingCommands = slashCommands.filter(slashCommand =>
        slashCommand.command.toLowerCase().includes(event.query.toLowerCase()),
      )
      const slashCommandSuggestions: Suggestion[] = matchingCommands.map(slashCommand => {
        return {
          value: slashCommand.command,
          key: slashCommand.command,
          render: $props => (
            <ActionList.Item key={slashCommand.label} {...$props}>
              <ActionList.LeadingVisual>
                <Octicon icon={slashCommand.icon} />
              </ActionList.LeadingVisual>
              <span className="text-normal">{slashCommand.label}</span>
              <ActionList.Description variant="inline">
                {SLASH_COMMAND_PREFIX}
                {slashCommand.command}
              </ActionList.Description>
            </ActionList.Item>
          ),
        }
      })
      setSuggestions(slashCommandSuggestions)
    },
    [manager, textAreaRef],
  )

  const handleMentionsAutoComplete = useCallback(
    async (event: ShowSuggestionsEvent) => {
      // Only allow mentions at the beginning of the input
      // Note: state text is missing the last character updated - using the ref value instead here
      // otherwise will not see full agent list when entering `@`
      const $text = textAreaRef.current?.value ?? ''
      const selectionStart = textAreaRef.current?.selectionStart ?? 0

      if (
        ($text[0] ?? '') !== event.trigger.triggerChar ||
        (selectionStart > 1 && $text[selectionStart - 2]?.match(/\s/))
      )
        return

      let loadedAgents = agents
      if (!loadedAgents) {
        loadedAgents = agentsPath ? await manager.fetchAgents(agentsPath) : []
      }

      let matchingAgents = loadedAgents
        .filter(agent => agent.slug.toLowerCase().includes(event.query.toLowerCase()))
        .slice(0, 10)

      // if the user has previously communicated with an agent, that agent is the only agent allowed in the thread
      // in the future, we won't have this restriction but we may still want to push previously-mentioned agents to the
      // top of the list or something
      let showAgentLimit = false
      const previousAgents = findAgentCorrespondents(messages)
      if (previousAgents.length > 0) {
        const previousAgent = previousAgents[0]!
        if (loadedAgents.length > 1) {
          showAgentLimit = true
        }
        matchingAgents = matchingAgents.filter(agent => agent.slug === previousAgent.name)
      }

      const mentionSuggestions: SuggestionWithRedirect[] = matchingAgents.map(agent => {
        return {
          value: agent.slug,
          key: agent.slug,
          render: $props => (
            <ActionList.Item key={agent.slug} {...$props}>
              <ActionList.LeadingVisual>
                <GitHubAvatar src={agent.avatarUrl} />
              </ActionList.LeadingVisual>
              {agent.name}
              <ActionList.Description variant="inline">
                {MENTION_KEY_PREFIX}
                {agent.slug}
              </ActionList.Description>
              {showAgentLimit && (
                <ActionList.Description variant="block">You’re limited to one agent per thread.</ActionList.Description>
              )}
            </ActionList.Item>
          ),
        }
      })

      if (mentionSuggestions.length === 0) {
        mentionSuggestions.push({
          value: '',
          redirectTo: GOTO_MARKETPLACE_URL,
          render: $props => (
            <ActionList.Group>
              <ActionList.GroupHeading>
                <h3 className="fgColor-default f5 text-bold lh-default">
                  Use extensions to chat with your <br />
                  favorite tools and services
                </h3>
                <p className="mt-2 mb-0 fgColor-muted f6 text-normal lh-condensed">
                  Find the tools you and your team use.
                </p>
              </ActionList.GroupHeading>

              <ActionList.Divider />

              <ActionList.Item key="" {...$props}>
                <span className="text-bold">Go to the marketplace</span>
                <ActionList.TrailingVisual>
                  <ArrowRightIcon />
                </ActionList.TrailingVisual>
              </ActionList.Item>
            </ActionList.Group>
          ),
        })
      }

      setSuggestions(mentionSuggestions)
    },
    [agents, agentsPath, manager, messages, textAreaRef],
  )

  if (!mounted) {
    return <div>{children}</div>
  }

  return (
    <InlineAutocomplete
      fullWidth
      suggestions={overlayVisible ? suggestions : []}
      triggers={[{triggerChar: SLASH_COMMAND_PREFIX}, {triggerChar: MENTION_KEY_PREFIX}]}
      tabInsertsSuggestions={false}
      portalName={COPILOT_CHAT_MENU_PORTAL_ROOT}
      onHideSuggestions={() => {
        setOverlayVisible(false)
        setSuggestions([])
      }}
      onShowSuggestions={event => {
        setOverlayVisible(true)

        if (event.trigger.triggerChar === SLASH_COMMAND_PREFIX) {
          handleSlashCommandsAutoComplete(event)
        }

        if (event.trigger.triggerChar === MENTION_KEY_PREFIX) {
          void handleMentionsAutoComplete(event)
        }
      }}
      onSelectSuggestion={event => {
        if (event.suggestion === '' && suggestions.length === 1) {
          const {redirectTo} = suggestions[0] as SuggestionWithRedirect

          if (redirectTo) {
            window.location.href = redirectTo
          }
        }
      }}
    >
      {children}
    </InlineAutocomplete>
  )
}
