import '@github/g-emoji-element'
import type {Emoji} from '@primer/react/drafts'
import type {SuggestionOptions} from './suggestions'
import {useMentionSuggestions, type Mentionable} from './suggestions/use-mention-suggestions'
import {useReferenceSuggestions, type Reference} from './suggestions/use-reference-suggestions'
import {forwardRef, useEffect, useMemo, useRef} from 'react'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {useEmojiSuggestions} from './suggestions/use-emoji-suggestions'
import {Textarea, useRefObjectAsForwardedRef, type TextareaProps} from '@primer/react'
import {subscribe as subscribeToMarkdownPasting} from '@github/paste-markdown'
import {useDynamicTextareaHeight} from '@github-ui/use-dynamic-textarea-height'
import {useAutocompleteTriggersAndSuggestions} from '@github-ui/inline-autocomplete/hooks/use-autocomplete-triggers-and-suggestions'

interface MarkdownInputProps extends Omit<TextareaProps, 'onChange'> {
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>
  disabled?: boolean
  placeholder?: string
  id: string
  maxLength?: number
  fullHeight?: boolean
  isDraggedOver: boolean
  emojiSuggestions?: SuggestionOptions<Emoji>
  emojiTone?: number
  mentionSuggestions?: SuggestionOptions<Mentionable>
  referenceSuggestions?: SuggestionOptions<Reference>
  labelledBy?: string
  minHeightLines: number
  maxHeightLines: number
  monospace: boolean
  pasteUrlsAsPlainText: boolean
  /** Use this prop to control visibility instead of unmounting, so the undo stack and custom height are preserved. */
  visible: boolean
}

const emptyArray: [] = [] // constant reference to avoid re-running effects

export const MarkdownInput = forwardRef<HTMLTextAreaElement, MarkdownInputProps>(
  (
    {
      value,
      onChange,
      disabled,
      placeholder,
      id,
      maxLength,
      onKeyDown,
      fullHeight,
      isDraggedOver,
      emojiSuggestions,
      emojiTone,
      mentionSuggestions,
      referenceSuggestions,
      labelledBy,
      minHeightLines,
      maxHeightLines,
      visible,
      monospace,
      pasteUrlsAsPlainText,
      ...props
    },
    forwardedRef,
  ) => {
    const emojiConfig = useMemo(() => ({tone: emojiTone}), [emojiTone])
    const {trigger: emojiTrigger, calculateSuggestions: calculateEmojiSuggestions} = useEmojiSuggestions(
      emojiSuggestions ?? emptyArray,
      emojiConfig,
    )
    const {trigger: mentionsTrigger, calculateSuggestions: calculateMentionSuggestions} = useMentionSuggestions(
      mentionSuggestions ?? emptyArray,
    )
    const {trigger: referencesTrigger, calculateSuggestions: calculateReferenceSuggestions} = useReferenceSuggestions(
      referenceSuggestions ?? emptyArray,
    )

    const triggersAndSuggestions = useMemo(
      () => [
        {trigger: emojiTrigger, suggestionsCalculator: calculateEmojiSuggestions},
        {trigger: mentionsTrigger, suggestionsCalculator: calculateMentionSuggestions},
        {trigger: referencesTrigger, suggestionsCalculator: calculateReferenceSuggestions},
      ],
      [
        calculateEmojiSuggestions,
        calculateMentionSuggestions,
        calculateReferenceSuggestions,
        emojiTrigger,
        mentionsTrigger,
        referencesTrigger,
      ],
    )

    const {triggers, suggestions, setSuggestionEvent, onHideSuggestions} =
      useAutocompleteTriggersAndSuggestions(triggersAndSuggestions)

    const ref = useRef<HTMLTextAreaElement>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)

    useEffect(() => {
      const subscription =
        ref.current &&
        subscribeToMarkdownPasting(ref.current, {defaultPlainTextPaste: {urlLinks: pasteUrlsAsPlainText}})
      return subscription?.unsubscribe
    }, [pasteUrlsAsPlainText])

    const heightStyles = useDynamicTextareaHeight({
      // if fullHeight is enabled, there is no need to compute a dynamic height (for perfs reasons)
      disabled: fullHeight || !visible,
      maxHeightLines,
      minHeightLines,
      elementRef: ref,
      value,
    })

    // See https://github.com/github/issues/issues/8807#issuecomment-1952063523. Workaround until the React bug is fixed (https://github.com/facebook/react/issues/28360)
    // This sets the DOM node directly to avoid the Safari bug where the user couldn't type after removing a line
    useEffect(() => {
      if (ref.current) {
        ref.current.value = value
      }
    })

    return (
      <InlineAutocomplete
        triggers={triggers}
        suggestions={suggestions}
        onShowSuggestions={setSuggestionEvent}
        onHideSuggestions={onHideSuggestions}
        firstOptionSelectionMode="selected"
        style={{flex: 'auto'}}
        tabInsertsSuggestions
      >
        <Textarea
          id={id}
          ref={ref}
          placeholder={placeholder}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-label={labelledBy ? undefined : 'Markdown value'}
          aria-labelledby={labelledBy}
          onChange={onChange}
          sx={{
            borderStyle: 'none',
            boxShadow: 'none',
            height: fullHeight ? '100%' : undefined,
            outline: theme => {
              return isDraggedOver ? `dashed 2px ${theme.colors.border.default}` : undefined
            },
            outlineOffset: '-4px',
            display: visible ? undefined : 'none',
            '&: focus-within': {
              boxShadow: 'none',
              outline: 'none',
            },
            '& textarea': {
              lineHeight: 'var(--text-body-lineHeight-medium, 1.4285)',
              resize: fullHeight ? 'none' : 'vertical',
              p: 3,
              fontFamily: monospace ? 'mono' : 'normal',
              ...heightStyles,
            },
          }}
          {...props}
        />
      </InlineAutocomplete>
    )
  },
)
MarkdownInput.displayName = 'MarkdownInput'
