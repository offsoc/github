import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {PointerBox} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {useEmojiAutocomplete} from '../../../../hooks/common/use-emoji-autocomplete'
import {BorderlessTextInput} from '../../../common/borderless-text-input'
import {FieldValue} from './core'

export const SidebarTextInput = ({
  submitValue,
  defaultValue,
  validationFn,
  type = 'text',
  withEmojiPicker = false,
  placeholder,
}: {
  submitValue: (newValue: string) => void
  defaultValue: string
  validationFn?: (newValue: string) => string | undefined
  withEmojiPicker?: boolean
  type?: 'text' | 'date'
  placeholder: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [invalidMessage, setInvalidMessage] = useState<string | undefined>(undefined)
  const [value, setValue] = useState(defaultValue)
  useEffect(() => {
    if (inputRef.current && inputRef.current === document.activeElement) return
    setValue(defaultValue)
  }, [defaultValue])
  // Updates validation message state and returns true if valid
  const validate = (newValue: string): boolean => {
    const message = validationFn?.(newValue)
    setInvalidMessage(message)
    return !message
  }

  const handleSubmitValue = (newValue: string) => {
    if (validate(newValue)) {
      submitValue(newValue)
    }
  }

  const resetValue = useCallback(() => setValue(defaultValue), [defaultValue])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmitValue(value)
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      resetValue()
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value
    setValue(newValue)
    validate(newValue)
  }

  const onBlur = () => {
    if (value !== defaultValue && validate(value)) {
      submitValue(value)
    } else {
      resetValue()
    }
  }

  const input = (
    <FieldValue
      interactable
      as={BorderlessTextInput}
      ref={inputRef}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type={type}
      value={value}
      placeholder={placeholder}
      aria-label="Edit value"
    />
  )

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <>
      {withEmojiPicker ? (
        <InlineAutocomplete {...autocompleteProps} fullWidth>
          {input}
        </InlineAutocomplete>
      ) : (
        input
      )}
      {invalidMessage ? (
        <PointerBox
          sx={{
            position: 'absolute',
            zIndex: 100,
            fontSize: 0,
            mt: '12px',
            py: 1,
            px: 2,
            bg: 'danger.subtle',
            color: 'fg.default',
            borderColor: 'danger.muted',
          }}
          caret="top-left"
        >
          <span>{invalidMessage}</span>
        </PointerBox>
      ) : null}
    </>
  )
}
