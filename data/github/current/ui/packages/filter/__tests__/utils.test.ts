import {ArrowBothIcon} from '@primer/octicons-react'

import {defaultFilterConfig} from '../Filter'
import {StateFilterProvider} from '../providers'
import {
  type AnyBlock,
  BlockType,
  type ComplexFilterOperator,
  type FilterBlock,
  FilterOperator,
  type FilterProvider,
  FilterProviderType,
  type IndexedBlockValueItem,
  type IndexedFilterBlock,
  ProviderSupportStatus,
} from '../types'
import {
  buildRawBlockString,
  capitalize,
  escapeString,
  getAllFilterOperators,
  getEscapedFilterValue,
  getExcludeKeySuggestion,
  getFilterBlockChunkByCaret,
  getFilterOperator,
  getFilterValue,
  getFilterValueByCaretIndex,
  getLastFilterBlockValue,
  getMutableFilterBlocks,
  getNoValueSuggestion,
  getUnescapedFilterValue,
  hasFilterBlockFocusChanged,
  isBetweenInclusive,
  isComplexFilterOperator,
  isFilterBlock,
  isIndexedFilterBlock,
  isMutableFilterBlock,
  shouldProviderShowSuggestions,
  unescapeString,
} from '../utils'

describe('Filter utils', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('test')).toBe('Test')
    })
    it('should not change the string if the first letter is already capitalized', () => {
      expect(capitalize('Test')).toBe('Test')
    })
  })

  describe('escapeString', () => {
    it('should escape a string with quotations', () => {
      expect(escapeString('test string')).toBe('"test string"')
    })
    it('should not escape a string already surrounded with quotations', () => {
      expect(escapeString('"test string"')).toBe('"test string"')
    })
    it('should not escape a string with no spaces', () => {
      expect(escapeString('test')).toBe('test')
    })
    it('should escape a string with open parenthesis', () => {
      expect(escapeString('test(')).toBe('"test("')
    })
    it('should escape a string with close parenthesis', () => {
      expect(escapeString('test)')).toBe('"test)"')
    })
    it('should escape a string with both open and close parentheses', () => {
      expect(escapeString('(test)')).toBe('"(test)"')
    })
    it('should escape a string with both open and close parentheses and a space', () => {
      expect(escapeString('(test test)')).toBe('"(test test)"')
    })
  })

  describe('unescapeString', () => {
    it('should unescape a string with quotations', () => {
      expect(unescapeString('"test string"')).toBe('test string')
    })
    it('should not unescape a string not surrounded with quotations', () => {
      expect(unescapeString('test string')).toBe('test string')
    })
  })

  describe('getFilterValueByIndex', () => {
    it('should return the value of a filter by caret index', () => {
      const values: IndexedBlockValueItem[] = [
        {hasCaret: true, value: 'test', startIndex: 0, endIndex: 4, valid: true},
        {hasCaret: false, value: 'test2', startIndex: 5, endIndex: 10, valid: true},
      ]

      expect(getFilterValueByCaretIndex(values, 3)).toBe('test')
    })

    it('should return last value if caret is null or -1', () => {
      const values: IndexedBlockValueItem[] = [
        {hasCaret: true, value: 'test', startIndex: 0, endIndex: 4, valid: true},
        {hasCaret: false, value: 'test2', startIndex: 5, endIndex: 10, valid: true},
      ]

      expect(getFilterValueByCaretIndex(values)).toBe('test2')
      expect(getFilterValueByCaretIndex(values, -1)).toBe('test2')
      expect(getFilterValueByCaretIndex(values, null)).toBe('test2')
    })

    it('should return null if caret is outside of range', () => {
      const values: IndexedBlockValueItem[] = [
        {hasCaret: true, value: 'test', startIndex: 0, endIndex: 4, valid: true},
        {hasCaret: false, value: 'test2', startIndex: 5, endIndex: 10, valid: true},
      ]

      expect(getFilterValueByCaretIndex(values, 12)).toBeNull()
    })
  })

  describe('getFilterValue', () => {
    it('should return string value if value is string', () => {
      expect(getFilterValue('test')).toBe('test')
    })

    it('should return computed string value if value is function', () => {
      expect(getFilterValue(() => 'test2')).toBe('test2')
    })

    it('should return null if value is null or undefined', () => {
      expect(getFilterValue(null)).toBeNull()
      expect(getFilterValue(undefined)).toBeNull()
    })
  })

  describe('getUnescapedFilterValue', () => {
    it('should return unescaped string value if value is string', () => {
      expect(getUnescapedFilterValue('"test value"')).toBe('test value')
    })

    it('should return unescaped string value if value is a function', () => {
      expect(getUnescapedFilterValue(() => '"test value 2"')).toBe('test value 2')
    })
  })

  describe('getEscapedFilterValue', () => {
    it('should return escaped string value if value is string', () => {
      expect(getEscapedFilterValue('test value')).toBe('"test value"')
    })

    it('should return escaped string value if value is a function', () => {
      expect(getEscapedFilterValue(() => 'test value 2')).toBe('"test value 2"')
    })
  })

  describe('isBetweenInclusive', () => {
    it('should return true if value is between or equal to start and end', () => {
      expect(isBetweenInclusive(1, 0, 2)).toBe(true)
      expect(isBetweenInclusive(0, 0, 2)).toBe(true)
      expect(isBetweenInclusive(2, 0, 2)).toBe(true)
    })
    it('should return false if value is not between or equal to start and end', () => {
      expect(isBetweenInclusive(3, 0, 2)).toBe(false)
      expect(isBetweenInclusive(-1, 0, 2)).toBe(false)
    })
  })

  describe('isFilterBlock', () => {
    it('should return true if block is a filter block', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {values: [], raw: ''},
        operator: FilterOperator.Is,
        valid: true,
      }

      expect(isFilterBlock(block)).toBe(true)
    })

    it('should return false if block is not a filter block', () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'test',
      }

      expect(isFilterBlock(block)).toBe(false)
    })
  })

  describe('isIndexedFilterBlock', () => {
    it('should return true if block is an indexed filter block', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: true, startIndex: 0, endIndex: 4},
        value: {values: [], raw: '', startIndex: 5, endIndex: 10, hasCaret: false},
        operator: FilterOperator.Is,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 10,
      }

      expect(isIndexedFilterBlock(block)).toBe(true)
    })

    it('should return false if block is a filter block', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {values: [], raw: ''},
        operator: FilterOperator.Is,
        valid: true,
      }

      expect(isIndexedFilterBlock(block)).toBe(false)
    })

    it('should return false if block is not an indexed filter block', () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'test',
      }

      expect(isIndexedFilterBlock(block)).toBe(false)
    })
  })

  describe('isMutableFilterBlock', () => {
    it('should return true if block is a filter block', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {values: [], raw: ''},
        operator: FilterOperator.Is,
        valid: true,
      }

      expect(isMutableFilterBlock(block)).toBe(true)
    })

    it('should return false if block is not a filter block', () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'test',
      }

      expect(isMutableFilterBlock(block)).toBe(false)
    })
  })

  describe('isComplexFilterOperator', () => {
    it('should return true if operator is a complex operator with more than one option', () => {
      const operator: ComplexFilterOperator = {
        single: [FilterOperator.Is, FilterOperator.IsNot],
        multi: [FilterOperator.IsOneOf, FilterOperator.IsNotOneOf],
      }

      expect(isComplexFilterOperator(operator)).toBe(true)
    })

    it('should return false if operator is a not complex operator with more than one option', () => {
      const operator = [FilterOperator.Is, FilterOperator.IsNot]

      expect(isComplexFilterOperator(operator)).toBe(false)
    })
  })

  describe('getAllFilterOperators', () => {
    it('should return fallback operators if filter provider is null', () => {
      expect(getAllFilterOperators()).toEqual([FilterOperator.Is, FilterOperator.IsNot])
    })
    it('should return filter operator for multi if filter allows multiple values', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.IsOneOf, FilterOperator.IsNotOneOf])
    })
    it('should return filter operator for multi if filter allows multiple values and disallows inclusive', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {
          filterTypes: {multiValue: true, inclusive: false},
          priority: 1,
          support: {status: ProviderSupportStatus.Supported},
        },
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.IsNotOneOf])
    })
    it('should return filter operator for multi if filter allows multiple values and and disallows exclusive', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {
          filterTypes: {multiValue: true, exclusive: false},
          priority: 1,
          support: {status: ProviderSupportStatus.Supported},
        },
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.IsOneOf])
    })
    it('should return filter operator for single if filter disallows multiple values', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: false}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.Is, FilterOperator.IsNot])
    })
    it('should return filter operator for single if filter disallows multiple values and disallows inclusive', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {
          filterTypes: {multiValue: false, inclusive: false},
          priority: 1,
          support: {status: ProviderSupportStatus.Supported},
        },
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.IsNot])
    })
    it('should return filter operator for single if filter disallows multiple values and disallows exclusive', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {
          filterTypes: {multiValue: false, exclusive: false},
          priority: 1,
          support: {status: ProviderSupportStatus.Supported},
        },
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.Is])
    })
    it('should return filter operator if not a complex operator', () => {
      const provider: FilterProvider = {
        type: FilterProviderType.Text,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'foo',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: false}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }

      expect(getAllFilterOperators(provider)).toEqual([FilterOperator.Is, FilterOperator.IsNot])
    })
  })

  describe('getFilterOperator', () => {
    it('should return the filter operator for multi value', () => {
      const provider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'assignee',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'assignee', 'foo')).toBe(FilterOperator.IsOneOf)
    })
    it('should return the filter operator for single value', () => {
      const provider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'assignee',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: false}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'assignee', 'foo')).toBe(FilterOperator.Is)
    })
    it('should return the filter operator for negation multi value', () => {
      const provider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'assignee',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, '-assignee', 'foo')).toBe(FilterOperator.IsNotOneOf)
    })
    it('should return the filter operator for negation single value', () => {
      const provider = {
        type: FilterProviderType.User,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: 'foo'}),
        key: 'assignee',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: false}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, '-assignee', 'foo')).toBe(FilterOperator.IsNot)
    })
    it('should return the filter operator for single date value', () => {
      const provider = {
        type: FilterProviderType.Date,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '2024-06-25'}),
        key: 'date',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'date', '2024-06-25')).toBe(FilterOperator.IsOneOf)
    })
    it('should return the filter operator for between date values', () => {
      const provider = {
        type: FilterProviderType.Date,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '2024-06-25'}),
        key: 'date',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'date', '2024-06-25..2024-06-30')).toBe(FilterOperator.Between)
    })
    it('should return the filter operator for before date value', () => {
      const provider = {
        type: FilterProviderType.Date,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '2024-06-25'}),
        key: 'date',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'date', '<2024-06-25')).toBe(FilterOperator.Before)
    })
    it('should return the filter operator for after date value', () => {
      const provider = {
        type: FilterProviderType.Date,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '2024-06-25'}),
        key: 'date',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'date', '>2024-06-25')).toBe(FilterOperator.After)
    })
    it('should return the filter operator for between number values', () => {
      const provider = {
        type: FilterProviderType.Number,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '10'}),
        key: 'count',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'count', '10..100')).toBe(FilterOperator.Between)
    })
    it('should return the filter operator for less than number value', () => {
      const provider = {
        type: FilterProviderType.Number,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '10'}),
        key: 'count',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'count', '<10')).toBe(FilterOperator.LessThan)
    })
    it('should return the filter operator for less than or equal to number value', () => {
      const provider = {
        type: FilterProviderType.Number,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '10'}),
        key: 'count',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'count', '<=10')).toBe(FilterOperator.LessThanOrEqualTo)
    })
    it('should return the filter operator for greater than number value', () => {
      const provider = {
        type: FilterProviderType.Number,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '10'}),
        key: 'count',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'count', '>10')).toBe(FilterOperator.GreaterThan)
    })
    it('should return the filter operator for greater than or equal to number value', () => {
      const provider = {
        type: FilterProviderType.Number,
        getSuggestions: () => [],
        validateFilterBlockValues: () => [],
        getValueRowProps: () => ({text: '10'}),
        key: 'count',
        icon: ArrowBothIcon,
        priority: 1,
        options: {filterTypes: {multiValue: true}, priority: 1, support: {status: ProviderSupportStatus.Supported}},
      }
      expect(getFilterOperator(provider, 'count', '>=10')).toBe(FilterOperator.GreaterThanOrEqualTo)
    })
  })
  describe('getFilterString', () => {
    it('should return the right string for IsNot', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.IsNot,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('-test:foo')
    })
    it('should return the right string for IsNotOneOf', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar', valid: true},
          ],
          raw: 'foo,bar',
        },
        operator: FilterOperator.IsNotOneOf,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('-test:foo,bar')
    })
    it('should return a properly escaped string for IsNot', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar baz', valid: true},
          ],
          raw: 'foo,"bar baz"',
        },
        operator: FilterOperator.IsNot,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('-test:foo,"bar baz"')
    })
    it('should return the right string for Before', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.Before,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:<foo')
    })
    it('should return the right string for LessThan', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.LessThan,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:<foo')
    })
    it('should return the right string for After', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.After,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:>foo')
    })
    it('should return the right string for GreaterThan', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.GreaterThan,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:>foo')
    })
    it('should return the right string for LessThanOrEqualTo', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.LessThanOrEqualTo,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:<=foo')
    })
    it('should return the right string for GreaterThanOrEqualTo', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.GreaterThanOrEqualTo,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:>=foo')
    })
    it('should return the right string for Between', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar', valid: true},
          ],
          raw: 'foo..bar',
        },
        operator: FilterOperator.Between,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:foo..bar')
    })
    it('should return the right string for Is', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [{value: 'foo', valid: true}],
          raw: 'foo',
        },
        operator: FilterOperator.Is,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:foo')
    })
    it('should return the right string for IsOneOf', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar', valid: true},
          ],
          raw: 'foo,bar',
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
      }

      expect(buildRawBlockString(block, defaultFilterConfig)).toBe('test:foo,bar')
    })
  })
  describe('getNoValueSuggestion', () => {
    it('should return the right suggestion for filter provider', () => {
      const noAssignee = getNoValueSuggestion('Assignee')
      expect(noAssignee.displayName).toBe('No assignee')
      expect(noAssignee.ariaLabel).toBe('No Assignee, Assignee')
    })
  })
  describe('getMutableFilterBlocks', () => {
    it('should return all mutable filter blocks', () => {
      const blocks: Array<AnyBlock | FilterBlock> = [
        {
          id: 1,
          type: BlockType.Filter,
          raw: 'test:foo,bar',
          provider: new StateFilterProvider(),
          key: {value: 'test', valid: true},
          value: {
            values: [
              {value: 'foo', valid: true},
              {value: 'bar', valid: true},
            ],
            raw: 'foo,bar',
          },
          operator: FilterOperator.IsOneOf,
          valid: true,
        },
        {type: BlockType.Space, id: 2, raw: ' '},
        {type: BlockType.Text, id: 3, raw: 'foo'},
        {type: BlockType.Text, id: 4, raw: 'bar'},
      ]

      const mutableBlocks = getMutableFilterBlocks(blocks)

      expect(mutableBlocks.length).toBe(3)
      expect(mutableBlocks[0]?.raw).toBe('test:foo,bar')
      expect(mutableBlocks[1]?.raw).toBe('foo')
      expect(mutableBlocks[2]?.raw).toBe('bar')
    })
  })
  describe('getLastFilterBlockValue', () => {
    it('should return the filter block value with the caret', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(getLastFilterBlockValue(block, 10)).toBe('bar')
    })
    it("should return the filter block's first value", () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar', valid: true},
          ],
          raw: 'foo,bar',
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
      }

      expect(getLastFilterBlockValue(block, 10)).toBe('foo')
    })
    it("should return the text block's raw value", () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'le text',
      }

      expect(getLastFilterBlockValue(block)).toBe('le text')
    })
  })
  describe('hasFilterBlockFocusChanged', () => {
    it('should return true if block is not indexed', () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'le text',
      }

      expect(hasFilterBlockFocusChanged(block, 2)).toBeTruthy()
    })
    it("should return false if block's key already has caret", () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: true, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: false, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(hasFilterBlockFocusChanged(block, 2)).toBeFalsy()
    })
    it("should return true if block's key has caret but didn't have focus before", () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(hasFilterBlockFocusChanged(block, 2)).toBeTruthy()
    })
    it('should return false if block value had caret and still does', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(hasFilterBlockFocusChanged(block, 10)).toBeFalsy()
    })
    it('should return true if block value now has caret', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: true, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: false, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(hasFilterBlockFocusChanged(block, 2)).toBeTruthy()
    })
  })
  describe('shouldProviderShowSuggestions', () => {
    it('should show suggestions for a filter block', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: 'bar', valid: true},
          ],
          raw: 'foo,bar',
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
      }

      expect(shouldProviderShowSuggestions(block)).toBeTruthy()
    })
    it('should not show suggestions for a non-filter block', () => {
      const block: AnyBlock = {
        id: 1,
        type: BlockType.Text,
        raw: 'le text',
      }

      expect(shouldProviderShowSuggestions(block)).toBeFalsy()
    })
    it('should show not suggestions when multiValue is false and there is a value', () => {
      const block: FilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true},
        value: {
          values: [
            {value: 'foo', valid: true},
            {value: '', valid: false},
          ],
          raw: 'foo,',
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
      }

      expect(shouldProviderShowSuggestions(block, false)).toBeFalsy()
    })
  })
  describe('getFilterBlockChunkByCaret', () => {
    it('should return null if block does not contain caret', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(getFilterBlockChunkByCaret(block, 20)).toStrictEqual([null, null])
    })
    it('should return null if block does not contain caret (3)', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(getFilterBlockChunkByCaret(block, 2)).toStrictEqual(['key', block.key])
    })
    it('should return null if block does not contain caret (2)', () => {
      const block: IndexedFilterBlock = {
        id: 1,
        type: BlockType.Filter,
        raw: 'test:foo,bar',
        provider: new StateFilterProvider(),
        key: {value: 'test', valid: true, hasCaret: false, startIndex: 0, endIndex: 4},
        value: {
          values: [
            {value: 'foo', valid: true, hasCaret: false, startIndex: 5, endIndex: 8},
            {value: 'bar', valid: true, hasCaret: true, startIndex: 9, endIndex: 12},
          ],
          raw: 'foo,bar',
          startIndex: 5,
          endIndex: 12,
          hasCaret: false,
        },
        operator: FilterOperator.IsOneOf,
        valid: true,
        hasCaret: true,
        startIndex: 0,
        endIndex: 12,
      }

      expect(getFilterBlockChunkByCaret(block, 11)).toStrictEqual(['value', block.value.values[1]])
    })
  })

  describe('getExcludeKeySuggestion', () => {
    it('should return just a dash if no value is provided', () => {
      const defaultExcludeSuggestion = getExcludeKeySuggestion()
      expect(defaultExcludeSuggestion.displayName).toBe('Exclude')
      expect(defaultExcludeSuggestion.value).toBe('-')
    })

    it('should return a specific value if provided as an arg', () => {
      const exampleExcludeSuggestion = getExcludeKeySuggestion('author')
      expect(exampleExcludeSuggestion.displayName).toBe('Exclude author')
      expect(exampleExcludeSuggestion.value).toBe('-author')
    })
  })
})
