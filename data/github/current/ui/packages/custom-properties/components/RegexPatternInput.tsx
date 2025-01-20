import {FormControl, TextInput} from '@primer/react'
import {forwardRef} from 'react'

interface RegexPatternInputProps {
  onChange: (value: string) => void
  value: string
  validationError?: string
}

export const RegexPatternInput = forwardRef<HTMLInputElement, RegexPatternInputProps>(
  ({onChange, value, validationError}, forwardedRef) => {
    return (
      <FormControl required>
        <FormControl.Label>Pattern</FormControl.Label>
        <TextInput
          ref={forwardedRef}
          aria-label="Regular expression input"
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!validationError}
          value={value}
          block
        />
        {validationError && <FormControl.Validation variant="error">{validationError}</FormControl.Validation>}
      </FormControl>
    )
  },
)

RegexPatternInput.displayName = 'RegexPatternInput'
