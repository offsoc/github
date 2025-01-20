import memoize from 'lodash-es/memoize'

import {defaultFilterConfig} from '../constants/defaults'
import {KEYWORDS} from '../constants/filter-constants'
import {Strings} from '../constants/strings'
import {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  BlockType,
  type FilterConfig,
  FilterOperator,
  type FilterProvider,
  type IndexedBlockValueItem,
  type IndexedFilterBlock,
  type IndexedTextBlock,
  type Parser,
  ProviderSupportStatus,
  type SpaceBlock,
  type Validation,
  ValidationTypes,
} from '../types'
import {
  checkFilterQuerySync,
  getFilterOperator,
  getFilterValue,
  isBetweenInclusive,
  isFilterBlock,
  isIndexedFilterBlock,
  isIndexedTextBlock,
} from '../utils'
import {getLastDelimiterRegex} from './last-delimiter-regex'

const getTrailingDelimiterRegex = memoize(
  (filterDelimiter: string, valueDelimiter: string) => new RegExp(`[${filterDelimiter}${valueDelimiter}\\s]$`, 'g'),
  (filterDelimiter: string, valueDelimiter: string) => `${filterDelimiter}_${valueDelimiter}`,
)

const getNextDelimiterRegex = memoize(
  (valueDelimiter: string) => new RegExp(`\\s|${valueDelimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`, 'g'),
)

const getBlockValuesRegex = memoize(
  (valueDelimiter: string) => new RegExp(`${valueDelimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`, 'g'),
)

/**
 * @deprecated FilterQueryParser v1 is deprecated. Use FilterQueryParser v2 instead.
 */
export class FilterQueryParser implements Parser<FilterQuery> {
  filterProviders: FilterProvider[] = []
  config: FilterConfig
  #parsingCache: Record<string, FilterQuery> = {}
  #validationCache: Set<string>
  SPACE_AND_QUOTES_REGEX: RegExp
  TRAILING_DELIMITER_REGEX: RegExp
  NEXT_DELIMITER_REGEX: RegExp
  ITEMS_REGEX: RegExp
  LAST_DELIMITER_REGEX: RegExp

  constructor(filterProviders: FilterProvider[] = [], config?: FilterConfig) {
    this.filterProviders = filterProviders
    this.config = config ?? defaultFilterConfig
    this.#validationCache = new Set()

    // separates blocks by spaces, but not if they are inside of quotes
    this.SPACE_AND_QUOTES_REGEX = /\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g
    // trailing delimiter will be a filter delimiter, value delimiter, or space
    this.TRAILING_DELIMITER_REGEX = getTrailingDelimiterRegex(this.config.filterDelimiter, this.config.valueDelimiter)
    // a space, or value delimiter that is not inside of quotes
    this.NEXT_DELIMITER_REGEX = getNextDelimiterRegex(this.config.valueDelimiter)
    // separates items in a multi-value filter
    this.ITEMS_REGEX = getBlockValuesRegex(this.config.valueDelimiter)
    // a comma, or space, followed by an optional operator, followed by the value
    this.LAST_DELIMITER_REGEX = getLastDelimiterRegex(this.config.valueDelimiter)
  }

  parse(inputValue: string, filterQuery: FilterQuery = new FilterQuery('', [], this.config), caretIndex: number = -1) {
    const blocks: AnyBlock[] = []

    let queries = []
    let remainingText = ''

    // Determine if there are uneven quotes
    if ((inputValue.match(/"/g) ?? []).length % 2 === 0) {
      // If not, split as normal
      queries = inputValue.split(this.SPACE_AND_QUOTES_REGEX)
    } else {
      // If so, split on the last quote and parse the part of the query before the last quote
      queries = inputValue.substring(0, inputValue.lastIndexOf('"')).split(this.SPACE_AND_QUOTES_REGEX)
      remainingText = inputValue.substring(inputValue.lastIndexOf('"'))

      // Check if the last query has a trailing delimiter
      if (queries.at(-1)?.match(this.TRAILING_DELIMITER_REGEX)?.length ?? 0 > 0) {
        let lastQuery = queries.pop() ?? ''
        remainingText = lastQuery.at(-1) + remainingText
        lastQuery = lastQuery?.replace(this.TRAILING_DELIMITER_REGEX, '')
        queries.push(lastQuery)
      }
    }

    let currentIndex = 0
    let blockIndex = 0
    let activeBlock

    for (const [entryIndex, query] of queries.entries()) {
      const filterDelimiterIndex = query.indexOf(this.config.filterDelimiter)
      const key = query.substring(0, filterDelimiterIndex)
      // Block index doubled to account for space elements

      const filterProvider = this.filterProviders.find(
        f =>
          f.key === key || f.aliases?.some(a => a === key) || (f.options?.filterTypes.exclusive && `-${f.key}` === key),
      )
      if (
        filterProvider &&
        (filterProvider.options.filterTypes.multiKey !== false ||
          blocks.filter(b => isFilterBlock(b) && b.key.value === filterProvider.key).length < 1)
      ) {
        const block = this.processFilterBlock(
          query,
          filterProvider,
          currentIndex,
          filterDelimiterIndex,
          blockIndex,
          caretIndex,
        )
        if (isBetweenInclusive(caretIndex, currentIndex, currentIndex + query.length)) {
          activeBlock = block
        }
        blocks.push(block)
        blockIndex++
      } else if (
        query !== '' ||
        (filterProvider &&
          !filterProvider.options.filterTypes.multiKey &&
          blocks.filter(b => isFilterBlock(b) && b.key.value === filterProvider.key).length > 1)
      ) {
        const block: AnyBlock = this.processTextBlock(query, currentIndex, blockIndex, caretIndex)

        if (isBetweenInclusive(caretIndex, currentIndex, currentIndex + query.length)) {
          activeBlock = block
        }
        blocks.push(block)
        blockIndex++
      }
      currentIndex += query.length

      // Add Space Element
      if (entryIndex < queries.length - 1) {
        currentIndex += 1
        // Don't need to set space as active block because it defaults to showing the filter keys
        const spaceBlock: SpaceBlock = {id: blockIndex, type: BlockType.Space, raw: ' '}
        blocks.push(spaceBlock)
        if (isBetweenInclusive(caretIndex, currentIndex, currentIndex + query.length)) {
          activeBlock = spaceBlock
        }
        blockIndex++
      }
    }

    if (remainingText.length > 0) {
      const remainingBlock = this.processTextBlock(remainingText, currentIndex, blockIndex, caretIndex)
      blocks.push(remainingBlock)
    }

    if (!inputValue.endsWith(' ') && blocks.at(-1)?.type === BlockType.Space) {
      blocks.pop()
    }

    const newQuery = new FilterQuery(inputValue, blocks, this.config, activeBlock, filterQuery.instanceContext)
    return newQuery
  }

  replaceActiveBlockWithNoBlock(filterQuery: FilterQuery): [string, number] {
    let newRaw: string
    let updatedCaretIndex = 0
    const activeBlock = filterQuery.activeBlock

    if (activeBlock && isIndexedFilterBlock(activeBlock)) {
      const rawBefore = filterQuery.raw.substring(0, activeBlock.startIndex)
      const rawAfter = filterQuery.raw.substring(activeBlock.endIndex)

      newRaw = `${rawBefore}no${this.config.filterDelimiter}${activeBlock.key.value}`
      updatedCaretIndex = newRaw.length
      newRaw += rawAfter && !rawAfter.startsWith(' ') ? ` ${rawAfter}` : rawAfter

      return [newRaw, updatedCaretIndex]
    } else {
      return [filterQuery.raw, filterQuery.raw.length]
    }
  }

  insertSuggestion(filterBarQuery: FilterQuery, suggestion: string, caretPosition: number): [string, number] {
    let newRaw: string
    let updatedCaretIndex = 0
    const activeBlock = filterBarQuery.activeBlock

    if (KEYWORDS.includes(suggestion)) {
      const rawBefore = filterBarQuery.raw.substring(0, caretPosition)
      const rawAfter = filterBarQuery.raw.substring(caretPosition)

      // Reassemble the raw string
      newRaw = `${rawBefore}${suggestion.toLocaleUpperCase()} `
      updatedCaretIndex = newRaw.length
      newRaw += rawAfter && !rawAfter.startsWith(' ') ? ` ${rawAfter}` : rawAfter
    } else if (activeBlock && isIndexedFilterBlock(activeBlock)) {
      const rawBefore = filterBarQuery.raw.substring(0, activeBlock.startIndex)
      const rawAfter = filterBarQuery.raw.substring(activeBlock.endIndex)

      // Replace everything between the last delimiter and the cursor with the suggestion
      let valueBefore = activeBlock.value.raw.substring(0, caretPosition - activeBlock.value.startIndex)
      valueBefore = valueBefore.replace(this.LAST_DELIMITER_REGEX, `$1`) + suggestion

      // Clear everything after the cursor til the next delimiter or the end of the value
      let valueAfter = activeBlock.value.raw.substring(caretPosition - activeBlock.value.startIndex)
      this.NEXT_DELIMITER_REGEX.lastIndex = 0
      const match = this.NEXT_DELIMITER_REGEX.exec(valueAfter)
      valueAfter = match ? valueAfter.substring(match.index) : ''

      // if the suggestion is an exclusion, replace the active block key
      let keyValue = activeBlock.key.value
      if (suggestion.startsWith('-')) {
        keyValue = suggestion
        valueBefore = ''
      }

      // Reassemble the raw string
      newRaw = `${rawBefore}${keyValue}${this.config.filterDelimiter}${valueBefore}${valueAfter}`
      updatedCaretIndex = newRaw.length - valueAfter.length
      newRaw += rawAfter && !rawAfter.startsWith(' ') ? ` ${rawAfter}` : rawAfter
    } else if (
      activeBlock &&
      isIndexedTextBlock(activeBlock) &&
      caretPosition - activeBlock.startIndex <= activeBlock.raw.indexOf(this.config.filterDelimiter)
    ) {
      const rawBefore = filterBarQuery.raw.substring(0, activeBlock.startIndex)
      const rawAfter = filterBarQuery.raw.substring(activeBlock.endIndex)

      const delimiterIndex = activeBlock.raw.indexOf(this.config.filterDelimiter)
      const blockValue = activeBlock.raw.substring(delimiterIndex + 1)

      newRaw = `${rawBefore}${suggestion}${blockValue}${rawAfter}`
      updatedCaretIndex = rawBefore.length + suggestion.length
    } else if (caretPosition >= 0) {
      let rawBefore = filterBarQuery.raw.substring(0, caretPosition)
      let rawAfter = filterBarQuery.raw.substring(caretPosition)
      this.NEXT_DELIMITER_REGEX.lastIndex = 0
      const match = this.NEXT_DELIMITER_REGEX.exec(rawAfter)

      if (match) {
        rawAfter = rawAfter.substring(match.index)
      } else {
        // This should only be when there are no blocks after
        rawAfter = ''
      }

      // Remove any partial value entered
      rawBefore = rawBefore.replace(this.LAST_DELIMITER_REGEX, `$1`) + suggestion
      newRaw = rawBefore + rawAfter
      updatedCaretIndex = rawBefore.length
    } else {
      newRaw = filterBarQuery.raw + suggestion
      updatedCaretIndex = newRaw.length
    }
    return [newRaw, updatedCaretIndex]
  }

  getRaw(filterBarQuery: FilterQuery): string {
    let raw = ''
    for (const block of filterBarQuery.blocks) {
      if (block.type === BlockType.Space) {
        raw += ' '
      } else if (isFilterBlock(block)) {
        raw += block.key.value
        raw += block.value.raw ? `${filterBarQuery.config.filterDelimiter}${block.value.raw}` : ''
      } else {
        raw += block.raw
      }
    }
    return raw
  }

  validateFilterProvider(filterProvider: FilterProvider): [boolean, Validation[] | undefined] {
    if (filterProvider.options.support.status === ProviderSupportStatus.Unsupported) {
      return [
        false,
        [
          {
            type: ValidationTypes.FilterProviderUnsupported,
            message: filterProvider.options.support.message ?? Strings.filterProviderNotSupported(filterProvider.key),
          },
        ],
      ]
    } else if (filterProvider.options.support.status === ProviderSupportStatus.Deprecated) {
      return [
        false,
        [
          {
            type: ValidationTypes.FilterProviderDeprecated,
            message: filterProvider.options.support.message ?? Strings.filterProviderDeprecated(filterProvider.key),
          },
        ],
      ]
    }
    return [true, undefined]
  }

  processFilterBlock(
    filterString: string,
    filterProvider: FilterProvider,
    startIndex: number,
    filterDelimiterIndex: number,
    blockIndex: number,
    caretIndex: number,
  ): IndexedFilterBlock {
    const keyValue = filterString.substring(0, filterDelimiterIndex)
    const valueString = filterString.substring(filterDelimiterIndex + 1)
    const operator = getFilterOperator(filterProvider, keyValue, valueString) ?? FilterOperator.Is
    let runningIndex = startIndex + filterDelimiterIndex + 1

    let blockValueItems = valueString.split(this.ITEMS_REGEX)

    if (operator === FilterOperator.Between) {
      let splitValues: string[] = []
      blockValueItems.map(n => {
        let vals = n.split('..').filter(v => v)
        if (vals.length < 2) {
          if (n.startsWith('..')) {
            vals = ['', ...vals]
          } else {
            vals.push('')
          }
        }

        splitValues = [...splitValues, ...vals]
      })

      blockValueItems = splitValues
    }

    const values = blockValueItems.map(v => {
      const valueObject: IndexedBlockValueItem = {
        startIndex: runningIndex,
        endIndex: runningIndex + v.length,
        hasCaret: isBetweenInclusive(caretIndex, runningIndex, runningIndex + v.length),
        value: v,
        valid: this.#validationCache.has(`${keyValue}${this.config.filterDelimiter}${getFilterValue(v)}`)
          ? true
          : undefined,
      }

      // Accounts for 2 spaces for `..` for Between, 1 space for `,`
      const valueDelimiterSize = operator === FilterOperator.Between ? 2 : 1

      runningIndex = runningIndex + v.length + valueDelimiterSize
      return valueObject
    })

    const hasCaret = isBetweenInclusive(caretIndex ?? -1, startIndex, startIndex + filterString.length)

    const filterBlock: IndexedFilterBlock = {
      id: blockIndex,
      type: BlockType.Filter,
      provider: filterProvider,
      operator,
      startIndex,
      endIndex: startIndex + filterString.length,
      hasCaret,
      valid: this.#validationCache.has(filterString) ? true : undefined,
      key: {
        startIndex,
        endIndex: startIndex + filterDelimiterIndex,
        hasCaret: isBetweenInclusive(caretIndex, startIndex, startIndex + filterDelimiterIndex),
        value: keyValue,
      },
      value: {
        startIndex: startIndex + filterDelimiterIndex + 1,
        endIndex: startIndex + filterString.length,
        values,
        raw: valueString,
        hasCaret: isBetweenInclusive(
          caretIndex,
          startIndex + filterDelimiterIndex + 1,
          startIndex + filterString.length,
        ),
      },
      raw: filterString,
    }

    return filterBlock
  }

  processTextBlock(textString: string, startIndex: number, blockIndex: number, caretIndex?: number): IndexedTextBlock {
    const hasCaret = isBetweenInclusive(caretIndex ?? -1, startIndex, startIndex + textString.length)

    return {
      id: blockIndex,
      type: BlockType.Text,
      startIndex,
      endIndex: startIndex + textString.length,
      hasCaret,
      raw: textString,
    }
  }

  async validateFilterQuery(filterQuery: FilterQuery): Promise<FilterQuery> {
    const blockPromises = filterQuery.blocks.map(async block => {
      if (isIndexedFilterBlock(block)) {
        const [providerValid, validations] = this.validateFilterProvider(block.provider)

        const values = await block.provider.validateFilterBlockValues?.(
          filterQuery,
          block,
          block.value.values,
          this.config,
        )

        //Cache validation
        values.map(v => {
          if (v.valid) {
            this.#validationCache.add(`${block.provider.key}${this.config.filterDelimiter}${getFilterValue(v.value)}`)
          }
        })

        const isBlockValid = values.every(v => v.valid) && providerValid

        isBlockValid && this.#validationCache.add(block.raw)

        return {
          ...block,
          valid: isBlockValid,
          key: {
            ...block.key,
            valid: providerValid,
            validations,
          },
          value: {
            ...block.value,
            values,
          },
        }
      }

      return block
    })

    const blocks = await Promise.all(blockPromises)

    if (!this.#parsingCache[filterQuery.raw] && checkFilterQuerySync(filterQuery))
      this.#parsingCache[filterQuery.raw] = filterQuery

    const newQuery = new FilterQuery(
      filterQuery.raw,
      blocks,
      this.config,
      filterQuery.activeBlock,
      filterQuery.instanceContext,
      true,
    )
    return newQuery
  }
}
