import {useCallback, useState, type RefObject, useEffect} from 'react'
import {useGroupFormContext} from '../contexts/GroupFormContext'
import type {FormField} from '../types'

type Validator<ValueType, ValidationError> = (
  value: ValueType,
) => ValidationError | undefined | Promise<ValidationError> | Promise<undefined>

export function useFormField<ValueType, ValidationError>(
  name: string,
  initialValue: ValueType,
  options?: {
    validator?: Validator<ValueType, ValidationError>
    errorRef?: RefObject<HTMLElement>
    fieldRef?: RefObject<HTMLElement>
  },
): FormField<ValueType, ValidationError> {
  const [value, setValue] = useState<ValueType>(initialValue)
  const [validationError, setValidationError] = useState<ValidationError>()
  const [touched, setTouched] = useState<boolean>(false)
  const form = useGroupFormContext()

  useEffect(() => {
    setValidationError(undefined)
    setTouched(false)
  }, [initialValue])

  const update = useCallback(
    async (newValue: ValueType) => {
      setValue(newValue)
      if (options?.validator) {
        setValidationError(await options.validator(newValue))
      }
      setTouched(true)
    },
    [options, setValue, setValidationError, setTouched],
  )

  const validate = useCallback(async () => {
    const newValidationError = await options?.validator?.(value)
    setValidationError(newValidationError)

    return newValidationError
  }, [options, value, setValidationError])

  const reset = useCallback(() => {
    setValue(initialValue)
    setValidationError(undefined)
    setTouched(false)
  }, [initialValue, setValue, setValidationError, setTouched])

  const isValid = useCallback(() => {
    return !validationError
  }, [validationError])

  const setFieldError = useCallback(
    (newValidationError: ValidationError) => {
      setValidationError(newValidationError)
    },
    [setValidationError],
  )

  useEffect(() => {
    form.update({
      name,
      value,
      validationError,
      touched,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.update, name, value, validationError, touched, reset])

  return {
    value,
    validationError,
    touched,
    name,
    validate,
    update,
    reset,
    isValid,
    setFieldError,
  }
}
