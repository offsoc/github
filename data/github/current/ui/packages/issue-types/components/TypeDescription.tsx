import {forwardRef} from 'react'
import {Resources} from '../constants/strings'
import {FormControl, TextInput} from '@primer/react'

type TypeDescriptionProps = {
  disabled?: boolean
  description: string
  error: string
  setDescription: (name: string) => void
  setError: (error: string) => void
}

export const TypeDescription = forwardRef<HTMLInputElement, TypeDescriptionProps>(function TypeDescription(
  {error, setError, description, setDescription, disabled = false},
  forwardedRef,
) {
  return (
    <FormControl sx={{my: 3}} disabled={disabled}>
      <FormControl.Label>{Resources.descriptionLabel}</FormControl.Label>
      <TextInput
        value={description}
        onChange={e => {
          setError('')
          setDescription(e.target.value)
        }}
        placeholder={Resources.descriptionPlaceholder}
        name="description"
        data-testid="issue-type-description"
        sx={{width: '100%'}}
        validationStatus={error ? 'error' : undefined}
        ref={forwardedRef}
      />
      {error && <FormControl.Validation variant="error">{error}</FormControl.Validation>}
    </FormControl>
  )
})
