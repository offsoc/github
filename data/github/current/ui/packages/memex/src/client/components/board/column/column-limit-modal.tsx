import {testIdProps} from '@github-ui/test-id-props'
import {FormControl, TextInput, useOnOutsideClick} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {type FormEvent, forwardRef, type KeyboardEvent, useEffect, useId, useRef, useState} from 'react'

import {isPlatformMeta} from '../../../helpers/util'
import {Resources} from '../../../strings'

interface ColumnLimitModalProps {
  initialColumnLimit: number | null | undefined
  onSave: (columnLimit: number | undefined) => Promise<void> | void
  onCancel: () => void
}

const COLUMN_LIMIT_MAX = 1_000_000

/** Submit on cmd/ctrl enter. */
const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (e.key === 'Enter' && isPlatformMeta(e)) e.currentTarget.requestSubmit()
}

export const ColumnLimitModal = ({initialColumnLimit, onSave, onCancel}: ColumnLimitModalProps) => {
  // when a form is submitted, we show validation errors
  const [invalidSubmission, setInvalidSubmission] = useState(false)
  const [columnLimit, setColumnLimit] = useState<number | ''>(initialColumnLimit ?? '')

  const initialFocusRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault() // prevent page reload
    return onSave(columnLimit === '' ? undefined : columnLimit)
  }

  const onInvalid = (e: FormEvent) => {
    e.preventDefault() // prevent native validation messages
    setInvalidSubmission(true)
  }

  useEffect(() => initialFocusRef.current?.focus(), [])

  const containerRef = useRef<HTMLDivElement>(null)

  // Blocks clicks potentially propagating unintentionally when the dialog is open
  useOnOutsideClick({containerRef, onClickOutside: e => e.preventDefault()})

  const formId = useId()
  return (
    <Dialog
      title={`${initialColumnLimit && initialColumnLimit > 0 ? Resources.edit : Resources.set} column limit`}
      onClose={onCancel}
      role="dialog"
      aria-modal="true"
      width="medium"
      ref={containerRef}
      footerButtons={[
        {type: 'button', onClick: onCancel, content: 'Cancel'},
        {
          form: formId,
          type: 'submit',
          content: 'Save',
          buttonType: 'primary',
        },
      ]}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <form id={formId} onSubmit={onSubmit} onInvalid={onInvalid} onKeyDown={onKeyDown}>
        <ColumnLimitInput
          ref={initialFocusRef}
          value={columnLimit}
          onChange={setColumnLimit}
          invalidSubmission={invalidSubmission}
        />
      </form>
    </Dialog>
  )
}

type ColumnLimitInputValue = number | ''

interface ColumnLimitInputProps {
  value: ColumnLimitInputValue
  onChange: (value: ColumnLimitInputValue) => void
  invalidSubmission: boolean
}

const ColumnLimitInput = forwardRef<HTMLInputElement, ColumnLimitInputProps>(function ColumnLimitInput(
  {value, onChange, invalidSubmission},
  ref,
) {
  const validationError = validateColumnLimit(value)
  const showValidationError = invalidSubmission && validationError !== undefined

  return (
    <FormControl>
      <FormControl.Label>Column limit</FormControl.Label>

      <TextInput
        ref={ref}
        value={value}
        onChange={e => onChange(Number.isNaN(e.target.valueAsNumber) ? '' : e.target.valueAsNumber)}
        onKeyDown={e => {
          // prevents certain keys from being entered into the input
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
        }}
        block
        name="Column limit"
        validationStatus={showValidationError ? 'error' : undefined}
        aria-invalid={showValidationError ? 'true' : undefined}
        type="number"
        min={0}
        max={COLUMN_LIMIT_MAX}
        {...testIdProps('column-limit-text-input')}
      />

      {showValidationError && <FormControl.Validation variant="error">{validationError}</FormControl.Validation>}
      <FormControl.Caption>A limit on the number of items in a column</FormControl.Caption>
    </FormControl>
  )
})

/**
 * Validates the column limit input
 * @param value
 * @returns an error message if the value is invalid, otherwise undefined
 */
export function validateColumnLimit(value: ColumnLimitInputValue) {
  if (value === '') return undefined // allow empty value

  if (Number.isNaN(value) || !Number.isInteger(value)) {
    return Resources.fieldMustBeAnInteger
  }

  if (value > COLUMN_LIMIT_MAX) {
    return Resources.columnLimitExceeded
  }

  if (value < 0) {
    return Resources.fieldMustBePositiveOrZero
  }
}
