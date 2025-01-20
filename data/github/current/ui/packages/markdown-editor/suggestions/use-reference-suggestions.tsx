// eslint-disable-next-line filenames/match-regex
import type {Suggestion, Trigger} from '@github-ui/inline-autocomplete/types'
import {ActionList, Text} from '@primer/react'
import {useMemo} from 'react'
import type {UseSuggestionsHook} from '.'
import {suggestionsCalculator} from '.'
import {SafeHTMLText} from '@github-ui/safe-html'
import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'

export type Reference = {
  titleHtml: string
  titleText: string
  id: string
  iconHtml?: string
}

const trigger: Trigger = {
  triggerChar: '#',
  multiWord: true,
}

const referenceToSuggestion = (reference: Reference): Suggestion => ({
  value: reference.id,
  render: props => (
    <ActionList.Item {...props}>
      {reference.iconHtml && (
        <ActionList.LeadingVisual>
          <SafeHTMLText unverifiedHTML={reference.iconHtml} />
        </ActionList.LeadingVisual>
      )}
      <Text
        sx={{
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'block',
          overflow: 'hidden',
          maxWidth: 400,
        }}
      >
        <SafeHTMLText unverifiedHTML={reference.titleHtml} />
      </Text>{' '}
      <ActionList.Description>#{reference.id}</ActionList.Description>
    </ActionList.Item>
  ),
})

const scoreSuggestion = (query: string, reference: Reference): number => {
  return fuzzyScore(query, `${reference.id} ${reference.titleText}`)
}

// No additional tie breaker logic currently implemented here.
const tieBreaker = (_referenceOne: Reference, _referenceTwo: Reference): number => {
  return 0
}

export const useReferenceSuggestions: UseSuggestionsHook<Reference> = references => {
  const calculateSuggestions = useMemo(() => {
    const calculator = suggestionsCalculator(references, scoreSuggestion, tieBreaker, referenceToSuggestion)
    return async (query: string) => {
      if (/^\d+\s/.test(query)) return [] // don't return anything if the query is in the form #123 ..., assuming they already have the number they want
      return calculator(query)
    }
  }, [references])
  return {
    calculateSuggestions,
    trigger,
  }
}
