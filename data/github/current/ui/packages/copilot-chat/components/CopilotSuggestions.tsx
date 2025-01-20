import {sendEvent} from '@github-ui/hydro-analytics'
import {PaperAirplaneIcon} from '@primer/octicons-react'
import {ActionList, Octicon, Truncate} from '@primer/react'
import {memo, useCallback} from 'react'

import type {GeneratedSuggestion} from '../utils/copilot-chat-types'
import {copilotFeatureFlags} from '../utils/copilot-feature-flags'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

const CopilotSuggestions = ({panelWidth, suggestionKind}: {panelWidth?: number; suggestionKind?: string}) => {
  const state = useChatState()
  const manager = useChatManager()

  const onClickSuggestion = useCallback(
    (suggestion: GeneratedSuggestion) => {
      void manager.sendChatMessage(
        manager.getSelectedThread(state),
        suggestion.question,
        state.currentReferences,
        state.currentTopic,
        state.context,
      )

      sendEvent('copilot_generated_suggestion_click', {
        skill: suggestion.skill,
        contextType: state.context?.[0]?.type,
        content: suggestionKind === 'initial' ? suggestion.question : null,
      })
    },
    [manager, state, suggestionKind],
  )
  const CopilotSuggestion = memo(function CopilotSuggestion({suggestion}: {suggestion: GeneratedSuggestion}) {
    return (
      <ActionList.Item
        onSelect={() => onClickSuggestion(suggestion)}
        sx={{
          mx: 0,
          border: '1px solid',
          borderColor: 'border.default',
          width: 'fit-content',
        }}
      >
        <ActionList.LeadingVisual>
          <Octicon icon={PaperAirplaneIcon} />
        </ActionList.LeadingVisual>
        <Truncate
          maxWidth={panelWidth ? panelWidth - 80 : copilotLocalStorage.DEFAULT_PANEL_WIDTH}
          title={suggestion.question}
        >
          <span>{suggestion.question}</span>
        </Truncate>
      </ActionList.Item>
    )
  })

  const isLoading = state.messagesLoading.state === 'loading' || !!state.streamingMessage
  const {suggestions} = state

  const showCopilotSuggestions = Boolean(!isLoading && !state.showTopicPicker && state.currentReferences.length === 0)
  return copilotFeatureFlags.staticThreadSuggestions &&
    showCopilotSuggestions &&
    !!suggestions &&
    !!suggestions.suggestions ? (
    <ActionList
      className="copilot-suggestions"
      sx={{pt: 0, pb: suggestionKind === 'initial' ? 2 : 0, display: 'flex', gap: 2, flexWrap: 'wrap'}}
    >
      {suggestionKind !== undefined && (
        <ActionList.Heading as="h2" sx={{fontSize: 0, mx: 0, color: 'fg.muted', fontWeight: 600}}>
          {suggestionHeadingForReferenceType(suggestions.referenceType as string)}
        </ActionList.Heading>
      )}
      {suggestions?.suggestions.map(s => <CopilotSuggestion key={s.question} suggestion={s} />)}
    </ActionList>
  ) : null
}

function suggestionHeadingForReferenceType(referenceType?: string): string {
  if (!referenceType) return 'Ask anything:'
  return `Ask about the ${referenceType.replace(/-/g, ' ')}:`
}

export default memo(CopilotSuggestions)
