import type {IssueFormElement} from '../types'

// If in the future we wish to use payload elements more (ie coming from JSON) we can revisit this.
// The relay version uses the unique `__id` field as a storage key suffix.
// Currently for the JSON payload version we use the index of the element in the array.
export const createUniqueIdForElement = (storageKeyPrefix: string, element: IssueFormElement, keySuffix: number) =>
  element.type === 'markdown'
    ? ''
    : uniqueIdForElementInternal(storageKeyPrefix, element.type, element.label, keySuffix)

export const uniqueIdForElementInternal = (
  storageKeyPrefix: string,
  type: string,
  label: string,
  keySuffix: number | string | null,
) => {
  // Markdown has no input value and therefore safe to ignore.
  if (type === 'markdown') {
    return ''
  }

  const middleComponent = type === '' ? label : `${type}-${label}`
  return `${storageKeyPrefix}-${middleComponent}-${keySuffix}`
}
