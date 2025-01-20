import {announce, announceFromElement} from '@github-ui/aria-live'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {AlertFillIcon, LinkIcon, MarkGithubIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Flash, IconButton, RelativeTime, Text, useFocusZone} from '@primer/react'
import {clsx} from 'clsx'
import type React from 'react'
import {useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react'

import {buildMessage, findAuthor, isAgent, isDocset} from '../utils/copilot-chat-helpers'
import type {CopilotChatManager} from '../utils/copilot-chat-manager'
import type {
  AgentUnauthorizedChatError,
  CopilotAgentError,
  CopilotClientConfirmation,
  SnippetReference,
} from '../utils/copilot-chat-types'
import {copilotFeatureFlags} from '../utils/copilot-feature-flags'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {
  transformContentToHTML,
  transformContentToHTMLWithAnnotations,
  transformContentToHTMLWithCitations,
} from '../utils/markdown'
import styles from './ChatMessage.module.css'
import {type ChatMessageContextProps, ChatMessageProvider, useChatMessage} from './ChatMessageContext'
import {ChatReferences} from './ChatReferences'
import {Confirmation} from './Confirmation'
import CopilotBadge from './CopilotBadge'
import CopilotSuggestions from './CopilotSuggestions'
import {Feedback} from './Feedback'
import {FunctionCallBadge} from './FunctionCallBadge'
import {MentionLink} from './MentionLink'
import {ReactMarkdownRenderer, type ReactReplaceBlock, replaceStringsWithReactContainers} from './ReactMarkdownRenderer'

const reactReplaceBlocks: {[key: string]: ReactReplaceBlock} = {
  'agent-mention': {
    regex: /^@\S+/g,
    renderer: (match: string) => {
      return <MentionLink mention={match} />
    },
  },
}

export interface ChatMessageProps extends ChatMessageContextProps, InnerChatMessageProps {}

type InnerChatMessageProps = {
  isLatestMessage?: boolean
  inputRef?: React.RefObject<HTMLInputElement> | React.RefObject<HTMLTextAreaElement>
  isLoading?: boolean
  isStreaming?: boolean
  excludeFeedback?: boolean
  setParentFocusZoneEnabled?: (enabled: boolean) => void
  panelWidth?: number
}

const InnerChatMessage = ({isLatestMessage, isStreaming, panelWidth, ...props}: InnerChatMessageProps) => {
  const state = useChatState()
  const manager = useChatManager()
  const {message} = useChatMessage()
  const author = findAuthor(message, state.currentUserLogin)
  const isCopilot = author.name === 'Copilot'
  const isUser = author.type === 'user'
  const isAgentError = isCopilot && message.agentErrors?.length
  const isError = !isAgentError && isCopilot && message.error ? message.error.isError : false
  const sent = new Date(Date.parse(message.createdAt || ''))
  const isLoading = props.isLoading || isStreaming
  const renderFeedback = isCopilot && !props.excludeFeedback && !isLoading
  const focusableElements = useRef<HTMLElement[]>([])
  const myRef = useRef<HTMLDivElement>(null)
  const footer = useMessageFooter()
  const feedbackSubmitted = useRef(false)
  const referencesSummaryRef = useRef<HTMLElement>(null)
  const isInterrupted = message.interrupted
  const hasClientConfirmations = message.clientConfirmations && message.clientConfirmations.length > 0

  const shouldShowMessageActions =
    !isError &&
    (renderFeedback || (isCopilot && !!message.content && !isStreaming && copilotFeatureFlags.copyMessage)) &&
    !message.confirmations
  const fetchAgents = useCallback(async () => {
    return state.agentsPath ? await manager.fetchAgents(state.agentsPath) : []
  }, [manager, state.agentsPath])
  const {content, reactReplaceMatches} = useMemo(() => {
    if (copilotFeatureFlags.reactMarkdown) {
      const {output, matches} = replaceStringsWithReactContainers(reactReplaceBlocks, message.id, message.content)
      return {content: output, reactReplaceMatches: matches}
    }
    return {content: message.content, reactReplaceMatches: []}
  }, [message.content, message.id])

  const {html, hasCitations, referenceMap} = useMemo(() => {
    if (isCopilot && message.intent === 'ask-docs') {
      return transformContentToHTMLWithCitations(
        content,
        message.references,
        state.mode === 'assistive',
        state.agents,
        fetchAgents,
      )
    } else if (copilotFeatureFlags.vulnerabilityAnnotations) {
      return {
        html: transformContentToHTMLWithAnnotations(
          content,
          message.references,
          message.copilotAnnotations,
          state.mode === 'assistive',
          state.agents,
          fetchAgents,
        ),
        hasCitations: false,
        referenceMap: null,
      }
    } else {
      return {
        html: transformContentToHTML(
          content,
          message.references,
          [],
          state.mode === 'assistive',
          state.agents,
          fetchAgents,
        ),
        hasCitations: false,
        referenceMap: null,
      }
    }
  }, [
    isCopilot,
    message.intent,
    content,
    message.references,
    message.copilotAnnotations,
    state.mode,
    state.agents,
    fetchAgents,
  ])

  const renderContentArea =
    (isCopilot && props.isLoading) ||
    html ||
    message.references?.length ||
    message.confirmations?.length ||
    message.skillExecutions?.length ||
    isError ||
    isAgentError

  useFocusZone(
    {
      containerRef: myRef,
      bindKeys: 128, // FocusKeys.Tab,
      focusableElementFilter: el => {
        // When the feedback dialog opens, the elements in it would be added to focusableElements.
        // We want to prevent that since focsuableElements is used to find out when to hand focus back
        // to the parent focusZone. Also, manually add and remove the reference actions since they are always rendered
        // but their visibility is controlled by the details component.
        if (
          !feedbackSubmitted.current &&
          !focusableElements.current.includes(el) &&
          !el.classList.contains('reference-action')
        ) {
          focusableElements.current.push(el)
        }
        return true
      },
      getNextFocusable: (direction, from) => {
        const currentIndex = focusableElements.current.indexOf(from as HTMLElement)
        if (direction === 'next') {
          if (currentIndex + 2 > focusableElements.current.length) {
            // We've tabbed past the end of this message, re-enable the parent focus zone
            // and focus the input.
            props.setParentFocusZoneEnabled?.(true)
            from?.setAttribute('tabindex', '-1')
            focusableElements.current[0]?.setAttribute('tabindex', '0')
            return props.inputRef?.current || undefined
          } else {
            // We've tabbed into the message, disable the parent focusZone.
            props.setParentFocusZoneEnabled?.(false)
            if (currentIndex !== -1) {
              // Return the next item as long as we're not in the feedback dialog.
              // FocusZone should do this, but it gets confused when we remove the feedback buttons.
              return focusableElements.current[currentIndex + 1]
            }
          }
        }
        if (direction === 'previous') {
          if (currentIndex === 1) {
            // We've shift+tabbed back to the message, re-enable the parent focuszone.
            props.setParentFocusZoneEnabled?.(true)
          }
          if (currentIndex > 0) {
            // Return the previous item as long as we're not in the feedback dialog.
            return focusableElements.current[currentIndex - 1]
          }
        }
        return undefined
      },
    },
    [],
  )

  useEffect(() => {
    if (isLatestMessage && isStreaming) {
      announce('Copilot is responding')
    }
  }, [isLatestMessage, isStreaming])

  useEffect(() => {
    if (isLatestMessage && !isStreaming && myRef.current) {
      announceFromElement(myRef.current)
    }
  }, [isLatestMessage, isStreaming])

  const onFeedbackSubmitted = useCallback(() => {
    // Remove the feedback buttons from the list of focusableElements, since they are replaced
    // with a disabled button.
    focusableElements.current = focusableElements.current.filter(
      (e: HTMLElement) => !e.classList.contains('feedback-action'),
    )
    feedbackSubmitted.current = true
  }, [])

  const handleConfirmationAction = useCallback(
    async (clientConfirmation: CopilotClientConfirmation, confirmationTitle: string) => {
      await manager.sendChatMessage(
        manager.getSelectedThread(state),
        `@${author.name} ${capitalize(clientConfirmation.state)} Confirmation: ${confirmationTitle}`,
        message.references ?? [],
        state.currentTopic,
        state.context,
        clientConfirmation,
      )
    },
    [manager, state, author.name, message.references],
  )

  const onLinkClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement
      const href = target.href
      const reference = message.references?.find(r => (r as SnippetReference).url === href)
      if (reference && state.mode === 'immersive') {
        manager.selectReference(reference)
        event.preventDefault()
      }
    },
    [manager, message.references, state.mode],
  )

  const onReferencesToggle = useCallback((e: React.SyntheticEvent) => {
    const target = e.target as HTMLDetailsElement
    if (target.open && referencesSummaryRef.current) {
      // References are shown. Add all the reference actions to focusable elements.
      const elements = target.querySelectorAll<HTMLElement>('.reference-action')
      const insertIndex = focusableElements.current.indexOf(referencesSummaryRef.current)
      if (insertIndex >= 0) {
        focusableElements.current = [
          ...focusableElements.current.slice(0, insertIndex + 1),
          ...elements,
          ...focusableElements.current.slice(insertIndex + 1),
        ]
      }
    } else {
      // References are hidden, remove the reference actions from focusable elements.
      focusableElements.current = focusableElements.current.filter(el => !el.classList.contains('reference-action'))
    }
  }, [])

  const messageActionBackgroundColor =
    state.mode === 'immersive'
      ? 'var(--bgColor-default, var(--color-canvas-default))'
      : 'var(--overlay-bgColor, var(--color-canvas-overlay, #161b22))'

  return (
    <Box
      className="message-container"
      tabIndex={0}
      ref={myRef}
      sx={{
        p: 3,
        borderBottom:
          state.mode === 'assistive' && !isLatestMessage
            ? '1px solid var(--borderColor-muted, var(--color-border-muted))'
            : 'none',
        fontSize: 1,

        '&:hover, &:focus-within': {
          '.message-actions': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        },
        // We don’t want delay for keyboard users
        '&:hover': {
          '.message-actions': {
            transition: 'opacity 0.1s ease-in-out',
            transitionDelay: '0.2s',
          },
        },
      }}
    >
      <Box
        as="h2"
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontSize: 1,
        }}
      >
        {isCopilot ? (
          <CopilotBadge isLoading={isLoading} isError={isError && message.error?.type !== 'agentUnauthorized'} />
        ) : (
          <Box
            sx={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitHubAvatar src={author.avatarURL} size={24} />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <Box sx={{display: 'flex', gap: 2, alignItems: 'baseline'}}>
            <Text
              data-testid="chat-message-author-name"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {author.name}
            </Text>
            {hasClientConfirmations && (
              <Text sx={{fontWeight: 'normal'}}>{message.clientConfirmations?.[0]?.state} the action</Text>
            )}
            <Text
              sx={{
                fontSize: 0,
                fontWeight: 400,
                color: 'fg.subtle',
              }}
            >
              {isCopilot && isLoading ? `Responding...` : <RelativeTime date={sent} format="relative" />}
            </Text>
          </Box>
        </Box>
      </Box>
      {renderContentArea && (
        <div className={clsx(styles.message)}>
          <Box
            className="js-snippet-clipboard-copy-unpositioned"
            sx={{
              '.snippet-clipboard-content': {
                position: 'relative',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'canvas.subtle',
                marginBottom: 3,
                pre: {
                  marginBottom: 0,
                },
                zIndex: 1,

                'clipboard-copy': {
                  width: '28px',
                  height: '28px',
                },
              },
            }}
          >
            {isCopilot &&
              message.skillExecutions?.map((skillExecution, i) => {
                return (
                  <FunctionCallBadge key={i} functionCall={skillExecution} manager={manager} panelWidth={panelWidth} />
                )
              })}
            {isCopilot && props.isLoading ? (
              <>
                <LoadingSkeleton variant="rounded" height="12px" width="random" />
                <LoadingSkeleton variant="rounded" height="12px" width="random" />
                <LoadingSkeleton variant="rounded" height="12px" width="random" />
              </>
            ) : copilotFeatureFlags.reactMarkdown && !hasClientConfirmations ? (
              <ReactMarkdownRenderer
                onLinkClick={onLinkClick}
                body={html}
                matches={reactReplaceMatches}
                reactReplaceBlocks={reactReplaceBlocks}
              />
            ) : (
              !hasClientConfirmations && <MarkdownViewer onLinkClick={onLinkClick} verifiedHTML={html} />
            )}
            {isUser && (
              <ChatReferences
                references={message.references ?? []}
                referenceMap={referenceMap}
                showReferenceNumbers={hasCitations}
                onToggle={onReferencesToggle}
                summaryRef={referencesSummaryRef}
              />
            )}
            {isError ? <ErrorMessage manager={manager} /> : null}
            {message.agentErrors?.length && <AgentErrors errors={message.agentErrors} />}
            {isInterrupted ? (
              <Flash
                data-testid="chat-message-interrupted"
                sx={{
                  fontSize: 1,
                  px: 2,
                  py: 1,
                  zIndex: -1,
                }}
              >
                Copilot was interrupted before it could finish this message.
              </Flash>
            ) : null}
            {(isCopilot || isAgent(author)) &&
              message.confirmations?.map((confirmation, i) => {
                return (
                  <Confirmation
                    confirmation={confirmation}
                    handleConfirmation={handleConfirmationAction}
                    key={i}
                    isLatestMessage={isLatestMessage}
                  />
                )
              })}
          </Box>
          {isLatestMessage && shouldShowMessageActions && copilotFeatureFlags.followUpThreadSuggestions && (
            <CopilotSuggestions panelWidth={panelWidth} />
          )}
          {shouldShowMessageActions && (
            <Box
              className="message-actions"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',

                // Floating actions for previous messages
                position: isLatestMessage ? undefined : 'absolute',
                bottom: isLatestMessage ? undefined : '-2.25rem',
                // Needs to match the backgroundColor of the parent overlay so weird things don’t happen in color modes
                backgroundColor: messageActionBackgroundColor,
                borderRadius: isLatestMessage ? undefined : 2,
                boxShadow: isLatestMessage ? undefined : 'var(--shadow-floating-small)',
                // Opacity and pointer events rules instead of changing `display` let us animate the actions in and out
                opacity: isLatestMessage ? undefined : 0,
                pointerEvents: isLatestMessage ? undefined : 'none',

                // Adds a lil invisible target to make hovering less precise so they don’t disappear if you miss a bit
                '&::before': {
                  // Not on the inline actions though
                  content: isLatestMessage ? undefined : '""',
                  // Make it wider than it is tall to cover the triangular hover path
                  inset: '-0.5rem -0.75rem',
                  zIndex: -1,
                  position: 'absolute',
                },
              }}
            >
              {renderFeedback && (
                <Feedback
                  returnFocusRef={myRef}
                  setParentFocusZoneEnabled={props.setParentFocusZoneEnabled}
                  onFeedbackSubmitted={onFeedbackSubmitted}
                />
              )}
              {isCopilot && !!message.content && !isStreaming && copilotFeatureFlags.copyMessage && (
                <CopyToClipboardButton
                  textToCopy={(message.content ?? '') + footer}
                  ariaLabel="Copy to clipboard"
                  size="small"
                  className="d-flex flex-items-center"
                />
              )}
            </Box>
          )}
        </div>
      )}
    </Box>
  )
}

export const ChatMessage = ({message, ...props}: ChatMessageProps) => (
  <ChatMessageProvider message={message}>
    <InnerChatMessage {...props} />
  </ChatMessageProvider>
)

function ErrorMessage({manager}: {manager: CopilotChatManager}) {
  const {message} = useChatMessage()
  const {error} = message
  if (!error) return null
  switch (error.type) {
    case 'agentUnauthorized':
      return <AgentUnauthorizedError error={error} manager={manager} />
    case 'agentRequest':
      return <AgentErrors errors={[error.details]} />
    default:
      return (
        <Flash
          variant="warning"
          sx={{
            fontSize: 1,
            px: 2,
            py: 1,
            zIndex: -1,
          }}
        >
          {error.message || 'Something went wrong'}
        </Flash>
      )
  }
}

function AgentUnauthorizedError({error, manager}: {error: AgentUnauthorizedChatError; manager: CopilotChatManager}) {
  const {details} = error
  const [dismissed, setDismissed] = useState(false)
  const onDismiss = useCallback(() => {
    setDismissed(true)
    manager.dispatch({
      type: 'MESSAGE_ADDED',
      message: buildMessage({
        role: 'user',
        content: `Dismissed the connection with ${details.name}.`,
      }),
    })
    manager.dispatch({
      type: 'MESSAGE_ADDED',
      message: buildMessage({
        role: 'assistant',
        content: `I was unable to connect you to ${details.name} because you cancelled the authentication.`,
      }),
    })
  }, [details.name, manager])

  return (
    <div className="position-relative d-flex flex-column flex-items-center gap-3 border rounded-2 p-5">
      {!dismissed && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          aria-label="Close"
          className="position-absolute top-0 right-0 mt-2 mr-2"
          icon={XIcon}
          onClick={onDismiss}
          variant="invisible"
          unsafeDisableTooltip={true}
        />
      )}
      <div className="d-flex flex-items-center gap-2">
        <MarkGithubIcon size={48} className="border circle borderColor-muted" />
        <LinkIcon className="fgColor-muted" />
        <img
          className={clsx('avatar', styles.agentUnauthorizedAvatar, 'border circle borderColor-muted')}
          src={details.avatar_url}
          alt={`icon for ${details.name}`}
        />
      </div>
      <p className="h4 m-0 text-center">Connect with {details.name}</p>
      <p className="fgColor-muted text-center">
        To use the {details.name} extension, you’ll need to connect your GitHub account to your {details.name} account.
      </p>
      {!dismissed && (
        <>
          <Button
            as="a"
            variant="primary"
            size="large"
            className="width-full"
            href={details.authorize_url}
            rel="noopener"
            target="_blank"
          >
            Connect
          </Button>
          <p className="fgColor-muted text-center f6 m-0">Click connect to be redirected to {details.authorize_url}</p>
        </>
      )}
    </div>
  )
}

function AgentErrors({errors}: {errors: CopilotAgentError[]}) {
  return (
    <div className="d-flex flex-column gap-2">
      {errors.map((error, i) => (
        <div className="p-3 border rounded-2" key={i}>
          <div className="text-bold">
            <AlertFillIcon className="mr-1 fgColor-attention" /> {errorTitle(error)}
          </div>
          <div>{error.message}</div>
        </div>
      ))}
    </div>
  )
}

function errorTitle(error: CopilotAgentError) {
  if (error.type === 'http') {
    return `${error.code} ${error.identifier}`
  } else {
    return `${capitalize(error.type)} error`
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function useMessageFooter(): string {
  const {currentTopic} = useChatState()

  // Even though this value won't be used until a user interacts with the copy button, we still need to avoid accessing location during a server render.
  const origin = useSyncExternalStore(
    () => () => {},
    () => location.origin,
    () => '',
  )

  if (!isDocset(currentTopic)) return ''

  const {name, id} = currentTopic

  return `\n\n---\n\nGenerated by Copilot using the [${name}](${origin}/copilot/d/${id}) knowledge base`
}
