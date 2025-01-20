import {renderHook} from '@testing-library/react'

import {useEnabledFeatures} from '../../client/hooks/use-enabled-features'
import {useFilterSuggestions} from '../../client/hooks/use-filter-suggestions'
import {asMockHook} from '../mocks/stub-utilities'

jest.mock('../../client/hooks/use-enabled-features')

type Field = {
  name: string
}
const defaultFields: Array<Field> = [{name: 'Title'}, {name: 'Assignees'}, {name: 'Status'}]
const manyFields: Array<Field> = [
  ...defaultFields,
  {name: 'Priority'},
  {name: 'Sub Status'},
  {name: 'Notes'},
  {name: 'Iteration'},
  {name: 'Feature Set'},
  {name: 'Linked Pull Requests'},
  {name: 'Milestone'},
  {name: 'Labels'},
  {name: 'Repository'},
  {name: 'Reviewers'},
  {name: 'Due Date'},
]

function getFilterSuggestions(props: Parameters<typeof useFilterSuggestions>[number]) {
  const {result} = renderHook(() => useFilterSuggestions(props))
  return result.current
}

function getFieldSuggestions(props: Parameters<typeof useFilterSuggestions>[number]) {
  return getFilterSuggestions(props).displayableColumns
}

function getKeywordSuggestions(props: Parameters<typeof useFilterSuggestions>[number]) {
  return getFilterSuggestions(props).displayableKeywords
}

describe('useFilterSuggestions', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({})
  })

  it('shows suggestions for partial column names', () => {
    expect(getFieldSuggestions({columns: manyFields, query: 'as'})).toContainEqual({name: 'Assignees'})
    expect(getFieldSuggestions({columns: manyFields, query: 'lab'})).toContainEqual({name: 'Labels'})
    expect(getFieldSuggestions({columns: manyFields, query: 're'})).toEqual([{name: 'Repository'}, {name: 'Reviewers'}])
  })

  it('shows suggestions for negative queries', () => {
    expect(getFieldSuggestions({columns: manyFields, query: '-as'})).toContainEqual({name: 'Assignees'})
    expect(getFieldSuggestions({columns: manyFields, query: '-lab'})).toContainEqual({name: 'Labels'})
    expect(getFieldSuggestions({columns: manyFields, query: '-re'})).toEqual([
      {name: 'Repository'},
      {name: 'Reviewers'},
    ])
  })

  it('shows suggestions for keywords and columns', () => {
    expect(getKeywordSuggestions({columns: manyFields, query: 'i'})).toContainEqual('is')
    expect(getFieldSuggestions({columns: manyFields, query: 'i'})).toContainEqual({name: 'Iteration'})
  })

  it('does not show suggestions for columns if suggestColumns=false is specified', () => {
    expect(getKeywordSuggestions({columns: manyFields, query: 'i', options: {suggestColumns: false}})).toContainEqual(
      'is',
    )
    expect(getFieldSuggestions({columns: manyFields, query: 'i', options: {suggestColumns: false}})).toEqual([])
  })

  it('does not show any suggestions for query text not matching any fields', () => {
    expect(getFieldSuggestions({columns: manyFields, query: 'asd'})).toEqual([])
  })

  it('should be able to filter on hyphenated fields', () => {
    const columns = [...manyFields, {name: 'test-field'}]

    // Should get suggestions for a field that did not originally have hyphens
    expect(getFieldSuggestions({columns, query: 'due-'})).toEqual([{name: 'Due Date'}])

    // Should get suggestions for a field that had hyphens originally in its name
    expect(getFieldSuggestions({columns, query: 'test-'})).toEqual([{name: 'test-field'}])

    // Must also work with negated filters
    expect(getFieldSuggestions({columns, query: '-test-'})).toEqual([{name: 'test-field'}])
    expect(getFieldSuggestions({columns, query: '-due-'})).toEqual([{name: 'Due Date'}])
  })
})
