import {NoEntryIcon, PlusCircleIcon, SkipIcon} from '@primer/octicons-react'
import cloneDeep from 'lodash-es/cloneDeep'

import {FILTER_VALUES} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {RawTextProvider} from '../providers/raw'
import type {StateFilterProviderType} from '../providers/static'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  BlockType,
  type ComplexFilterOperator,
  type FilterBlock,
  type FilterConfig,
  FilterOperator,
  type FilterProvider,
  FilterProviderType,
  type FilterSuggestion,
  type FilterSuggestionGroup,
  FilterTypeOperators,
  FilterValueType,
  type IndexedAnyBlock,
  type IndexedBlockKey,
  type IndexedBlockValueItem,
  type IndexedFilterBlock,
  type IndexedGroupBlock,
  type IndexedTextBlock,
  type IndexedUnmatchedCloseParenBlock,
  type IndexedUnmatchedOpenParenBlock,
  type MutableFilterBlock,
} from '../types'

export {ValueIcon} from './ValueIcon'

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const escapeString = (str?: string) => {
  if (!str || (str.indexOf(' ') < 0 && str.indexOf('(') < 0 && str.indexOf(')') < 0)) return str

  let result = str
  if (!result.startsWith('"')) result = `"${result}`
  if (!result.endsWith('"')) result = `${result}"`

  return result
}

export const unescapeString = (str?: string) => {
  if (!str || str.replaceAll('"', '').length < 1) return str
  let result = str
  if (result.startsWith('"')) result = result.substring(1)
  if (result.endsWith('"')) result = result.substring(0, result.length - 1)

  return result
}

export const caseInsensitiveStringCompare = (str1?: string, str2?: string) => {
  return !!str1 && !!str2 && str1.toLocaleLowerCase() === str2.toLocaleLowerCase()
}

export const getFilterValueByCaretIndex = (values: IndexedBlockValueItem[], caretIndex: number | null = -1) => {
  if (caretIndex === null || caretIndex < 0) return getFilterValue(values.at(-1)?.value)
  for (const value of values) {
    if (isBetweenInclusive(caretIndex, value.startIndex, value.endIndex)) {
      return getFilterValue(value.value)
    }
  }
  return null
}

export const getProviderKey = (key: string) => {
  return key.startsWith('-') ? key.slice(1) : key
}

export const getUniqueReactKey = (context: string, id?: string, fallback?: string) => {
  return `${context}-${id ?? fallback}`
}

export const getFilterValue = (value: string | (() => string) | null | undefined) => {
  if (!value) return null
  if (typeof value === 'string') return value
  return value()
}

export const getUnescapedFilterValue = (value: string | (() => string) | null | undefined) => {
  const val = getFilterValue(value)
  return val ? unescapeString(val) : val
}

export const getEscapedFilterValue = (value: string | (() => string) | null | undefined) => {
  const val = getFilterValue(value)
  return val ? escapeString(val) : val
}

export const promiseTimeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/*
  Compares whether the joined values of the filter query blocks matches the provided raw string or the filter query raw string as a fallback.
*/
export const checkFilterQuerySync = (filterQuery: FilterQuery, rawString?: string): boolean => {
  return (
    filterQuery.blocks
      .map(({raw}) => raw)
      .join('')
      .trim() === (rawString !== undefined ? rawString : filterQuery.raw).trim()
  )
}

export const isBetweenInclusive = (index: number, start: number, end: number): boolean => {
  return index >= 0 && index >= start && index <= end
}

export const isFilterBlock = (filterBlock: AnyBlock | MutableFilterBlock): filterBlock is FilterBlock => {
  return filterBlock.type === BlockType.Filter && filterBlock.key !== undefined && filterBlock.value !== undefined
}

export const isIndexedAnyBlock = (filterBlock: AnyBlock): filterBlock is IndexedAnyBlock => {
  return (
    (filterBlock as IndexedAnyBlock).startIndex !== undefined && (filterBlock as IndexedAnyBlock).endIndex !== undefined
  )
}

export const isIndexedGroupBlock = (filterBlock: AnyBlock): filterBlock is IndexedGroupBlock => {
  return (
    filterBlock.type === BlockType.Group &&
    (filterBlock as IndexedGroupBlock).blocks !== undefined &&
    (filterBlock as IndexedGroupBlock).startIndex !== undefined &&
    (filterBlock as IndexedGroupBlock).endIndex !== undefined
  )
}

export const isIndexedFilterBlock = (filterBlock: AnyBlock | MutableFilterBlock): filterBlock is IndexedFilterBlock => {
  return (
    filterBlock.type === BlockType.Filter &&
    (filterBlock as IndexedFilterBlock).key !== undefined &&
    (filterBlock as IndexedFilterBlock).value !== undefined &&
    (filterBlock as IndexedFilterBlock).startIndex !== undefined &&
    (filterBlock as IndexedFilterBlock).endIndex !== undefined
  )
}

export const isIndexedTextBlock = (textBlock: AnyBlock): textBlock is IndexedTextBlock => {
  return (
    textBlock.type === BlockType.Text &&
    (textBlock as IndexedTextBlock).startIndex !== undefined &&
    (textBlock as IndexedTextBlock).endIndex !== undefined
  )
}

export const isIndexedUnmatchedOpenParenBlock = (
  unmatchedOpenParenBlock: AnyBlock,
): unmatchedOpenParenBlock is IndexedUnmatchedOpenParenBlock => {
  return (
    unmatchedOpenParenBlock.type === BlockType.UnmatchedOpenParen &&
    (unmatchedOpenParenBlock as IndexedUnmatchedOpenParenBlock).startIndex !== undefined &&
    (unmatchedOpenParenBlock as IndexedUnmatchedOpenParenBlock).endIndex !== undefined
  )
}

export const isIndexedUnmatchedCloseParenBlock = (
  unmatchedCloseParenBlock: AnyBlock,
): unmatchedCloseParenBlock is IndexedUnmatchedCloseParenBlock => {
  return (
    unmatchedCloseParenBlock.type === BlockType.UnmatchedCloseParen &&
    (unmatchedCloseParenBlock as IndexedUnmatchedCloseParenBlock).startIndex !== undefined &&
    (unmatchedCloseParenBlock as IndexedUnmatchedCloseParenBlock).endIndex !== undefined
  )
}

export const isMutableFilterBlock = (filterBlock: AnyBlock | MutableFilterBlock): filterBlock is MutableFilterBlock => {
  return filterBlock.type === BlockType.Filter
}

export const isComplexFilterOperator = (
  operator: FilterOperator[] | ComplexFilterOperator,
): operator is ComplexFilterOperator => {
  return (operator as ComplexFilterOperator).single !== undefined
}

export const findExistingValueUsage = (filterQuery: FilterQuery, key: string, value: string | null | undefined) => {
  if (!value) return []
  return filterQuery.blocks.filter(
    f => isFilterBlock(f) && f.provider.key === key && f.value.values.findIndex(v => v.value === value) > -1,
  )
}

export const getAllFilterOperators = (provider?: FilterProvider): FilterOperator[] => {
  const operator = FilterTypeOperators[provider?.type ?? FilterProviderType.Unknown]
  const multiValue = provider?.options?.filterTypes.multiValue

  let operatorList = isComplexFilterOperator(operator) ? operator[multiValue ? 'multi' : 'single'] : operator

  if (provider?.options?.filterTypes.inclusive === false) {
    operatorList = operatorList.filter(o => o !== FilterOperator.Is && o !== FilterOperator.IsOneOf)
  }
  if (provider?.options?.filterTypes.exclusive === false) {
    operatorList = operatorList.filter(o => o !== FilterOperator.IsNot && o !== FilterOperator.IsNotOneOf)
  }

  return operatorList
}

export const getBlockKey = (provider: FilterProvider) =>
  provider.type === FilterProviderType.RawText ? undefined : {value: provider.key, valid: true}

export const getFilterOperator = (
  provider?: FilterProvider,
  filterKey?: string,
  filterValue?: string,
): FilterOperator => {
  const operators = getAllFilterOperators(provider)
  const multiValue = provider?.options?.filterTypes.multiValue
  if (operators[0]) {
    if (filterKey?.startsWith('-')) {
      return (
        operators.find(m => (multiValue ? m === FilterOperator.IsNotOneOf : m === FilterOperator.IsNot)) ?? operators[0]
      )
    }

    if (provider?.type === FilterProviderType.Number) {
      if (filterValue?.includes('..')) {
        return operators.find(m => m === FilterOperator.Between) ?? operators[0]
      } else if (filterValue?.startsWith('<=')) {
        return operators.find(m => m === FilterOperator.LessThanOrEqualTo) ?? operators[0]
      } else if (filterValue?.startsWith('<')) {
        return operators.find(m => m === FilterOperator.LessThan) ?? operators[0]
      } else if (filterValue?.startsWith('>=')) {
        return operators.find(m => m === FilterOperator.GreaterThanOrEqualTo) ?? operators[0]
      } else if (filterValue?.startsWith('>')) {
        return operators.find(m => m === FilterOperator.GreaterThan) ?? operators[0]
      }
    } else if (provider?.type === FilterProviderType.Date) {
      if (filterValue?.includes('..')) {
        return operators.find(m => m === FilterOperator.Between) ?? operators[0]
      } else if (filterValue?.startsWith('<=')) {
        return operators.find(m => m === FilterOperator.BeforeAndIncluding) ?? operators[0]
      } else if (filterValue?.startsWith('<')) {
        return operators.find(m => m === FilterOperator.Before) ?? operators[0]
      } else if (filterValue?.startsWith('>=')) {
        return operators.find(m => m === FilterOperator.AfterAndIncluding) ?? operators[0]
      } else if (filterValue?.startsWith('>')) {
        return operators.find(m => m === FilterOperator.After) ?? operators[0]
      }
    }
    return operators.find(m => (multiValue ? m === FilterOperator.IsOneOf : m === FilterOperator.Is)) ?? operators[0]
  }
  return FilterOperator.Is
}

export const buildRawBlockString = (filterBlock: Omit<MutableFilterBlock, 'raw'>, config: FilterConfig) => {
  const delimitedKey = filterBlock.key ? `${filterBlock.key.value}:` : ''

  switch (filterBlock.operator) {
    case FilterOperator.IsNot:
    case FilterOperator.IsNotOneOf:
      return `${delimitedKey.startsWith('-') ? delimitedKey : `-${delimitedKey}`}${filterBlock.value?.values
        .map(v => getEscapedFilterValue(v.value))
        .join(config.valueDelimiter)}`
    case FilterOperator.Before:
    case FilterOperator.LessThan:
      return `${delimitedKey}<${filterBlock.value?.raw ?? ''}`
    case FilterOperator.After:
    case FilterOperator.GreaterThan:
      return `${delimitedKey}>${!filterBlock.value?.raw ? '' : filterBlock.value?.raw}`
    case FilterOperator.LessThanOrEqualTo:
      return `${delimitedKey}<=${!filterBlock.value?.raw ? '' : filterBlock.value?.raw}`
    case FilterOperator.GreaterThanOrEqualTo:
      return `${delimitedKey}>=${!filterBlock.value?.raw ? '' : filterBlock.value?.raw}`
    case FilterOperator.Between:
      return `${delimitedKey}${getFilterValue(filterBlock.value?.values[0]?.value)}..${getFilterValue(
        filterBlock.value?.values[1]?.value,
      )}`

    default:
      return `${delimitedKey.startsWith('-') ? delimitedKey.substring(1) : delimitedKey}${filterBlock.value?.values
        .map(v => getEscapedFilterValue(v.value))
        .join(config.valueDelimiter)}`
  }
}

export const getNoValueSuggestion = (displayName: string, icon = NoEntryIcon, priority = 0): ARIAFilterSuggestion => {
  return {
    displayName: `No ${displayName.toLocaleLowerCase()}`,
    ariaLabel: `No ${displayName}, ${displayName}`,
    icon,
    value: '',
    type: FilterValueType.NoValue,
    priority,
  }
}

export const getExcludeKeySuggestion = (value?: string) => {
  return {
    displayName: value ? `Exclude ${value.toLocaleLowerCase()}` : 'Exclude',
    ariaLabel: value ? `Exclude ${value.toLocaleLowerCase()}` : 'Exclude',
    value: value ? `-${value}` : '-',
    type: FilterValueType.Key,
    priority: 1,
    icon: NoEntryIcon,
  }
}

export const getAndKeySuggestion = () => {
  return {
    ariaLabel: 'And',
    value: 'AND',
    type: 'keyword' as const,
    priority: 1,
    icon: PlusCircleIcon,
  }
}

export const getOrKeySuggestion = () => {
  return {
    ariaLabel: 'Or',
    value: 'OR',
    type: 'keyword' as const,
    priority: 1,
    icon: SkipIcon,
  }
}

export const getFlatSuggestionsList = (
  suggestions: ARIAFilterSuggestion[] | FilterSuggestionGroup[],
): ARIAFilterSuggestion[] => {
  const flatSuggestions: ARIAFilterSuggestion[] = []
  for (const suggestion of suggestions) {
    if ('suggestions' in suggestion) {
      flatSuggestions.push(...suggestion.suggestions)
    } else {
      flatSuggestions.push(suggestion)
    }
  }
  return flatSuggestions
}

export const getMutableFilterBlocks = (filteredBlocks: AnyBlock[]): MutableFilterBlock[] => {
  const blocks: MutableFilterBlock[] = []

  for (let i = 0; i < filteredBlocks.length; i++) {
    const block = filteredBlocks[i]
    if (!block) continue
    else if (block.type === BlockType.Space) continue
    else if (block.type === BlockType.Text && filteredBlocks[i - 2]?.type === BlockType.Text) {
      const prevBlock = blocks.pop()
      if (prevBlock) {
        prevBlock.raw += ` ${block.raw}`
        prevBlock.value = {raw: prevBlock.raw, values: [{value: prevBlock.raw, valid: true}]}
        blocks.push(prevBlock)
      }
    } else if (isMutableFilterBlock(block)) {
      const safeBlock: MutableFilterBlock = cloneDeep(block)

      // If the block value is between two values, we split them for visual display
      if (safeBlock.operator === FilterOperator.Between) {
        const joinedValue = getFilterValue(safeBlock.value?.values[0]?.value) ?? ''
        const values = joinedValue?.split('..')
        const validity = !!values[0] && values[0] !== '' && !!values[1] && values[1] !== ''
        if (values?.length === 2) {
          safeBlock.value = {
            raw: joinedValue,
            values: [
              {value: values[0] ?? '', valid: validity},
              {value: values[1] ?? '', valid: validity},
            ],
          }
        }
      } else {
        let raw = ''
        safeBlock.value?.values.map(v => {
          raw += `,${(getFilterValue(v.value) ?? '').replaceAll(/[>|<|>=|<=]/g, '') ?? ''}`
        })
        raw = raw.slice(1)
        safeBlock.value = {
          values: safeBlock.value?.values ?? [],
          raw,
        }
      }
      safeBlock.id = blocks.length
      blocks.push(safeBlock)
    } else {
      blocks.push({
        type: BlockType.Filter,
        id: blocks.length,
        provider: RawTextProvider,
        raw: block.raw ?? '',
        value: {raw: block.raw ?? '', values: [{value: block.raw ?? '', valid: true}]},
      })
    }
  }

  return blocks
}

export const getLastFilterBlockValue = (filterBlock: AnyBlock | MutableFilterBlock, caretIndex?: number | null) => {
  let lastValue: string
  if (isIndexedFilterBlock(filterBlock) && filterBlock.value?.values) {
    lastValue = getFilterValueByCaretIndex(filterBlock.value.values, caretIndex) ?? ''
  } else if (isFilterBlock(filterBlock) && filterBlock.value?.values) {
    lastValue = getFilterValue(filterBlock.value.values[0]?.value) ?? ''
  } else {
    lastValue = filterBlock.raw
  }
  if (lastValue.startsWith('"')) lastValue = lastValue.substring(1)
  return lastValue
}

export const isEmptyFilterBlockValue = (filterBlock: AnyBlock | MutableFilterBlock): boolean => {
  const filterBlockValues = isFilterBlock(filterBlock) && filterBlock.value?.values ? filterBlock.value.values : []

  if (filterBlockValues.length > 1) return false

  return filterBlockValues.length === 1 ? filterBlockValues[0]?.value === '' : true
}

export const hasFilterBlockFocusChanged = (filterBlock: AnyBlock, newCaretIndex: number) => {
  if (!isIndexedFilterBlock(filterBlock)) return true

  if (!filterBlock.key.hasCaret) {
    return isBetweenInclusive(newCaretIndex, filterBlock.key.startIndex, filterBlock.key.endIndex)
  }
  const currentValue = filterBlock.value.values.find(v => v.hasCaret)
  return currentValue && !isBetweenInclusive(newCaretIndex, currentValue.startIndex, currentValue.endIndex)
}

export const shouldProviderShowSuggestions = (filterBlock: AnyBlock | MutableFilterBlock, isMultiValue = true) =>
  isFilterBlock(filterBlock) && (isMultiValue || filterBlock.value.values.length <= 1)

export const getFilterBlockChunkByCaret = (
  filterBlock: IndexedFilterBlock,
  caretIndex: number,
): [type: 'key', IndexedBlockKey] | [type: 'value', IndexedBlockValueItem] | [null, null] => {
  // If the caret is before or after the block, return null. #notmyblock
  if (filterBlock.startIndex > caretIndex || filterBlock.endIndex < caretIndex) return [null, null]

  // If the caret is in the key, return the key
  if (isBetweenInclusive(caretIndex, filterBlock.key.startIndex, filterBlock.key.endIndex))
    return ['key', filterBlock.key]

  const currentValue = filterBlock.value.values.find(v => isBetweenInclusive(caretIndex, v.startIndex, v.endIndex))
  return currentValue ? ['value', currentValue] : [null, null]
}

export const getFilterValuesByStateType = (type: StateFilterProviderType = 'mixed') => {
  let values: FilterSuggestion[] = []
  if (type === 'mixed') {
    const uniqueValues: Record<string, FilterSuggestion> = {}
    for (const value of [...FILTER_VALUES.memexState, ...FILTER_VALUES.state, ...FILTER_VALUES.prState]) {
      const extractedValue = getFilterValue(value.value)

      const {icon, iconColor, ...keepAttrs} = value
      if (extractedValue && !uniqueValues[extractedValue]) {
        uniqueValues[extractedValue] = {...keepAttrs}
      }
    }
    values = Object.values(uniqueValues)
  } else if (type === 'issues') {
    values = FILTER_VALUES.state
  } else if (type === 'memex') {
    values = FILTER_VALUES.memexState
  } else {
    values = FILTER_VALUES.prState
  }

  return values
}

export function sanitizeOperators(raw: string | null): string | null {
  return raw ? raw.replaceAll('<', '&lt;')?.replaceAll('>', '&gt;') : raw
}
