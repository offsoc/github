import {
  BOOLEAN_PROPERTY_ALLOWED_VALUES,
  type PropertyNameValidationResult,
  type PropertyValue,
  type ValueType,
} from '@github-ui/custom-properties-types'
import {isPropertyValueArray} from '@github-ui/custom-properties-types/helpers'
import {checkPropertyNamePath} from '@github-ui/paths'
import {validateRegexValue} from '@github-ui/repos-async-validation/validate-regex-value'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

const MAX_PROPERTY_NAME_LENGTH = 75
const MAX_PROPERTY_DESCRIPTION_LENGTH = 255

const NAME_INVALID_CHARS_REGEX = /[^a-zA-Z0-9_#$-]/gu
const VALUE_INVALID_CHARS_REGEX = /[^ -!#-~]/gu

export function validatePropertyNameSync(value: string, existingPropertyNames: string[]): string | undefined {
  if (value.length > MAX_PROPERTY_NAME_LENGTH) {
    return `Name cannot be longer than ${MAX_PROPERTY_NAME_LENGTH} characters`
  } else if (value.length === 0) {
    return 'Name is required'
  } else {
    for (const name of existingPropertyNames) {
      if (name.toLowerCase() === value.toLowerCase()) {
        return 'Name already exists'
      }
    }
  }

  const invalidChars = findChars(value, NAME_INVALID_CHARS_REGEX)
  if (invalidChars) {
    return `Name contains invalid characters: ${invalidChars}`
  }
}

export async function validatePropertyNameAsync(
  businessSlug: string,
  propertyName: string,
): Promise<PropertyNameValidationResult | undefined> {
  const genericFailureMessage = 'Could not check property name'
  try {
    const response = await verifiedFetchJSON(checkPropertyNamePath({sourceName: businessSlug, propertyName}))

    if (response.ok) {
      const {status, orgConflicts} = await response.json()
      switch (status) {
        case 'valid':
          return
        case 'already_exists':
          return {message: 'Name already exists'}
        case 'exists_in_business_orgs':
          return {message: `The property ${propertyName} already exists in this enterprise`, orgConflicts}
      }
    }
    return {message: genericFailureMessage}
  } catch {
    return {message: genericFailureMessage}
  }
}

export function validateAllowedValue(value: string, existingAllowedValues: Set<string>): string | undefined {
  if (value.length > MAX_PROPERTY_NAME_LENGTH) {
    return `Option cannot be longer than ${MAX_PROPERTY_NAME_LENGTH} characters`
  } else if (value.length === 0) {
    return 'Option cannot be empty'
  } else if (existingAllowedValues.has(value)) {
    return 'Option already exists'
  }

  const invalidChars = findChars(value, VALUE_INVALID_CHARS_REGEX)
  if (invalidChars) {
    return `Option contains invalid characters: ${invalidChars}`
  }
}

export function validatePropertyDescription(value: string): string | undefined {
  if (value.length > MAX_PROPERTY_DESCRIPTION_LENGTH) {
    return `Description cannot be longer than ${MAX_PROPERTY_DESCRIPTION_LENGTH} characters`
  }
}

const INVALID_VALUE_TYPE_MESSAGE = 'Invalid value type'
const NO_MATCHING_OPTION = 'Default value should be a valid option'
export async function validatePropertyDefaultValue(
  value: PropertyValue,
  valueType: ValueType,
  isRequired: boolean,
  allowedValues: string[] = [],
  regexPattern?: string,
): Promise<string | undefined> {
  if (!isRequired) {
    return
  }

  if (!value.length) {
    return 'Cannot be empty for a required property'
  }

  switch (valueType) {
    case 'single_select': {
      if (isPropertyValueArray(value)) return INVALID_VALUE_TYPE_MESSAGE
      if (!allowedValues.includes(value)) return NO_MATCHING_OPTION
      break
    }
    case 'true_false': {
      if (isPropertyValueArray(value)) return INVALID_VALUE_TYPE_MESSAGE
      if (!BOOLEAN_PROPERTY_ALLOWED_VALUES.includes(value)) return NO_MATCHING_OPTION
      break
    }
    case 'multi_select': {
      if (!isPropertyValueArray(value)) return INVALID_VALUE_TYPE_MESSAGE

      const allValuesValid = value.every(v => allowedValues.includes(v))
      if (!allValuesValid) return NO_MATCHING_OPTION
      break
    }
    case 'string': {
      if (isPropertyValueArray(value)) return INVALID_VALUE_TYPE_MESSAGE
      return await validateValue(value, regexPattern)
    }
  }
}

export async function validateValue(value: string, regexPattern?: string): Promise<string | undefined> {
  if (!value) {
    return
  }

  if (value.length > MAX_PROPERTY_NAME_LENGTH) {
    return `Cannot be longer than ${MAX_PROPERTY_NAME_LENGTH} characters`
  }

  const invalidChars = findChars(value, VALUE_INVALID_CHARS_REGEX)
  if (invalidChars) {
    return `Contains invalid characters: ${invalidChars}`
  }

  if (regexPattern) {
    if (!(await validateRegexValue(regexPattern, value))) {
      return 'Value does not match pattern'
    }
  }
}

function findChars(value: string, regex: RegExp) {
  const chars = Array.from(value.matchAll(regex))
  if (!chars) {
    return ''
  }

  const unique = new Set(chars.map(c => (c[0] === ' ' ? 'whitespace' : c[0])))
  return Array.from(unique).join(', ')
}
