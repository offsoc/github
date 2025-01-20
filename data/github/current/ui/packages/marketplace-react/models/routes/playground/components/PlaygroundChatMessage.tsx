import CopilotBadge from '@github-ui/copilot-chat/components/CopilotBadge'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, IconButton, RelativeTime, Text} from '@primer/react'
import type {PlaygroundMessage} from '../../../utils/model-client'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {useUser} from '@github-ui/use-user'

import {transformContentToHTML} from '@github-ui/copilot-chat/utils/markdown'
import {usePlaygroundManager} from '../../../utils/playground-manager'
import {PlaygroundError} from './PlaygroundError'
import {TokenLimitReachedResponseErrorDescription} from '../../../utils/playground-types'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {ThumbsdownIcon, ThumbsupIcon, SyncIcon} from '@primer/octicons-react'
import {useCallback, useRef, useState} from 'react'
import {FeedbackDialog} from './GettingStartedDialog/FeedbackDialog'
import {Feedback} from './GettingStartedDialog/types'
import {sendFeedback} from '../../../utils/feedback'

export enum FeedbackState {
  POSITIVE,
  NEGATIVE,
}

export type PlaygroundChatMessageProps = {
  isLoading: boolean
  isError: boolean
  index: number
  message: PlaygroundMessage
  handleRegenerate: (index: number) => void
  lastIndex: boolean
}

export function PlaygroundChatMessage(props: PlaygroundChatMessageProps) {
  const {message, index, handleRegenerate, lastIndex} = props

  const htmlMessage = transformContentToHTML(message.message)

  const user = useUser()
  const manager = usePlaygroundManager()
  const model = manager.model
  const returnFocusRef = useRef(null)
  const [submittedFeedback, setSubmittedFeedback] = useState<
    FeedbackState.POSITIVE | FeedbackState.NEGATIVE | undefined
  >(undefined)

  const positiveFeedbackSubmitted = submittedFeedback === FeedbackState.POSITIVE
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  // In order to submit negative feedback, the user must click the thumbs down icon and then click the "Submit feedback" button in a dialog
  const [isNegativeFeedbackConfirmed, setIsNegativeFeedbackConfirmed] = useState(false)

  const isAssistantMessage = message.role === 'assistant' && message.message
  const isLastResponse = isAssistantMessage && lastIndex

  const determineMessageMeta = (_message: PlaygroundMessage) => {
    switch (_message.role) {
      case 'error':
      case 'assistant':
        return {
          name: model.name,
          avatarUrl: model.logo_url,
        }
      case 'user':
        return {
          name: user.currentUser?.name ?? 'User',
          avatarUrl: user.currentUser?.avatarUrl ?? '/github.png',
        }
      default:
        return {
          name: 'default',
          avatarUrl: '/github.png',
        }
    }
  }

  const messageMeta = determineMessageMeta(message)

  const handleSubmit = async () => {
    const feedback = {
      satisfaction: Feedback.POSITIVE,
      reasons: [],
      feedbackText: '',
      contactConsent: false,
    }
    try {
      const res = await sendFeedback({model, feedback})
      if (res.ok) {
        setSubmittedFeedback(FeedbackState.POSITIVE)
      }
    } catch (error) {
      return error
    }
  }

  const handleClick = useCallback(() => {
    setIsFeedbackDialogOpen(true)
    setSubmittedFeedback(FeedbackState.NEGATIVE)
  }, [])

  return (
    <Box
      key={index}
      sx={{
        pb: 2,
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
        className="message-container"
        data-testid="playground-chat-message"
        tabIndex={0}
        // ref={myRef}
        sx={{
          p: 1,
          // borderBottom: '1px solid var(--borderColor-muted, var(--color-border-muted))',
          fontSize: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 1,
          }}
        >
          <CopilotBadge
            isLoading={props.isLoading}
            isError={props.isError}
            customIcon={<GitHubAvatar src={messageMeta.avatarUrl} size={12} square={message.role !== 'user'} />}
          />

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
                {messageMeta.name}
              </Text>
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: 400,
                  color: 'fg.subtle',
                }}
              >
                {messageMeta.name !== 'user' && props.isLoading ? (
                  `Responding...`
                ) : (
                  <RelativeTime date={message.timestamp} format="relative" />
                )}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      {props.isError ? (
        <PlaygroundError
          message={message.message}
          showResetButton={message.message === TokenLimitReachedResponseErrorDescription}
        />
      ) : (
        <div className="position-relative">
          <Box sx={{p: 1}}>
            <MarkdownViewer verifiedHTML={htmlMessage} />
          </Box>
          {isAssistantMessage && !props.isLoading && (
            <Box
              className="message-actions"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                // Floating actions for previous messages
                position: isLastResponse ? undefined : 'absolute',
                bottom: isLastResponse ? undefined : '-2.25rem',
                backgroundColor: 'var(--bgColor-default, var(--color-canvas-default))',
                borderRadius: isLastResponse ? undefined : 2,
                boxShadow: isLastResponse ? undefined : 'var(--shadow-floating-small)',
                // Opacity and pointer events rules instead of changing `display` let us animate the actions in and out
                opacity: isLastResponse ? undefined : 0,
                pointerEvents: isLastResponse ? undefined : 'none',
                // This is not ideal but required to ensure the shadow is not completely clipped
                left: isLastResponse ? undefined : '2px',

                // Adds a lil invisible target to make hovering less precise so they don’t disappear if you miss a bit
                '&::before': {
                  // Not on the inline actions though
                  content: isLastResponse ? undefined : '""',
                  // Make it wider than it is tall to cover the triangular hover path
                  inset: '-0.5rem -0.75rem',
                  zIndex: -1,
                  position: 'absolute',
                },
              }}
            >
              {!isNegativeFeedbackConfirmed && (
                <IconButton
                  sx={{
                    backgroundColor: positiveFeedbackSubmitted ? 'canvas.subtle' : 'canvas.default',
                  }}
                  icon={ThumbsupIcon}
                  variant="invisible"
                  aria-label="Positive"
                  onClick={handleSubmit}
                  disabled={positiveFeedbackSubmitted}
                />
              )}
              {submittedFeedback !== FeedbackState.POSITIVE && (
                <IconButton
                  sx={{
                    backgroundColor: isNegativeFeedbackConfirmed ? 'canvas.subtle' : 'canvas.default',
                  }}
                  icon={ThumbsdownIcon}
                  variant="invisible"
                  aria-label="Negative"
                  onClick={handleClick}
                  disabled={isNegativeFeedbackConfirmed}
                />
              )}
              <CopyToClipboardButton textToCopy={message.message} ariaLabel={'Copy to clipboard'} />
              {isLastResponse && (
                <IconButton
                  icon={SyncIcon}
                  variant="invisible"
                  aria-label="Regenerate"
                  onClick={() => handleRegenerate(index)}
                />
              )}
            </Box>
          )}
          {submittedFeedback === FeedbackState.NEGATIVE && (
            <FeedbackDialog
              isNegativePreSelected
              setIsNegativeFeedbackConfirmed={setIsNegativeFeedbackConfirmed}
              returnFocusRef={returnFocusRef}
              isFeedbackDialogOpen={isFeedbackDialogOpen}
              setIsFeedbackDialogOpen={setIsFeedbackDialogOpen}
            />
          )}
        </div>
      )}
    </Box>
  )
}
