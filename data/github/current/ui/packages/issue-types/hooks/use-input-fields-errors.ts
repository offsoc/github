import {useEffect, useRef, useState} from 'react'
import {Resources} from '../constants/strings'
import {ISSUE_TYPE_DESCRIPTION_LIMIT, ISSUE_TYPE_NAME_LIMIT, RESERVED_NAMES} from '../constants/constants'

const schema = {
  name: [
    {
      validation: (value: string) => !value,
      errorMessage: Resources.nameEmptyErrorMessage,
    },
    {
      validation: (value: string) => RESERVED_NAMES.includes(value.trim().toLowerCase()),
      errorMessage: Resources.nameNotAllowed,
    },
    {
      validation: (value: string, existingNames?: string[]) =>
        existingNames?.some(name => name.toLowerCase() === value.trim().toLowerCase()),
      errorMessage: Resources.nameTakenError,
    },
    {
      validation: (value: string) => value.length > ISSUE_TYPE_NAME_LIMIT,
      errorMessage: Resources.nameTooLongErrorMessage(ISSUE_TYPE_NAME_LIMIT),
    },
  ],
  description: [
    {
      validation: (value: string) => value.length > ISSUE_TYPE_DESCRIPTION_LIMIT,
      errorMessage: Resources.descriptionTooLongErrorMessage(ISSUE_TYPE_DESCRIPTION_LIMIT),
    },
  ],
}

export const useInputFieldsErrors = (existingNames: string[]) => {
  const typeDescriptionRef = useRef<HTMLInputElement>(null)
  const typeNameRef = useRef<HTMLInputElement>(null)

  const [nameError, setNameError] = useState<string>('')
  const [descriptionError, setDescriptionError] = useState<string>('')
  const [shouldFocusError, setShouldFocusError] = useState<boolean>(false)

  useEffect(() => {
    const focusInvalidInputField = () => {
      const invalidFieldRef = nameError ? typeNameRef : descriptionError ? typeDescriptionRef : null
      if (invalidFieldRef && invalidFieldRef.current) {
        invalidFieldRef.current?.focus({preventScroll: false})
      }
    }

    if (shouldFocusError) {
      setShouldFocusError(false)
      focusInvalidInputField()
    }
  }, [descriptionError, nameError, shouldFocusError])

  const validate = () => {
    const name = typeNameRef.current?.value || ''
    const description = typeDescriptionRef.current?.value || ''

    const nameFieldError = schema.name.find(({validation}) => validation(name, existingNames))?.errorMessage || ''
    const descriptionFieldError = schema.description.find(({validation}) => validation(description))?.errorMessage || ''

    setNameError(nameFieldError)
    setDescriptionError(descriptionFieldError)

    return !nameFieldError && !descriptionFieldError
  }

  return {
    typeNameRef,
    typeDescriptionRef,
    nameError,
    descriptionError,
    setNameError,
    setDescriptionError,
    setShouldFocusError,
    validate,
  }
}
