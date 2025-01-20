import {Resources} from './resources'

const MAX_NUMBER_VALUE = 2147483647
const MAX_TEXT_BYTE_SIZE = 1024

export function getNumberFieldValidationMessage(text: string) {
  const parsed = parseNumber(text)
  if (Number.isNaN(parsed)) {
    return Resources.fieldMustBeANumber
  }

  if (parsed < -MAX_NUMBER_VALUE || parsed > MAX_NUMBER_VALUE) {
    return `${Resources.fieldMustBeBetween} -${MAX_NUMBER_VALUE} and ${MAX_NUMBER_VALUE}`
  }

  const numParts = text.split('.')
  const decimalPart = numParts[1]
  if (decimalPart && decimalPart.length > 15) {
    return Resources.floatingPointValueTooPrecise
  }
  return undefined
}

export function getDateFieldValidationMessage(text: string) {
  if (!text) return undefined

  if (text.length < 10) {
    return Resources.fieldMustBeDate
  }

  const parsed = new Date(text)

  if (!(parsed instanceof Date)) {
    return Resources.fieldMustBeDate
  }

  if (invalidDate(parsed)) {
    return Resources.fieldMustBeDate
  }

  return undefined
}

function invalidDate(dateValue: Date): boolean {
  const year = dateValue.getFullYear()
  const month = dateValue.getMonth()
  const date = dateValue.getDate()

  const notANumber = Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(date)
  if (notANumber) return true

  if (year < 1970 || year > 9999) {
    return true
  }

  if (month < 0 || month > 11) {
    return true
  }

  if (date < 1 || date > 31) {
    return true
  }

  return false
}

export function getTextFieldValidationMessage(text: string) {
  return new Blob([text]).size > MAX_TEXT_BYTE_SIZE ? Resources.fieldValueTooLong : undefined
}

/**
 * Scrubs commas from input and returns a number.
 * NOTE: This does not support I18n. A more robust solution for number
 * formatting will eventually be required.
 * @param text - Numeric-like text input
 */
export function parseNumber(text: string): number {
  return Number(text.replace(/,/g, ''))
}
