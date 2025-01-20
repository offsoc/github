import {render} from '@github-ui/react-core/test-utils'

import {useFilterQuery} from '../context/FilterQueryContext'
import {useInput} from '../context/InputContext'
import {useFilter} from '../context/RootContext'
import {useSuggestions} from '../context/SuggestionsContext'

describe('context', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('useFilter and FilterContext', () => {
    it('throws an error if the filter context is not present when calling useFilter', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useFilter()).toThrow('useFilter must be used inside a FilterProvider')
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useFilterQuery and FilterQueryContext', () => {
    it('throws an error if the filter query context is not present when calling useFilterQuery', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useFilterQuery()).toThrow('useFilterQuery must be used inside a FilterQueryContext')
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useSuggestions and SuggestionsContext', () => {
    it('throws an error if the suggestions context is not present when calling useSuggestions', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useSuggestions()).toThrow('useSuggestions must be used inside a SuggestionsContext')
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useInput and InputContext', () => {
    it('throws an error if the input context is not present when calling useInput', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useInput()).toThrow('useInput must be used inside a InputContext')
        return null
      }

      render(<TestComponent />)
    })
  })
})
