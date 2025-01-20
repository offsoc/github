import memoize from 'lodash-es/memoize'

import {defaultFilterConfig} from '../constants/defaults'
import {Strings} from '../constants/strings'
import {FilterQuery} from '../filter-query'
import {
  checkFilterQuerySync,
  getFilterOperator,
  getFilterValue,
  isBetweenInclusive,
  isFilterBlock,
  isIndexedAnyBlock,
  isIndexedFilterBlock,
  isIndexedGroupBlock,
  isIndexedTextBlock,
} from '../utils'
import {
  BlockType,
  type FilterConfig,
  FilterOperator,
  type FilterProvider,
  type IndexedAnyBlock,
  type IndexedBlockValueItem,
  type IndexedFilterBlock,
  type IndexedGroupBlock,
  type Parser,
  ProviderSupportStatus,
  type Validation,
  ValidationTypes,
} from './../types'
import {getLastDelimiterRegex} from './last-delimiter-regex'
import {generateBlocksFromQueryString} from './string-breaker'

const getNextDelimiterRegex = memoize(
  (valueDelimiter: string) => new RegExp(`[\\s${valueDelimiter})](?=(?:[^"]*"[^"]*")*[^"]*$)`, 'g'),
)

const getBlockValuesRegex = memoize(
  (valueDelimiter: string) => new RegExp(`${valueDelimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`, 'g'),
)

const keywords = ['AND', 'OR']

export class FilterQueryParser implements Parser<FilterQuery> {
  filterProviders: FilterProvider[] = []
  config: FilterConfig
  #parsingCache: Record<string, FilterQuery> = {}
  #validationCache: Set<string>
  NEXT_DELIMITER_REGEX: RegExp
  ITEMS_REGEX: RegExp
  LAST_DELIMITER_REGEX: RegExp

  constructor(filterProviders: FilterProvider[] = [], config?: FilterConfig) {
    this.filterProviders = filterProviders
    this.config = config ?? defaultFilterConfig
    this.#validationCache = new Set()

    // a space, or value delimiter that is not inside of quotes
    this.NEXT_DELIMITER_REGEX = getNextDelimiterRegex(this.config.valueDelimiter)
    // separates items in a multi-value filter
    this.ITEMS_REGEX = getBlockValuesRegex(this.config.valueDelimiter)
    // a comma, or space, followed by an optional operator, followed by the value
    this.LAST_DELIMITER_REGEX = getLastDelimiterRegex(this.config.valueDelimiter)
  }

  parse(inputValue: string, filterQuery: FilterQuery = new FilterQuery('', [], this.config), caretIndex: number = -1) {
    let blocks = generateBlocksFromQueryString(inputValue, caretIndex)

    let activeBlock

    const parseBlocks = (recursiveBlocks: IndexedAnyBlock[]): IndexedAnyBlock[] => {
      for (const [index, block] of recursiveBlocks.entries()) {
        if (
          block.type !== BlockType.Space &&
          block.type !== BlockType.UnmatchedOpenParen &&
          block.type !== BlockType.UnmatchedCloseParen
        ) {
          if (isIndexedGroupBlock(block)) {
            // Recurse
            block.blocks = parseBlocks(block.blocks)
            if (!block.blocks.length && block.hasCaret) {
              activeBlock = block
            }
          } else {
            let currentBlock = block
            // KEYWORD BLOCK
            // * Note: Keywords must be case-sensitive
            if (keywords.includes(currentBlock.raw)) {
              currentBlock.type = BlockType.Keyword
            } else {
              // FILTER OR TEXT BLOCK
              const query = currentBlock.raw
              const filterDelimiterIndex = query.indexOf(this.config.filterDelimiter)
              const key = query.substring(0, filterDelimiterIndex)

              // Check key against filter provider keys and aliases
              const filterProvider = this.filterProviders.find(
                f =>
                  f.key === key ||
                  f.aliases?.some(a => a === key) ||
                  (f.options?.filterTypes.exclusive && `-${f.key}` === key),
              )

              if (filterProvider) {
                currentBlock = this.processFilterBlock(currentBlock, filterProvider, filterDelimiterIndex, caretIndex)
                recursiveBlocks[index] = currentBlock
              }
            }

            if (currentBlock.hasCaret) {
              activeBlock = currentBlock
            }
          }
        } else if (block.type === BlockType.Space && block.hasCaret) {
          activeBlock = block
        } else if (block.type === BlockType.UnmatchedOpenParen && block.hasCaret) {
          activeBlock = block
        } else if (block.type === BlockType.UnmatchedCloseParen && block.hasCaret) {
          activeBlock = block
        }
      }
      return recursiveBlocks
    }

    blocks = parseBlocks(blocks)

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
      // TODO: Should we replace the injected space with an i18n supported space character?
      newRaw += rawAfter && !(rawAfter[0]?.search(/\s/) === 0) ? ` ${rawAfter}` : rawAfter

      return [newRaw, updatedCaretIndex]
    } else {
      return [filterQuery.raw, filterQuery.raw.length]
    }
  }

  insertSuggestion(filterBarQuery: FilterQuery, suggestion: string, caretPosition: number): [string, number] {
    let newRaw: string
    let updatedCaretIndex = 0
    const activeBlock = filterBarQuery.activeBlock

    if (activeBlock && isIndexedFilterBlock(activeBlock)) {
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
      newRaw += rawAfter
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
      if (isFilterBlock(block)) {
        raw += block.key.value
        raw += block.value.raw ? `${filterBarQuery.config.filterDelimiter}${block.value.raw}` : ''
      } else {
        raw += block.raw
      }
    }
    return raw
  }

  validateFilterProvider(filterProvider: FilterProvider): [boolean, Validation | undefined] {
    if (filterProvider.options.support.status === ProviderSupportStatus.Unsupported) {
      return [
        false,
        {
          type: ValidationTypes.FilterProviderUnsupported,
          message: filterProvider.options.support.message ?? Strings.filterProviderNotSupported(filterProvider.key),
        },
      ]
    } else if (filterProvider.options.support.status === ProviderSupportStatus.Deprecated) {
      return [
        false,
        {
          type: ValidationTypes.FilterProviderDeprecated,
          message: filterProvider.options.support.message ?? Strings.filterProviderDeprecated(filterProvider.key),
        },
      ]
    }
    return [true, undefined]
  }

  processFilterBlock(
    block: IndexedAnyBlock,
    filterProvider: FilterProvider,
    filterDelimiterIndex: number,
    caretIndex: number,
  ): IndexedFilterBlock {
    const startIndex = block.startIndex
    const keyValue = block.raw.substring(0, filterDelimiterIndex)
    const valueString = block.raw.substring(filterDelimiterIndex + 1)
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

    const filterBlock: IndexedFilterBlock = {
      ...block,
      type: BlockType.Filter,
      provider: filterProvider,
      operator,
      valid: this.#validationCache.has(block.raw) ? true : undefined,
      key: {
        startIndex,
        endIndex: startIndex + filterDelimiterIndex,
        hasCaret: isBetweenInclusive(caretIndex, startIndex, startIndex + filterDelimiterIndex),
        value: keyValue,
      },
      value: {
        startIndex: startIndex + filterDelimiterIndex + 1,
        endIndex: startIndex + block.raw.length,
        hasCaret: isBetweenInclusive(caretIndex, startIndex + filterDelimiterIndex + 1, startIndex + block.raw.length),
        values,
        raw: valueString,
      },
    }

    return filterBlock
  }

  async validateQueryBlock(block: IndexedAnyBlock, filterQuery: FilterQuery): Promise<IndexedAnyBlock> {
    if (isIndexedFilterBlock(block)) {
      const [providerValid, providerValidationMessage] = this.validateFilterProvider(block.provider)

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
          validations: providerValidationMessage ? [providerValidationMessage] : undefined,
        },
        value: {
          ...block.value,
          values,
        },
      }
    }

    return block
  }

  async validateGroupBlock(block: IndexedGroupBlock, filterQuery: FilterQuery): Promise<IndexedGroupBlock> {
    const blocks = await Promise.all(
      block.blocks.map(b => {
        if (isIndexedGroupBlock(b)) {
          return this.validateGroupBlock(b, filterQuery)
        }
        return this.validateQueryBlock(b, filterQuery)
      }),
    )

    return {
      ...block,
      blocks,
    }
  }

  async validateFilterQuery(filterQuery: FilterQuery): Promise<FilterQuery> {
    const blockPromises: Array<Promise<IndexedAnyBlock>> = []

    filterQuery.blocks.map(block => {
      if (isIndexedGroupBlock(block)) {
        blockPromises.push(this.validateGroupBlock(block, filterQuery))
      } else if (isIndexedAnyBlock(block)) {
        blockPromises.push(this.validateQueryBlock(block, filterQuery))
      }
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
