import {sendEvent} from '@github-ui/hydro-analytics'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Heading, Octicon, Spinner, Text, useFocusZone} from '@primer/react'
import type React from 'react'
import {type UIEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {COPILOT_PATH, isDocset} from '../utils/copilot-chat-helpers'
import type {CopilotChatState} from '../utils/copilot-chat-reducer'
import {copilotFeatureFlags} from '../utils/copilot-feature-flags'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {ChatInput} from './ChatInput'
import {ChatMessage} from './ChatMessage'
import CopilotSuggestions from './CopilotSuggestions'
import {CurrentChatReferences} from './CurrentChatReferences'
import {MenuPortalContainer, MessagesPortalContainer} from './PortalContainerUtils'
import TopicIndexedMessage from './TopicIndexedMessage'
import {TopicPicker} from './TopicPicker'

interface Suggestion {
  heading: string
  content: string
}

const Messages = ({
  messages,
  isWaitingOnCopilot,
  inputRef,
  onMessageReceived,
  panelWidth,
}: Pick<CopilotChatState, 'messages' | 'isWaitingOnCopilot'> & {
  inputRef: React.RefObject<HTMLTextAreaElement>
  onMessageReceived: ({forceScroll}: {forceScroll?: boolean}) => void
  panelWidth?: number
}) => {
  const state = useChatState()
  const {showTopicPicker} = state
  const [focusZoneEnabled, setFocusZoneEnabled] = useState(true)
  const focusableElements = useRef<HTMLElement[]>([])

  const memoizedDependencies = useMemo(
    () => ({
      messages,
      isWaitingOnCopilot,
    }),
    [messages, isWaitingOnCopilot],
  )

  const {containerRef} = useFocusZone(
    {
      focusInStrategy: () => {
        const activeElement = document.activeElement as HTMLElement
        return focusableElements.current.includes(activeElement)
          ? activeElement
          : focusableElements.current[focusableElements.current.length - 1]
      },
      focusableElementFilter: element => {
        // if has class `message-container`
        if (element.classList.contains('message-container')) {
          if (!focusableElements.current.includes(element)) {
            focusableElements.current.push(element)
          }
          return true
        }
        return false
      },
      disabled: !focusZoneEnabled,
    },
    [memoizedDependencies],
  )

  const latestMessage = state.streamingMessage ?? messages[messages.length - 1]
  const lastLatestMessageId = useRef(latestMessage?.id)
  const lastReferenceCount = useRef(state.currentReferences.length)
  const hasSuggestionsRef = useRef(!!state.suggestions)

  // Scroll all the way to the bottom when:
  // - This component first loads
  // - A new message is posted
  // - A new reference is added
  // - The content of the latest message changes (i.e. streaming is happening) and the scroll position is at the bottom.
  // - Follow up suggestions have been added after streaming completes
  useEffect(() => {
    if (
      lastLatestMessageId.current !== latestMessage?.id ||
      lastReferenceCount.current < state.currentReferences.length ||
      latestMessage?.error?.isError ||
      (!hasSuggestionsRef.current && !!state.suggestions)
    ) {
      onMessageReceived({forceScroll: true})
      lastLatestMessageId.current = latestMessage?.id
      hasSuggestionsRef.current = !!state.suggestions
    } else {
      onMessageReceived({forceScroll: false})
    }
    lastReferenceCount.current = state.currentReferences.length
  }, [
    lastLatestMessageId,
    latestMessage?.id,
    latestMessage?.content,
    latestMessage?.error,
    onMessageReceived,
    state.currentReferences,
    state.suggestions,
  ])

  return (
    <>
      <h2 className="sr-only">Copilot Chat</h2>
      {!showTopicPicker ? (
        <Box
          ref={containerRef as React.RefObject<HTMLDivElement>}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
            flexGrow: 1,
          }}
        >
          <Box className="copilot-messages-container" sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <TopicIndexedMessage />
            {messages.map((message, i) => (
              <ChatMessage
                key={i}
                isLatestMessage={message.role === 'assistant' && i === messages.length - 1}
                message={message}
                inputRef={inputRef}
                panelWidth={panelWidth}
                setParentFocusZoneEnabled={setFocusZoneEnabled}
              />
            ))}

            {state.streamingMessage && (
              <ChatMessage
                message={state.streamingMessage}
                isStreaming
                isLatestMessage={true}
                panelWidth={panelWidth}
              />
            )}
          </Box>
          {!showTopicPicker && state.currentReferences.length > 0 && <CurrentChatReferences />}
        </Box>
      ) : (
        <TopicPicker />
      )}
    </>
  )
}

const Loading = () => {
  return (
    <Box sx={{m: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Spinner size="large" />
      <Box
        sx={{
          p: 3,
          color: 'fg.subtle',
        }}
      >
        Loading conversation…
      </Box>
    </Box>
  )
}

const Error = () => {
  const {mode, reviewLab} = useChatState()
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '2',
        alignItems: 'center',
        py: 3,
        pr: 3,
        pl: mode === 'immersive' ? 3 : 2,
        color: 'fg.subtle',
      }}
    >
      <Octicon icon={AlertIcon} />
      Failed to load previous messages.
      {reviewLab && <>&nbsp;You are in a review lab. Please check that you are connected to the Developer VPN.</>}
    </Box>
  )
}

export const Chat = ({
  inputRef,
  panelWidth,
}: {
  inputRef?: React.RefObject<HTMLTextAreaElement>
  panelWidth?: number
}) => {
  const state = useChatState()
  const manager = useChatManager()
  const {
    currentReferences,
    messagesLoading,
    threadsLoading,
    topicLoading,
    currentTopic,
    messages,
    mode,
    selectedThreadID,
    showTopicPicker,
    context,
  } = state
  const thread = manager.getSelectedThread(state)
  const suggestions = useMemo(() => getSuggestions(), [])

  const chatTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const textAreaRef = inputRef || chatTextAreaRef
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrolledToBottomRef = useRef(true)

  useEffect(() => {
    if (thread && messages.length > 0) {
      manager.showTopicPicker(false)
    }
  }, [thread, messages.length, manager])

  useEffect(() => {
    if (!selectedThreadID || mode === 'assistive') return

    const threadPath = `${COPILOT_PATH}/c/${selectedThreadID}`
    if (window.location.pathname === threadPath || messages.length === 0) return

    history.pushState(null, '', threadPath)
  }, [selectedThreadID, mode, messages.length])

  useEffect(() => {
    const topicID = currentTopic ? (isDocset(currentTopic) ? currentTopic.name : String(currentTopic.id)) : null
    const createThreadAsync = async () => {
      if (!copilotFeatureFlags.staticThreadSuggestions) return
      try {
        const newThreadId = await manager.createThread()
        copilotLocalStorage.selectedThreadID = newThreadId?.id || null
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create a new thread for suggestions.')
      }
    }
    if (currentTopic && !selectedThreadID) {
      void createThreadAsync()
    }
    if (selectedThreadID && currentTopic) {
      copilotLocalStorage.setSelectedTopic(selectedThreadID, topicID)
    }
  }, [manager, selectedThreadID, currentTopic])

  useEffect(() => {
    setTimeout(() => {
      textAreaRef.current?.focus()
    }, 1)
  }, [textAreaRef])

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!copilotFeatureFlags.staticThreadSuggestions) return
      if (!state.selectedThreadID) return

      const suggestionContext = state.context?.[0] ?? state.currentTopic

      if (suggestionContext && state.selectedThreadID) {
        await manager.generateSuggestions(suggestionContext, state.selectedThreadID)
      }
    }

    void generateSuggestions()

    return () => {
      manager.clearSuggestions()
    }
  }, [manager, state.context, state.currentTopic, state.selectedThreadID])

  const handleUserSubmit = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()
      if (trimmedContent === '') return

      await manager.sendChatMessage(
        thread,
        content,
        currentReferences,
        currentTopic,
        context,
        undefined,
        state.customInstructions,
        state.knowledgeBases,
      )
    },
    [context, currentReferences, currentTopic, manager, state.customInstructions, state.knowledgeBases, thread],
  )

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLElement
    // This calculation can be finnicky with fractional pixels. If we're within 1px of the bottom, we are close enough.
    scrolledToBottomRef.current = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
  }, [])

  const onMessageReceived = useCallback(({forceScroll}: {forceScroll?: boolean}) => {
    if (!messagesContainerRef.current) return // This is not expected
    if (!scrolledToBottomRef.current && !forceScroll) return // The user has scrolled up, let's not scroll them back down

    // Depending on the screen size and the mode, we might either have a scroll
    // container around the messages, or we might use the window scroll.
    if (isScrollable(messagesContainerRef.current)) {
      messagesContainerRef.current.scrollTo(0, messagesContainerRef.current.scrollHeight)
    } else {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [])

  const isLoading = messagesLoading.state === 'loading' && state.selectedThreadID && !showTopicPicker
  const isError = messagesLoading.state === 'error' || threadsLoading.state === 'error'
  const isLoaded = messagesLoading.state === 'loaded'
  const shouldShowChatInput = !showTopicPicker
  // We store this at the first render and don't change it because we don't want the suggested prompts to suddenly pop up
  // when the popover is dismissed. Instead we'll show prompts on subsequent loads if the popover is dismissed.
  const [renderedPopoverOnFirstLoad] = useState(state.renderAttachKnowledgeBaseHerePopover)
  // If there is a popover or a reference attached then we shouldn't show the suggested prompts
  const shouldShowSuggestedPrompts = Boolean(
    !isLoading &&
      !state.currentTopic &&
      !showTopicPicker &&
      messages.length === 0 &&
      topicLoading.state === 'loaded' &&
      !renderedPopoverOnFirstLoad &&
      currentReferences.length === 0,
  )

  return (
    <>
      <Box
        className="copilot-chat-messages"
        onScroll={handleScroll}
        ref={messagesContainerRef}
        sx={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          scrollbarGutter: 'stable',
        }}
      >
        {isLoading && <Loading />}
        {isError && <Error />}
        {isLoaded && !isLoading && (
          <Messages {...state} inputRef={textAreaRef} onMessageReceived={onMessageReceived} panelWidth={panelWidth} />
        )}
        <MessagesPortalContainer />
      </Box>
      {shouldShowSuggestedPrompts && (
        <Box
          className="copilot-chat-messages"
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            px: 3,
            mb: 3,
            scrollbarGutter: 'stable',
          }}
        >
          {suggestions.map((s, i) => (
            <SuggestedPrompt
              key={i}
              heading={s.heading}
              content={s.content}
              onSubmit={() => {
                void manager.sendChatMessage(
                  manager.getSelectedThread(state),
                  s.content,
                  state.currentReferences,
                  state.currentTopic,
                  state.context,
                )
                sendEvent('copilot_chat_suggestion_click', {
                  topic: state.currentTopic?.name,
                })
              }}
            />
          ))}
        </Box>
      )}
      {!isLoading && shouldShowChatInput && (
        <Box
          className="copilot-chat-input copilot-chat-input-outer"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: 'auto',
            px: 3,
            pb: 3,
            // So messages don't overlap the outline when input is focussed
            zIndex: 1,
          }}
        >
          {messages.length === 0 && !state.showTopicPicker && (
            <CopilotSuggestions panelWidth={panelWidth} suggestionKind="initial" />
          )}
          <ChatInput
            textAreaRef={textAreaRef}
            onSubmit={handleUserSubmit}
            isLoading={state.isWaitingOnCopilot || state.slashCommandLoading.state === 'loading'}
            isStreaming={!!state.streamingMessage}
            panelWidth={panelWidth}
          />
        </Box>
      )}
      <MenuPortalContainer />
    </>
  )
}

function isScrollable(element: HTMLElement): boolean {
  if (!element.scrollTo) return false // This happens in the jest tests on CI

  return window.getComputedStyle(element).overflowY === 'auto'
}

function SuggestedPrompt({heading, content, onSubmit}: {heading: string; content: string; onSubmit: () => void}) {
  return (
    <Button
      sx={{
        bg: 'canvas.default',
        height: 'auto',
        minWidth: 'auto',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        flex: '1 1 49%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={onSubmit}
    >
      <Heading
        as="h3"
        sx={{
          textAlign: 'center',
          fontSize: 1,
          m: 0,
          mb: 1,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        {heading}
      </Heading>
      {/* @ts-expect-error - TS doesn't like text-wrap yet */}
      <Text
        as="p"
        sx={{
          fontSize: 0,
          fontWeight: 400,
          textAlign: 'center',
          color: 'fg.muted',
          m: 0,
          textWrap: 'balance',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        {content}
      </Text>
    </Button>
  )
}

function getSuggestions(): Suggestion[] {
  const categories = shuffle(Object.keys(suggestedPrompts)).slice(0, 4)
  return categories.map(c => ({
    heading: c,
    content: shuffle(suggestedPrompts[c]!)[0]!,
  }))
}

const suggestedPrompts: Record<string, string[]> = {
  'Languages & frameworks': [
    'Show me Python beginner projects.',
    "Explain Java's garbage collection.",
    'Start me off with Node.js.',
    'Introduce me to Django best practices.',
  ],
  'Tools & environments': [
    'Set up a local development environment.',
    'Demonstrate the basics of Docker.',
    'Get me started with Git.',
    'Recommend popular VS Code extensions.',
  ],
  'Open source & contribution': [
    'Suggest 10 open source projects I can contribute to.',
    'Walk me through the GitHub Pull Request flow.',
    'How do I start my own open source project?',
    "Guide me through contributing to React's codebase.",
  ],
  'Best practices & concepts': [
    'Explain the SOLID principles of object-oriented design.',
    'Introduce me to test-driven development.',
    'Describe common design patterns.',
    'Teach me about RESTful API design.',
  ],
  'Web development': [
    'Guide me through creating a basic website.',
    'Introduce HTML5 and CSS3 features.',
    'Explain responsive web design.',
    'Start me off with Tailwind CSS.',
  ],
  'Databases & data': [
    'Get me started with SQL queries.',
    'Recommend popular NoSQL databases.',
    'How to back up a database?',
    'Give a walkthrough on normalizing a database.',
  ],
  'Algorithms & data structures': [
    'Teach me basic sorting algorithms.',
    'Explain binary search trees.',
    'Introduce me to graph algorithms.',
    'What is a hash table?',
  ],
  'Security & authentication': [
    'Give a guide on basic web security.',
    'Show me how to set up OAuth.',
    "What's a JSON Web Token?",
    'Describe common encryption techniques.',
  ],
  'Mobile development': [
    'Kickstart my journey with Android development.',
    'Introduce me to iOS app basics.',
    'Recommend cross-platform mobile frameworks.',
    'Give a guide to the app store submission process.',
  ],
  'Cloud & DevOps': [
    'Start me off with AWS basics.',
    'How do I deploy apps on Azure DevOps?',
    'Introduce me to Kubernetes.',
    'What are the basics of continuous integration/continuous deployment?',
  ],
  'Frontend frameworks & libraries': [
    'Get me started with React.',
    'Walk me through Vue.js essentials.',
    'What are some best practices in Angular development?',
    'How do I use Svelte for web apps?',
  ],
  'Performance & optimization': [
    'Teach me about website performance optimization.',
    'Explain database indexing benefits.',
    'What are some tips to optimize JavaScript code?',
    'Give a guide to efficient API caching.',
  ],
}

function shuffle<T>(list: T[]): T[] {
  const shuffled = list.slice() // make a copy of the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // choose a random index between 0 and i
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}
