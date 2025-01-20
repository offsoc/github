import {validateRegexValue} from '@github-ui/repos-async-validation/validate-regex-value'
import {FormControl, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useRef, useState} from 'react'

import {RegexPatternInput} from './RegexPatternInput'

export function TestRegexValueDialog({
  onDismiss,
  regexPattern,
  regexPatternValidationError,
  onRegexPatternChange,
  returnFocusRef,
}: {
  onDismiss: () => void
  regexPattern: string
  regexPatternValidationError?: string
  onRegexPatternChange: (value: string) => void
  returnFocusRef: React.RefObject<HTMLElement>
}) {
  const [testValue, setTestValue] = useState('')
  const [valueMatches, setValueMatches] = useState<boolean | undefined>()
  const [checkClicked, setCheckClicked] = useState(false)

  const patternInputRef = useRef<HTMLInputElement>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)

  const checkMatch = async () => {
    setValueMatches(undefined)
    setCheckClicked(true)

    if (!regexPattern || regexPatternValidationError) {
      patternInputRef?.current?.focus()
      return
    }

    if (!testValue) {
      valueInputRef?.current?.focus()
      return
    }

    const match = await validateRegexValue(regexPattern, testValue)
    setValueMatches(match)
    if (!match) {
      valueInputRef?.current?.focus()
    }
  }

  return (
    <Dialog
      onClose={onDismiss}
      title="Test regular expression values"
      returnFocusRef={returnFocusRef}
      width="medium"
      renderBody={() => (
        <Dialog.Body>
          <RegexPatternInput
            ref={patternInputRef}
            onChange={onRegexPatternChange}
            value={regexPattern}
            validationError={
              regexPatternValidationError ||
              (!regexPattern && checkClicked ? 'Regular expression pattern is required' : undefined)
            }
          />
          <FormControl sx={{mt: 3}}>
            <FormControl.Label>Test value</FormControl.Label>
            <TextInput
              ref={valueInputRef}
              aria-label="Test regular expression value"
              value={testValue}
              onChange={e => setTestValue(e.target.value)}
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              onKeyDown={e => e.key === 'Enter' && checkMatch()}
              block
            />
            {valueMatches === undefined && checkClicked && !testValue && (
              <FormControl.Validation variant="error">Test value is required</FormControl.Validation>
            )}
            {valueMatches === false && (
              <FormControl.Validation variant="error">Value does not match pattern</FormControl.Validation>
            )}
            {valueMatches === true && (
              <FormControl.Validation variant="success">Value matches pattern</FormControl.Validation>
            )}
          </FormControl>
        </Dialog.Body>
      )}
      footerButtons={[
        {content: 'Close', onClick: onDismiss, buttonType: 'default'},
        {content: 'Check', onClick: checkMatch, buttonType: 'primary', 'aria-label': 'Check value'},
      ]}
    />
  )
}
