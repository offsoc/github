import type {PropertyValue, ValueType} from '../custom-properties-types'

export function isPropertyValueArray(value?: PropertyValue): value is string[] {
  return Array.isArray(value)
}

export function isEmptyPropertyValue(value?: PropertyValue | null): boolean {
  if (!value) return true
  return value.length === 0
}

export function getEmptyValueByType(type: ValueType): PropertyValue {
  switch (type) {
    case 'multi_select':
      return []
    default:
      return ''
  }
}

export function areEqualValues(value1?: PropertyValue, value2?: PropertyValue) {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.length === value2.length && value1.every((v, i) => v === value2[i])
  } else {
    return value1 === value2
  }
}
