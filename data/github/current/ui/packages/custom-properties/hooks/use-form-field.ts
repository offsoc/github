import {useState} from 'react'

type Validator<ValueType, ValidationError> = (value: ValueType) => ValidationError

interface FormField<ValueType, ValidationError> {
  value: ValueType
  validationError?: ValidationError
}

export function useFormField<ValueType, ValidationError>(
  initialValue: ValueType,
  options?: {validator?: Validator<ValueType, ValidationError>},
) {
  const [field, updateField] = useState<FormField<ValueType, ValidationError>>({
    value: initialValue,
  })

  function update(value: ValueType) {
    const fieldUpdate = {...field, value}
    if (options?.validator) {
      fieldUpdate.validationError = options.validator(value)
    }

    updateField(fieldUpdate)
  }

  function validate() {
    const validationError = options?.validator?.(field.value)
    updateField({...field, validationError})

    return validationError
  }

  function reset() {
    updateField({value: initialValue})
  }

  function isValid() {
    return !field.validationError
  }

  function setFieldError(validationError: ValidationError) {
    updateField(state => ({...state, validationError}))
  }

  return {
    ...field,
    validate,
    update,
    reset,
    isValid,
    setFieldError,
  }
}
