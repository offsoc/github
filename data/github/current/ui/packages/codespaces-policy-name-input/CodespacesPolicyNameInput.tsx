// Note the `input:codespaces-policy-form#handlePolicyNameChange` below.
// This component is expected to be nested inside the codespaces-policy-form-element catalyst component.

import {TextInput, FormControl} from '@primer/react'
import React from 'react'
import type {FormEvent} from 'react'

export interface CodespacesPolicyNameInputProps {
  existingPolicyName?: string
}

export function CodespacesPolicyNameInput({existingPolicyName}: CodespacesPolicyNameInputProps) {
  const [value, setValue] = React.useState(existingPolicyName || '')
  const [showError, setShowError] = React.useState(false)

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value
    const trimmedValue = newValue.trim()
    setValue(newValue)
    setShowError(trimmedValue.length > 64 || trimmedValue.length === 0)
  }

  const validationError = () => {
    const trimmedValue = value.trim()
    if (trimmedValue.length > 64) return 'Policy name is too long (maximum is 64 characters)'
    if (trimmedValue.length === 0) return "Policy name can't be blank"
  }
  const validationStatus = () => (showError ? 'error' : undefined)

  return (
    <article>
      <form>
        <FormControl required={true}>
          <FormControl.Label>Policy name</FormControl.Label>
          <TextInput
            value={value}
            onChange={handleInputChange}
            validationStatus={validationStatus()}
            data-action="input:codespaces-policy-form#handlePolicyNameChange"
            data-testid="codespaces-policy-name-input"
            sx={{width: '50%', maxWidth: '500px'}}
          />
          {showError && <FormControl.Validation variant="error">{validationError()}</FormControl.Validation>}
        </FormControl>
      </form>
    </article>
  )
}
