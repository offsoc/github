import {FormControl, Radio, RadioGroup} from '@primer/react'
import {useRequestFormContext} from '../../contexts/RequestFormContext'

export default function SecretScanningRequestForm() {
  const {formValues, onUpdateForm, readOnly} = useRequestFormContext()
  const {reason} = formValues

  return (
    <RadioGroup
      name="reason"
      required={!readOnly}
      aria-disabled={readOnly}
      onChange={newReason => {
        !readOnly && onUpdateForm({reason: newReason})
      }}
      sx={{
        '.reason_radio:checked:disabled': {
          backgroundColor: 'canvas.subtle',
          borderColor: 'fg.muted',
        },
      }}
    >
      <RadioGroup.Label sx={{color: 'fg.default', fontWeight: 'bold'}}>
        {readOnly ? 'Selected reason' : 'Reason'} for allowing detected secrets
      </RadioGroup.Label>
      <FormControl disabled={readOnly}>
        <Radio className="reason_radio" value="tests" name="tests" checked={reason === 'tests'} readOnly={readOnly} />
        <FormControl.Label sx={{color: 'fg.default'}}>They&apos;re used in tests</FormControl.Label>
        <FormControl.Caption>
          The detected secrets cannot be used to gain access to sensitive information.
        </FormControl.Caption>
      </FormControl>
      <FormControl disabled={readOnly}>
        <Radio
          className="reason_radio"
          value="false_positive"
          name="false_positive"
          checked={reason === 'false_positive'}
          readOnly={readOnly}
        />
        <FormControl.Label sx={{color: 'fg.default'}}>This is a false positive</FormControl.Label>
        <FormControl.Caption>The detected strings are not secrets.</FormControl.Caption>
      </FormControl>
      <FormControl disabled={readOnly}>
        <Radio
          className="reason_radio"
          value="fixed_later"
          name="fixed_later"
          checked={reason === 'fixed_later'}
          readOnly={readOnly}
        />
        <FormControl.Label sx={{color: 'fg.default'}}>This will be fixed later</FormControl.Label>
        <FormControl.Caption>
          The detected secrets are real, and I understand the risks of exposing secrets.
        </FormControl.Caption>
      </FormControl>
    </RadioGroup>
  )
}
