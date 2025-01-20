import {renderHook, waitFor} from '@testing-library/react'
import {act} from 'react'

import {useAutocompleteTriggersAndSuggestions} from '../hooks/use-autocomplete-triggers-and-suggestions'
import type {Suggestion, TriggerAndSuggestions} from '../types'

describe('useAutocompleteTriggersAndSuggestions', () => {
  it('should return the correct suggestions for each trigger', async () => {
    const hashSuggestions = ['tag1', 'tag2', 'tag3'] as Suggestion[]
    const atSuggestions = ['user1', 'user2', 'user3'] as Suggestion[]
    const triggerAndSuggestions: TriggerAndSuggestions[] = [
      {
        trigger: {triggerChar: '@'},
        suggestionsCalculator: (query: string) =>
          Promise.resolve(atSuggestions.filter(suggestion => (suggestion as string).includes(query))),
      },
      {
        trigger: {triggerChar: '#'},
        suggestionsCalculator: (query: string) =>
          Promise.resolve(hashSuggestions.filter(suggestion => (suggestion as string).includes(query))),
      },
    ]

    const {result} = renderHook(() => useAutocompleteTriggersAndSuggestions(triggerAndSuggestions))

    act(() => {
      result.current.setSuggestionEvent({trigger: {triggerChar: '@'}, query: 'user'})
    })

    expect(result.current.triggers).toEqual([{triggerChar: '@'}, {triggerChar: '#'}])
    await waitFor(() => {
      expect(result.current.suggestions).toEqual(atSuggestions)
    })
    expect(result.current.active).toBe(true)
  })

  it('should return loading when the suggestions are being fetched', () => {
    const triggerAndSuggestions: TriggerAndSuggestions[] = [
      {
        trigger: {triggerChar: '@'},
        suggestionsCalculator: async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return ['user1', 'user2', 'user3']
        },
      },
    ]

    const {result} = renderHook(() => useAutocompleteTriggersAndSuggestions(triggerAndSuggestions))

    const {setSuggestionEvent} = result.current

    act(() => {
      setSuggestionEvent({trigger: {triggerChar: '@'}, query: 'user'})
    })
    expect(result.current.suggestions).toEqual('loading')
  })

  it('should hide suggestions when onHideSuggestions is called', () => {
    const triggerAndSuggestions: TriggerAndSuggestions[] = [
      {
        trigger: {triggerChar: '@'},
        suggestionsCalculator: async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return ['user1', 'user2', 'user3']
        },
      },
    ]

    const {result} = renderHook(() => useAutocompleteTriggersAndSuggestions(triggerAndSuggestions))

    const {setSuggestionEvent, onHideSuggestions} = result.current

    act(() => {
      setSuggestionEvent({trigger: {triggerChar: '@'}, query: 'user'})
    })
    expect(result.current.suggestions).toEqual('loading')

    act(() => {
      onHideSuggestions()
    })
    expect(result.current.suggestions).toEqual(null)
  })
})
