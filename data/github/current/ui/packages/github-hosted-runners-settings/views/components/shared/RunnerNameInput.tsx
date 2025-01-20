import {FormControl, TextInput} from '@primer/react'
import type {FormEvent} from 'react'

interface Props {
  runnerName: string
  onChange: (name: string) => void
  validationError: boolean
  onValidationError: (value: boolean) => void
}

export function RunnerNameInput({runnerName, onChange, validationError, onValidationError}: Props) {
  // Can contain only alphanumeric characters, ".", "_", and "-", and be between 1 and 64 characters long.  These
  // requirements should match actions-dotnet/Runner/Service/Server/ArgumentValidation#CheckScaleSetName.
  const runnerNameRegex = /^[a-zA-Z0-9\-_.]{1,64}$/
  const runnerNameValidationId = 'runner-name-validation'

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value)
    onValidationError(!runnerNameRegex.test(e.currentTarget.value))
  }

  return (
    <FormControl required>
      <FormControl.Label>Name</FormControl.Label>
      <TextInput
        aria-label="Hosted runner name"
        aria-invalid={validationError}
        aria-describedby={runnerNameValidationId}
        name="runnerName"
        value={runnerName}
        onChange={handleChange}
        sx={{width: '50%'}}
        data-testid="runner-name-input"
      />
      {validationError && (
        <FormControl.Validation variant="error" id={runnerNameValidationId}>
          Name must be between 1 and 64 characters and may only contain alphanumeric characters, &apos;.&apos;,
          &apos;-&apos;, and &apos;_&apos;.
        </FormControl.Validation>
      )}
    </FormControl>
  )
}
