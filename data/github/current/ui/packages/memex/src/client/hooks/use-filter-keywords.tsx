import {useCallback} from 'react'

export const FilterKeywords = [
  {keyword: 'is', isFilterable: true, description: 'Filter by item state or object type'},
  {keyword: 'no', isFilterable: false, description: ''},
  {keyword: 'has', isFilterable: false, description: ''},
  {
    keyword: 'reason',
    isFilterable: true,
    description: "Filter by item's state reason",
  },
  {keyword: 'last-updated', isFilterable: true, description: 'Filter by item last updated'},
  {keyword: 'updated', isFilterable: true, description: "Filter by item's updated date"},
]

export function useFilterKeywords() {
  const isKeywordQualifier = useCallback((text: string) => {
    return FilterKeywords.map(key => key.keyword).includes(text)
  }, [])

  return {FilterKeywords, isKeywordQualifier}
}
