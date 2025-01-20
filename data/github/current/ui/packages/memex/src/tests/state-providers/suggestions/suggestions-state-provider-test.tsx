import {act, renderHook} from '@testing-library/react'

import {useSuggestionsContext} from '../../../client/state-providers/suggestions/use-suggestions-context'
import {mockSuggestedIssueTypes} from '../../../mocks/data/issue-types'
import {mockSuggestedLabels} from '../../../mocks/data/labels'
import {mockSuggestedMilestones} from '../../../mocks/data/milestones'
import {mockSuggestedAssignees} from '../../../mocks/data/users'
import {createSuggestionsStateProviderWrapper, splitArray} from './helpers'

const suggestionKey = 'issue:7'
const anotherSuggestionKey = 'issue:8'

describe('SuggestionsStateProvider', () => {
  describe('get/set SuggestedAssigneesForItem', () => {
    it('new values are merged alongside existing ones', () => {
      const [suggestions, moreSuggestions] = splitArray(mockSuggestedAssignees)

      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedAssigneesForItem(suggestionKey, suggestions)
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toEqual(suggestions)

      act(() => {
        result.current.setSuggestedAssigneesForItem(anotherSuggestionKey, moreSuggestions)
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toEqual(suggestions)
      expect(result.current.getSuggestedAssigneesForItem(anotherSuggestionKey)).toEqual(moreSuggestions)
    })

    it('returns undefined if no suggestions found', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})
      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toBeUndefined()
    })

    it('error objects can be stored and retrieved', () => {
      const error = new Error('test error')
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedAssigneesForItem(suggestionKey, error)
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toEqual(error)
    })
  })

  describe('get/set SuggestedLabelsForItem', () => {
    it('new values are merged alongside existing ones', () => {
      const [suggestions, moreSuggestions] = splitArray(mockSuggestedLabels)

      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedLabelsForItem(suggestionKey, suggestions)
      })

      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toEqual(suggestions)

      act(() => {
        result.current.setSuggestedLabelsForItem(anotherSuggestionKey, moreSuggestions)
      })

      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toEqual(suggestions)
      expect(result.current.getSuggestedLabelsForItem(anotherSuggestionKey)).toEqual(moreSuggestions)
    })

    it('returns undefined if no suggestions found', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})
      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toBeUndefined()
    })

    it('error objects can be stored and retrieved', () => {
      const error = new Error('test error')
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedLabelsForItem(suggestionKey, error)
      })

      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toEqual(error)
    })
  })

  describe('get/set SuggestedMilestonesForItem', () => {
    it('new values are merged alongside existing ones', () => {
      const [suggestions, moreSuggestions] = splitArray(mockSuggestedMilestones)

      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedMilestonesForItem(suggestionKey, suggestions)
      })

      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toEqual(suggestions)

      act(() => {
        result.current.setSuggestedMilestonesForItem(anotherSuggestionKey, moreSuggestions)
      })

      expect(result.current.getSuggestedMilestonesForItem(anotherSuggestionKey)).toEqual(moreSuggestions)
    })

    it('returns undefined if no suggestions found', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})
      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toBeUndefined()
    })

    it('error objects can be stored and retrieved', () => {
      const error = new Error('test error')
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedMilestonesForItem(suggestionKey, error)
      })

      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toEqual(error)
    })
  })

  describe('get/set SuggestedIssueTypesForItem', () => {
    it('new values are merged alongside existing ones', () => {
      const [suggestions, moreSuggestions] = splitArray(mockSuggestedIssueTypes)

      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedIssueTypesForItem(suggestionKey, suggestions)
      })

      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toEqual(suggestions)

      act(() => {
        result.current.setSuggestedIssueTypesForItem(anotherSuggestionKey, moreSuggestions)
      })

      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toEqual(suggestions)
      expect(result.current.getSuggestedIssueTypesForItem(anotherSuggestionKey)).toEqual(moreSuggestions)
    })

    it('returns undefined if no suggestions found', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})
      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toBeUndefined()
    })

    it('error objects can be stored and retrieved', () => {
      const error = new Error('test error')
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedIssueTypesForItem(suggestionKey, error)
      })

      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toEqual(error)
    })
  })

  describe('remove suggestions for a given item', () => {
    it('removes suggestions for the given item', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.setSuggestedAssigneesForItem(suggestionKey, mockSuggestedAssignees)
        result.current.setSuggestedLabelsForItem(suggestionKey, mockSuggestedLabels)
        result.current.setSuggestedMilestonesForItem(suggestionKey, mockSuggestedMilestones)
        result.current.setSuggestedIssueTypesForItem(suggestionKey, mockSuggestedIssueTypes)
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toEqual(mockSuggestedAssignees)
      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toEqual(mockSuggestedLabels)
      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toEqual(mockSuggestedMilestones)
      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toEqual(mockSuggestedIssueTypes)

      act(() => {
        result.current.removeSuggestions([suggestionKey])
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toBeUndefined()
    })

    it('can handle empty suggestions', () => {
      const {result} = renderHook(useSuggestionsContext, {wrapper: createSuggestionsStateProviderWrapper()})

      act(() => {
        result.current.removeSuggestions([suggestionKey])
      })

      expect(result.current.getSuggestedAssigneesForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedLabelsForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedMilestonesForItem(suggestionKey)).toBeUndefined()
      expect(result.current.getSuggestedIssueTypesForItem(suggestionKey)).toBeUndefined()
    })
  })
})
