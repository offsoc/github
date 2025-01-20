import {Box, Textarea} from '@primer/react'
import {useCallback, useRef, type FormEvent} from 'react'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {PaperAirplaneIcon, SquareFillIcon} from '@primer/octicons-react'
import {usePlaygroundState, usePlaygroundManager} from '../../../utils/playground-manager'

// TODO: This code could be shared from copilot-chat (if exported)
function SubmitButton({isDisabled, onSubmit}: {isDisabled?: boolean; onSubmit: () => void}) {
  return (
    <IconButtonWithTooltip
      variant="invisible"
      size="small"
      onClick={onSubmit}
      icon={PaperAirplaneIcon}
      aria-label="Send now"
      disabled={isDisabled}
      label="Send now"
      tooltipDirection="w"
    />
  )
}

export function PlaygroundChatInput() {
  const manager = usePlaygroundManager()
  const messagesState = usePlaygroundState()

  const MIN_HEIGHT = 44
  const MAX_HEIGHT = 300

  const text = messagesState.chatInput
  const setText = useCallback(
    (_text: string) => {
      manager.setChatInput(_text)
    },
    [manager],
  )

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const textAreaScrollContainer = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    if (messagesState.isLoading) return
    if (text.trim().length === 0) return

    manager.sendMessage(messagesState, text)
    setText('')
  }

  const handleInput = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      setText((e.target as HTMLTextAreaElement).value)
    },
    [setText],
  )

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key === 'Escape') {
      e.preventDefault()
      manager.stopStreaming()
    }

    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      await handleSubmit()
    }
  }

  useLayoutEffect(() => {
    let tries = 0

    function adjustHeight() {
      if (!textAreaRef.current || !textAreaScrollContainer.current) return

      const currentScrollPosition = textAreaScrollContainer.current.scrollTop

      tries++
      if (textAreaRef.current.scrollHeight === 0 && tries < 10) {
        // because this is (often) in a Portal, useLayoutEffect() can run before we're inserted in the DOM, and we are
        // thus unable to get a correct scrollHeight. in that case, let's try again in a bit
        setTimeout(adjustHeight, 1)
      }

      textAreaRef.current.style.height = '0'
      const scrollHeight = textAreaRef.current.scrollHeight
      const containerHeight = Math.min(scrollHeight, MAX_HEIGHT)

      // textareaPreviewRef.current.style.height = `${scrollHeight}px`
      textAreaRef.current.style.height = `${scrollHeight}px`
      textAreaScrollContainer.current.style.height = `${containerHeight}px`
      textAreaScrollContainer.current.scrollTop = currentScrollPosition
    }

    adjustHeight()
  }, [text, textAreaRef])

  const StopButton = ({onSubmit}: {onSubmit: () => void}) => {
    return (
      <IconButtonWithTooltip
        variant="invisible"
        size="small"
        onClick={onSubmit}
        icon={SquareFillIcon}
        aria-label="Stop response"
        label="Stop"
        tooltipDirection="w"
      />
    )
  }

  return (
    <Box
      className="copilot-chat-input"
      sx={{
        bg: 'canvas.subtle',
        position: 'relative',
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: 'var(--borderRadius-medium)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'end',
        gap: 2,
        backgroundColor: 'canvas.default',
        px: 2,
        mr: 3,

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
      <Box
        as="form"
        sx={{
          display: 'flex',
          alignItems: 'end',
          flexGrow: 1,
          '.copilot-chat-textarea::placeholder': {userSelect: 'none'},
        }}
        onSubmit={handleSubmit}
      >
        <Box
          ref={textAreaScrollContainer}
          className="copilot-chat-textarea-scroll-container"
          sx={{
            maxHeight: '30dvh',
            minHeight: `${MIN_HEIGHT}px`,
            overflowY: 'auto',
            position: 'relative',
            '> div:first-child': {position: 'static'},
            flexGrow: 1,
          }}
        >
          <Textarea
            // id={copilotChatTextAreaId}
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
            disabled={messagesState.chatClosed}
            // onScroll={synchronizeScroll}
            onInput={handleInput}
            placeholder="Type your prompt…"
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
                background: 'transparent',
                caretColor: 'var(--fgColor-default, var(--color-fg-default))',
                overflowY: 'hidden',
                px: 2,
                py: '12px',
                verticalAlign: 'middle',
                resize: 'none',
                zIndex: 1,
              },
              ':focus-within': {
                boxShadow: 'none',
              },
            }}
          />
        </Box>

        <span className="mb-2">
          {messagesState.isLoading ? (
            <StopButton
              onSubmit={() => {
                manager.stopStreaming()
              }}
            />
          ) : (
            <SubmitButton
              isDisabled={text.trim().length === 0 || messagesState.isLoading || messagesState.chatClosed}
              onSubmit={() => {
                handleSubmit()
              }}
            />
          )}
        </span>
      </Box>
    </Box>
  )
}
