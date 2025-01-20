import {ColorPicker} from '@github-ui/color-picker'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useDynamicTextareaHeight} from '@github-ui/use-dynamic-textarea-height'
import {Box, Button, FormControl, Textarea, TextInput, useOnOutsideClick} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {type FormEvent, forwardRef, type KeyboardEvent, useReducer, useRef, useState} from 'react'

import type {NewOption} from '../../../api/columns/contracts/single-select'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {getInitialState} from '../../../helpers/initial-state'
import {isPlatformMeta} from '../../../helpers/util'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {SingleSelectToken} from './single-select-token'

const formStyles: BetterSystemStyleObject = {display: 'flex', flexDirection: 'column', overflow: 'hidden'}

const dialogBodyStyles: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  overflowY: 'auto',
}

interface SingleSelectOptionModalProps {
  initialOption: NewOption
  onSave: (updatedOption: NewOption) => void
  onCancel: () => void
}

/** Submit on cmd/ctrl enter. */
const onKeyDown = (ev: KeyboardEvent<HTMLFormElement>) => {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (ev.key === 'Enter' && isPlatformMeta(ev)) ev.currentTarget.requestSubmit()
}

/**
 * Remove extra fields such as `nameHtml` and `descriptionHtml` so we don't display those outdated values. Consumers
 * should reapply those values, ie by spreading them back onto the object.
 */
const stripExtraFields = ({name, color, description}: NewOption): NewOption => ({name, color, description})

export const SingleSelectOptionModal = ({initialOption, onSave, onCancel}: SingleSelectOptionModalProps) => {
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  /** Works like useState but instead of overwriting the full value, we merge in a partial value. */
  const [option, updateOption] = useReducer((current: NewOption, changes: Partial<NewOption>) => {
    setShowValidationErrors(false)
    return {...current, ...changes}
  }, stripExtraFields(initialOption))

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault() // prevent page reload
    onSave({
      ...option,
      name: replaceShortCodesWithEmojis(option.name),
      description: replaceShortCodesWithEmojis(option.description),
    })
  }

  const onInvalid = (ev: FormEvent) => {
    ev.preventDefault() // prevent native validation messages
    setShowValidationErrors(true)
  }

  const containerRef = useRef<HTMLDivElement>(null)

  // Dialog doesn't use Overlay or call `useOnOutsideClick` under the hood. This means that
  // it doesn't get registered as an overlay in the stack, which means it doesn't intercept
  // and stop propagating clicks. This means that if there are any open `Overlay`s underneath
  // this `Dialog`, clicks in this dialog will register as clicks outside of those overlays,
  // causing them to try to close.
  // We can prevent this by registering a fake `useOnClickOutside` hook to make this look like
  // a regular `Overlay`. Clicks inside will no-op and the hook will prevent them from propagating
  // to other overlays; clicks outside need to have `preventDefault` called on them to stop them
  // from propagating.
  useOnOutsideClick({containerRef, onClickOutside: e => e.preventDefault()})

  return (
    <Dialog
      title={initialOption.name ? 'Edit option' : 'New option'}
      onClose={onCancel}
      width="medium"
      ref={containerRef}
      aria-label={initialOption.name ? 'Edit option dialog' : 'New option dialog'}
      renderBody={() => (
        // By default there is no way to wrap the footer and body in one element, so we
        // have to custom-render the footer inside the body. Otherwise we can't use `submit`
        // button to submit the form
        <Box
          as="form"
          onSubmit={onSubmit}
          onInvalid={onInvalid}
          onKeyDown={onKeyDown}
          // Stopping blur propagation fixes a bug where the table thinks the cell editor was
          // blurred when it was really an input inside this dialog.
          onBlur={e => e.stopPropagation()}
          sx={formStyles}
        >
          <Dialog.Body sx={dialogBodyStyles}>
            <LabelPreview option={option} />

            <NameInput
              value={option.name}
              onChange={name => updateOption({name})}
              showValidation={showValidationErrors}
            />

            <ColorPicker value={option.color} onChange={color => updateOption({color})} label="Color" />

            <DescriptionInput
              value={option.description}
              onChange={description => updateOption({description})}
              showValidation={showValidationErrors}
            />
          </Dialog.Body>

          <Dialog.Footer>
            <Button onClick={onCancel} sx={{marginRight: 1}}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Dialog.Footer>
        </Box>
      )}
    />
  )
}

interface InputProps {
  value: string
  onChange: (value: string) => void
  showValidation: boolean
}

const NameInput = forwardRef<HTMLInputElement, InputProps>(function NameInput({value, onChange, showValidation}, ref) {
  const showRequiredError = showValidation && value.trim() === ''
  const autocompleteProps = useEmojiAutocomplete()

  return (
    <FormControl required>
      <FormControl.Label>Label text</FormControl.Label>

      <InlineAutocomplete {...autocompleteProps} fullWidth>
        <TextInput
          ref={ref}
          value={value}
          onChange={ev => onChange(ev.target.value)}
          block
          name="Label text"
          validationStatus={showRequiredError ? 'error' : undefined}
          aria-invalid={showRequiredError ? 'true' : undefined}
          pattern=".*\S+.*" // disallow whitespace-only labels
          {...testIdProps('single-select-option-text-input')}
        />
      </InlineAutocomplete>

      {showRequiredError && <FormControl.Validation variant="error">Label text is required</FormControl.Validation>}
    </FormControl>
  )
})

const DescriptionInput = ({value, onChange}: InputProps) => {
  const maxLength = getInitialState().projectLimits.singleSelectDescriptionMaxLength

  const elementRef = useRef<HTMLTextAreaElement | null>(null)

  const heightSx = useDynamicTextareaHeight({
    minHeightLines: 0,
    maxHeightLines: 12,
    elementRef,
    value,
  })

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <FormControl>
      <FormControl.Label>Description</FormControl.Label>

      <InlineAutocomplete {...autocompleteProps} fullWidth>
        <Textarea
          ref={elementRef}
          value={value}
          onChange={ev => onChange(ev.target.value)}
          block
          name="Description"
          // Don't worry about showing validation errors for this because the browser should
          // typically prevent the user from typing more than maxLength characters. If it
          // doesn't, we'll catch it server-side.
          maxLength={maxLength}
          sx={{
            '& textarea': {
              ...heightSx,
              resize: 'vertical',
            },
          }}
        />
      </InlineAutocomplete>

      <FormControl.Caption>Visible in group headers and value pickers</FormControl.Caption>
    </FormControl>
  )
}

interface LabelPreviewProps {
  option: NewOption
}

const LabelPreview = ({option}: LabelPreviewProps) => (
  <Box
    as="figure"
    sx={{
      p: 3,
      borderRadius: 2,
      m: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'canvas.subtle',
    }}
  >
    <figcaption className="sr-only">Preview</figcaption>
    <SingleSelectToken option={option} />
  </Box>
)
