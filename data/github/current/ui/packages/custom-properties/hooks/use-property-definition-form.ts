import {debounce} from '@github/mini-throttle'
import {
  validateAllowedValue,
  validatePropertyDefaultValue,
  validatePropertyDescription,
  validatePropertyNameAsync,
  validatePropertyNameSync,
} from '@github-ui/custom-properties-editing/validate'
import type {
  PropertyDefinition,
  PropertyNameValidationResult,
  PropertyValue,
  ValueType,
} from '@github-ui/custom-properties-types'
import {getEmptyValueByType, isPropertyValueArray} from '@github-ui/custom-properties-types/helpers'
import {useValidateRegex} from '@github-ui/repos-async-validation/use-validate-regex'
import {useCallback} from 'react'

import {useFormField} from './use-form-field'
import {usePropertySource} from './use-property-source'

export type FormErrors = Partial<Record<keyof PropertyDefinition, string | undefined>>

interface Props {
  definition?: PropertyDefinition
  existingPropertyNames: string[]
}

export function usePropertyDefinitionForm({definition, existingPropertyNames}: Props) {
  const isEditing = !!definition
  const requiredField = useFormField(definition?.required || false)
  const regexValidator = useValidateRegex()
  const repoActorsEditingAllowedField = useFormField(definition?.valuesEditableBy === 'org_and_repo_actors')
  const {settingsLevel, sourceName} = usePropertySource()

  const propertyNameField = useFormField<string, PropertyNameValidationResult | undefined>(
    definition?.propertyName ?? '',
  )

  const descriptionField = useFormField(definition?.description ?? '', {
    validator: validatePropertyDescription,
  })

  const valueTypeField = useFormField(definition?.valueType ?? 'string')

  const allowedValuesField = useFormField(definition?.allowedValues ?? [], {
    validator: values => {
      if (values.length === 0 && ['single_select', 'multi_select'].includes(valueTypeField.value)) {
        return 'Property must have at least one option'
      }
    },
  })

  const newAllowedValueField = useFormField('', {
    validator: value => validateAllowedValue(value, new Set(allowedValuesField.value)),
  })

  const defaultValueField = useFormField<PropertyValue, string | undefined>(
    definition?.defaultValue || getEmptyValueByType(definition?.valueType || valueTypeField.value),
  )

  const regexEnabledField = useFormField(!!definition?.regex)

  const regexField = useFormField<string, string | undefined>(definition?.regex ?? '')
  const regexPattern = regexEnabledField.value && regexField.isValid() ? regexField.value : undefined

  const onRegexEnabledChange = (value: boolean) => {
    regexEnabledField.update(value)
    regexField.update('')
  }

  const validateRegex = async (value: string) => {
    if (regexEnabledField.value) {
      if (!value) {
        return 'Regular expression pattern is required'
      }
      if (!(await regexValidator.validate(value))) {
        return 'Invalid pattern'
      }
    }
  }

  const validatePropertyName = async (propertyName: string): Promise<PropertyNameValidationResult | undefined> => {
    if (isEditing) return undefined

    const syncValidationResult = validatePropertyNameSync(propertyName, existingPropertyNames)

    if (syncValidationResult) {
      return {message: syncValidationResult}
    }

    if (settingsLevel === 'business') {
      return await validatePropertyNameAsync(sourceName, propertyName)
    }
  }

  const onPropertyNameChange = async (value: string) => {
    propertyNameField.update(value)
    debouncedValidatePropertyName(value)
  }

  const onRegexChange = async (value: string) => {
    regexField.update(value)
    debouncedValidateRegex(value)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidateRegex = useCallback(
    debounce(async (value: string) => regexField.setFieldError(await validateRegex(value)), 300),
    [regexEnabledField.value],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidatePropertyName = useCallback(
    debounce(async (value: string) => propertyNameField.setFieldError(await validatePropertyName(value)), 300),
    [],
  )

  const onDefaultValueFieldChange = async (value: PropertyValue) => {
    defaultValueField.update(value)
    debouncedValidateDefaultValue(value)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidateDefaultValue = useCallback(
    debounce(async (value: PropertyValue) => {
      const validationResult = await validatePropertyDefaultValue(
        value,
        valueTypeField.value,
        requiredField.value,
        allowedValuesField.value,
        regexPattern,
      )
      defaultValueField.setFieldError(validationResult)
    }, 300),
    [valueTypeField.value, requiredField.value, allowedValuesField.value, regexPattern],
  )

  const onAllowedValuesChange = (values: string[]) => {
    allowedValuesField.update(values)

    const defaultValue = defaultValueField.value

    if (isPropertyValueArray(defaultValue)) {
      const validValues = defaultValue.filter(v => values.includes(v))
      defaultValueField.update(validValues)
    } else {
      if (!values.includes(defaultValue)) {
        defaultValueField.update('')
      }
    }
  }

  const onValueTypeChange = (type: ValueType) => {
    valueTypeField.update(type)
    defaultValueField.update(getEmptyValueByType(type))
    regexField.update('')
    regexEnabledField.update(false)
  }

  const onRequiredChange = (required: boolean) => {
    requiredField.update(required)
    if (!required) {
      defaultValueField.update(getEmptyValueByType(valueTypeField.value))
    }
  }

  const validateForm = async () => {
    const propertyNameError = await validatePropertyName(propertyNameField.value)
    propertyNameField.setFieldError(propertyNameError)

    const regexError = await validateRegex(regexField.value)
    regexField.setFieldError(regexError)

    const defaultFieldError = await validatePropertyDefaultValue(
      defaultValueField.value,
      valueTypeField.value,
      requiredField.value,
      allowedValuesField.value,
      regexPattern,
    )
    defaultValueField.setFieldError(defaultFieldError)

    const errors: FormErrors = {
      propertyName: propertyNameError?.message,
      description: descriptionField.validate(),
      defaultValue: defaultFieldError,
      regex: regexError,
      allowedValues: allowedValuesField.validate(),
    }

    return errors
  }

  return {
    propertyNameField: {
      ...propertyNameField,
      update: onPropertyNameChange,
    },
    requiredField: {
      ...requiredField,
      update: onRequiredChange,
    },
    descriptionField,
    valueTypeField: {
      ...valueTypeField,
      update: onValueTypeChange,
    },
    repoActorsEditingAllowedField,
    newAllowedValueField,
    allowedValuesField: {
      ...allowedValuesField,
      update: onAllowedValuesChange,
    },
    defaultValueField: {
      ...defaultValueField,
      update: onDefaultValueFieldChange,
    },
    regexEnabledField: {
      ...regexEnabledField,
      update: onRegexEnabledChange,
    },
    regexField: {
      ...regexField,
      update: onRegexChange,
    },
    validateForm,
  }
}
