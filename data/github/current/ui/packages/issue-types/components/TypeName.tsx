import {FormControl, TextInput} from '@primer/react'
import {Resources} from '../constants/strings'
import {forwardRef} from 'react'
import {ISSUE_TYPE_NAME_LIMIT} from '../constants/constants'

type TypeTitleProps = {
  disabled?: boolean
  name: string
  error: string
  setName: (name: string) => void
  setError: (error: string) => void
}

export const TypeName = forwardRef<HTMLInputElement, TypeTitleProps>(function TypeName(
  {error, setError, name, setName, disabled = false},
  forwardedRef,
) {
  return (
    <FormControl sx={{my: 3}} disabled={disabled}>
      <FormControl.Label>{Resources.nameLabel}</FormControl.Label>
      <TextInput
        value={name}
        onChange={e => {
          setError('')
          setName(e.target.value)
        }}
        maxLength={ISSUE_TYPE_NAME_LIMIT}
        placeholder={Resources.namePlaceholder}
        name="name"
        data-testid="issue-type-name"
        sx={{width: '50%'}}
        validationStatus={error ? 'error' : undefined}
        ref={forwardedRef}
      />
      {error && <FormControl.Validation variant="error">{error}</FormControl.Validation>}
    </FormControl>
  )
})
