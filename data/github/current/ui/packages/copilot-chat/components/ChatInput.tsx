import {testIdProps} from '@github-ui/test-id-props'
import {useIsPlatform} from '@github-ui/use-is-platform'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {PaperAirplaneIcon, SquareFillIcon} from '@primer/octicons-react'
import {Box, Button, Heading, IconButton, Popover, Textarea} from '@primer/react'
import type {FormEvent, RefObject} from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {copilotChatTextAreaId} from '../utils/constants'
import {findAgentCorrespondents, isRepository} from '../utils/copilot-chat-helpers'
import type {CopilotChatAgent, CopilotChatMessage} from '../utils/copilot-chat-types'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {executePotentialSlashCommand} from '../utils/copilot-slash-commands'
import {useChatAutocomplete} from '../utils/CopilotChatAutocompleteContext'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {Autocomplete} from './Autocomplete'
import {InputTip} from './InputTip'
import {KnowledgeSelectPanel} from './KnowledgeSelectPanel'
import {ReferencesSelectPanel} from './ReferencesSelectPanel'

interface ChatInputProps {
  textAreaRef?: React.RefObject<HTMLTextAreaElement>
  onSubmit?: (text: string) => Promise<void>
  onAbort?: () => void
  isLoading?: boolean
  isStreaming?: boolean
  panelWidth?: number
}

const MAX_HEIGHT = 300

export const ChatInput = (props: ChatInputProps) => {
  const state = useChatState()
  const manager = useChatManager()
  const autocomplete = useChatAutocomplete()
  const {selectedThreadID} = state
  const savedUserMessage = copilotLocalStorage.getSavedMessage(selectedThreadID)
  const [text, setText] = useState(savedUserMessage ?? '')
  const [typingHasStarted, setTypingHasStarted] = useState(false)
  const isMac = useIsPlatform(['mac'])
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textAreaRef = props.textAreaRef || internalRef
  const textareaPreviewRef = useRef<HTMLDivElement>(null)
  const textAreaPreviewContainerRef = useRef<HTMLDivElement>(null)
  const userMessages = state.messages.filter(m => m.role === 'user')
  const recallIndex = useRef(0)

  const hasKnowledgeBases = state.knowledgeBases.length > 0
  // Kick this off in the background so it doesn't block the rest of the chat from loading
  const checkForKnowledgeBases = useCallback(async () => {
    // This is used by the popover so if we don't need to render it, don't check for knowledge bases
    if (state.renderAttachKnowledgeBaseHerePopover) {
      await manager.fetchKnowledgeBases()
    }
  }, [manager, state.renderAttachKnowledgeBaseHerePopover])

  useEffect(() => {
    void checkForKnowledgeBases()
  }, [checkForKnowledgeBases])

  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  const metaKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => (isMac ? e.metaKey : e.ctrlKey)

  // Preload file auto suggestions
  useEffect(() => {
    async function cacheAutocompletionData() {
      const topic = state.currentTopic
      if (!topic || !isRepository(topic)) return

      if (state.currentTopic !== undefined) {
        await autocomplete.fetchAutocompleteSuggestions(topic, '')
      }
    }
    void cacheAutocompletionData()
  }, [autocomplete, state.currentTopic])

  useEffect(() => {
    copilotLocalStorage.setSavedMessage(selectedThreadID, text)
  }, [selectedThreadID, text])

  useLayoutEffect(() => {
    let tries = 0

    function adjustHeight() {
      if (!textAreaRef.current || !textAreaPreviewContainerRef.current || !textareaPreviewRef.current) return

      tries++
      if (textAreaRef.current.scrollHeight === 0 && tries < 10) {
        // because this is (often) in a Portal, useLayoutEffect() can run before we're inserted in the DOM, and we are
        // thus unable to get a correct scrollHeight. in that case, let's try again in a bit
        setTimeout(adjustHeight, 1)
      }

      textAreaRef.current.style.height = '0'
      const scrollHeight = textAreaRef.current.scrollHeight
      const containerHeight = Math.min(scrollHeight, MAX_HEIGHT)

      textareaPreviewRef.current.style.height = `${scrollHeight}px`
      textAreaRef.current.style.height = `${scrollHeight}px`
      textAreaPreviewContainerRef.current.style.height = `${containerHeight}px`
    }

    adjustHeight()
  }, [text, textAreaRef, textareaPreviewRef])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setTypingHasStarted(true)
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      await handleSubmit()
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    } else if (metaKey(e) && e.shiftKey && e.key === 's') {
      e.preventDefault()
      await manager.sendMessageToNewThread(selectedThreadID, text, state.currentReferences, state.context)
    } else if (
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      e.key === 'ArrowUp' &&
      textAreaRef.current &&
      (textAreaRef.current.value === '' || recallIndex.current > 0) &&
      textAreaRef.current.selectionStart === 0 &&
      userMessages?.length > recallIndex.current
    ) {
      e.preventDefault()
      recallIndex.current++
      setText(userMessages[userMessages.length - recallIndex.current]!.content || '')
    } else if (
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      e.key === 'ArrowDown' &&
      recallIndex.current > 0 &&
      textAreaRef.current &&
      textAreaRef.current.selectionStart === textAreaRef.current.value.length
    ) {
      e.preventDefault()
      recallIndex.current--
      if (recallIndex.current === 0) {
        setText('')
      } else {
        setText(userMessages[userMessages.length - recallIndex.current]!.content || '')
      }
    }
    synchronizeScroll()
  }

  const synchronizeScroll = useCallback(() => {
    if (!textAreaRef?.current || !textareaPreviewRef?.current || !textAreaPreviewContainerRef?.current) return

    textareaPreviewRef.current.scrollTop = textAreaRef.current.scrollTop
    textareaPreviewRef.current.scrollLeft = textAreaRef.current.scrollLeft
  }, [textAreaRef])

  const handleSubmit = async (e?: FormEvent) => {
    setTypingHasStarted(false)

    if (state.defaultRecipient && !text.includes(`@${state.defaultRecipient}`)) {
      state.defaultRecipient = undefined
    }

    e?.preventDefault()

    const ranSlashCommand = await executePotentialSlashCommand(text, state, manager)
    if (ranSlashCommand) {
      if (text.trim() === '/new') {
        copilotLocalStorage.setSavedMessageFast(selectedThreadID, null)
      }
      setText('')
      return
    }

    if (!props.isLoading) {
      if (!text) return
      setText('')
      await props.onSubmit?.(text)
    } else {
      props.onAbort?.()
    }
  }

  const handleInput = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      setTypingHasStarted(true)

      if (!textAreaRef?.current) return

      setText((e.target as HTMLTextAreaElement).value)

      recallIndex.current = 0
      synchronizeScroll()
    },
    [synchronizeScroll, textAreaRef],
  )

  const handleStop = () => state.streamer && manager.stopStreaming(state.streamingMessage, state.streamer)

  const shouldShowReferences = state.currentTopic && isRepository(state.currentTopic)
  const shouldShowKnowledge =
    state.renderKnowledgeBases && ((state.currentTopic && isRepository(state.currentTopic)) || !state.currentTopic)
  const placeholderText = props.isLoading
    ? `Copilot is responding…`
    : state.defaultRecipient
      ? undefined
      : 'Ask Copilot'

  if (state.defaultRecipient && text === '' && !typingHasStarted) {
    setText(`@${state.defaultRecipient} `)
  }

  return (
    <div>
      <Popover
        open={shouldShowKnowledge && hasKnowledgeBases && state.renderAttachKnowledgeBaseHerePopover}
        sx={{bottom: '57px'}}
        caret="bottom-left"
      >
        <Popover.Content sx={{mt: 2, width: '300px'}} className="color-shadow-medium">
          <Heading as="h4" sx={{fontSize: 2, mb: 2}}>
            An organization has shared a knowledge base with you
          </Heading>
          <p>
            Select a knowledge base to chat with Copilot and get answers from Markdown documentation stored in GitHub.
          </p>
          <Button
            onClick={() => {
              void manager.dismissAttachKnowledgeBaseHerePopover()
            }}
          >
            Got it
          </Button>
        </Popover.Content>
      </Popover>
      <Box
        className="copilot-chat-input"
        {...testIdProps('copilot-chat-input')}
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: 'canvas.default',
          border: '1px solid var(--borderColor-default, var(--color-border-default))',
          borderRadius: 'var(--borderRadius-medium)',

          '> div': {flex: 1},

          ':focus-within .copilot-keyboard-shortcuts': {
            opacity: 1,
            visibility: 'visible',
          },

          ':has(textarea:focus)': {
            outline: '2px solid var(--focus-outlineColor, var(--color-accent-emphasis))',
            borderColor: 'transparent',
          },
        }}
      >
        {(shouldShowKnowledge || shouldShowReferences) && (
          <div className="d-flex position-absolute" style={{left: 8, bottom: 8}}>
            {shouldShowKnowledge && <KnowledgeSelectPanel panelWidth={props.panelWidth} />}
            {shouldShowReferences && <ReferencesSelectPanel panelWidth={props.panelWidth} />}
          </div>
        )}

        <Box
          as="form"
          onSubmit={handleSubmit}
          className="width-full d-flex flex-column gap-2"
          sx={{
            '.copilot-chat-textarea::placeholder': {userSelect: 'none'},
          }}
        >
          <Box
            ref={textAreaPreviewContainerRef}
            sx={{
              maxHeight: '30dvh',
              overflowY: 'auto',
              flexGrow: 1,
              position: 'relative',
              '> div': {
                display: 'block',
              },
            }}
          >
            <Autocomplete textAreaRef={textAreaRef}>
              <Textarea
                id={copilotChatTextAreaId}
                className="copilot-chat-textarea"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                role="textbox"
                aria-multiline="true"
                block
                ref={textAreaRef}
                resize="none"
                onKeyDown={handleKeyDown}
                onScroll={synchronizeScroll}
                onInput={handleInput}
                placeholder={placeholderText}
                value={text}
                sx={{
                  border: 'none',
                  borderRadius: 0,
                  borderTopLeftRadius: 'var(--borderRadius-medium)',
                  borderTopRightRadius: 'var(--borderRadius-medium)',
                  display: 'contents',
                  '> textarea': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    padding: '8px 12px 2px',
                    background: 'transparent',
                    color: 'transparent',
                    caretColor: 'var(--fgColor-default, var(--color-fg-default))',
                    overflowY: 'hidden',
                    verticalAlign: 'middle',
                    resize: 'none',
                    zIndex: 1,
                  },
                  ':focus-within': {
                    boxShadow: 'none',
                  },
                }}
              />
            </Autocomplete>
            <TextareaPreview
              messages={state.messages}
              text={text}
              textareaPreviewRef={textareaPreviewRef}
              agents={state.agents}
              agentsPath={state.agentsPath}
            />
          </Box>

          <div className="d-flex flex-items-center flex-justify-end gap-2 px-2 pb-2">
            {text.length > 2 && <InputTip />}
            {props.isStreaming ? (
              <StopButton onSubmit={handleStop} />
            ) : (
              <SubmitButton isLoading={props.isLoading} onSubmit={handleSubmit} />
            )}
          </div>
        </Box>
      </Box>
    </div>
  )
}

function TextareaPreview({
  messages,
  text,
  textareaPreviewRef,
  agents,
  agentsPath,
}: {
  messages: CopilotChatMessage[]
  text: string
  textareaPreviewRef: RefObject<HTMLDivElement>
  agents?: CopilotChatAgent[]
  agentsPath?: string
}) {
  const manager = useChatManager()
  const [mention, setMention] = useState('')
  const [textAfterMention, setTextAfterMention] = useState('')
  useEffect(() => {
    if (!textareaPreviewRef.current) return
    const atMentions = text.match(/^@\S+/g)
    if (atMentions && atMentions.length > 0) {
      // Fetch the agents in case they weren't already loaded by the autocomplete.
      if (!agents) {
        agentsPath && void manager.fetchAgents(agentsPath)
        return
      }

      if (agents.length === 0) {
        return
      }
      // if the user has previously communicated with an agent, that agent is the only agent allowed in the thread
      const previousAgents = findAgentCorrespondents(messages)
      let filteredAgents: CopilotChatAgent[]
      if (previousAgents.length > 0) {
        const previousAgent = previousAgents[0]!
        filteredAgents = agents.filter(agent => agent.slug === previousAgent.name)
      } else {
        filteredAgents = agents
      }

      // There should only be a single mention.
      const atMention = atMentions[0]

      // Check if the agents array contains the mention without the '@'
      const mentionSlug = atMention.substring(1)
      const matchingAgent = filteredAgents.find(agent => agent.slug === mentionSlug)
      if (matchingAgent) {
        setMention(atMention)
        setTextAfterMention(text.replace(atMention, ''))
        return
      }
    }

    setMention('')
    setTextAfterMention('')
  }, [agents, agentsPath, manager, messages, text, textareaPreviewRef])

  return (
    <Box
      id="copilot-chat-textarea-preview"
      aria-hidden={true}
      className="textarea-preview"
      ref={textareaPreviewRef}
      role="presentation"
      sx={{
        // The styles and spacing here should mirror the textarea
        bg: 'canvas.default',
        borderRadius: 'var(--borderRadius-medium) var(--borderRadius-medium) 0 0',
        height: 'inherit',
        lineHeight: '20px',
        overflowY: 'hidden',
        padding: '8px 12px 2px',
        position: 'absolute',
        inset: 0,
        whiteSpace: 'pre-wrap',
        zIndex: 0,
        '> .chat-token': {
          backgroundColor: 'var(--bgColor-accent-muted, var(--color-accent-subtle))',
          borderRadius: 'var(--borderRadius-small)',
          color: 'var(--fgColor-accent, var(--color-accent-fg))',
        },
      }}
    >
      {mention ? (
        <>
          <span className="chat-token">{mention}</span>
          {textAfterMention}
        </>
      ) : (
        text
      )}
    </Box>
  )
}

function SubmitButton({isLoading, onSubmit}: {isLoading?: boolean; onSubmit: () => void}) {
  return (
    <IconButton
      variant="invisible"
      size="small"
      onClick={onSubmit}
      icon={PaperAirplaneIcon}
      aria-label="Send now"
      disabled={isLoading}
      tooltipDirection="n"
    />
  )
}

function StopButton({onSubmit}: {onSubmit: () => void}) {
  return (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      variant="invisible"
      size="small"
      unsafeDisableTooltip={true}
      onClick={onSubmit}
      icon={SquareFillIcon}
      aria-label="Stop response"
      tooltipDirection="w"
    />
  )
}
