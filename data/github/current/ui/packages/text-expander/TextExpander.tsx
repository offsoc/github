import '@github/text-expander-element'

import {Box, Textarea, type TextareaProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useEffect, useRef} from 'react'

export interface TextExpanderProps {
  suggestionsUrlIssue: string
  suggestionsUrlMention: string
  suggestionsUrlEmoji: string
  value: string
  setValue: (value: string) => void
  sx?: BetterSystemStyleObject
  textareaProps?: Omit<TextareaProps, 'sx' | 'value' | 'ref' | 'onChange' | 'onKeyDown'>
}

export function TextExpander({
  suggestionsUrlIssue,
  suggestionsUrlMention,
  suggestionsUrlEmoji,
  value,
  setValue,
  sx,
  textareaProps,
}: TextExpanderProps) {
  const textExpanderRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const textExpanderValueHandler = (ev: React.KeyboardEvent) => {
    if (
      // prevent the handler from submitting forms unless ctrl/cmd+enter since text areas allow new lines
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      (ev.code === 'Enter' && !(ev.metaKey || ev.ctrlKey)) ||
      // prevent the handler from submitting forms or tabbing off until values are synced up
      (ev.code === 'Tab' && textareaRef.current?.value !== value)
    ) {
      ev.stopPropagation()
    }
  }

  const onTextExpanderCommitted = useCallback(() => {
    setValue(textareaRef.current?.value || value)
  }, [setValue, value])

  useEffect(() => {
    const innerTextExpanderRef = textExpanderRef.current

    innerTextExpanderRef?.addEventListener('text-expander-committed', onTextExpanderCommitted)

    return () => {
      innerTextExpanderRef?.removeEventListener('text-expander-committed', onTextExpanderCommitted)
    }
  }, [onTextExpanderCommitted])

  return (
    <Box sx={{position: 'relative', ...sx}}>
      <text-expander
        keys=": @ #"
        data-issue-url={suggestionsUrlIssue}
        data-mention-url={suggestionsUrlMention}
        data-emoji-url={suggestionsUrlEmoji}
        ref={textExpanderRef}
      >
        <Textarea
          onChange={event => setValue(event.target.value)}
          onKeyDown={textExpanderValueHandler}
          ref={textareaRef}
          value={value}
          sx={{width: '100%'}}
          {...textareaProps}
        />
      </text-expander>
    </Box>
  )
}
