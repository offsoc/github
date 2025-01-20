import {useEffect, useMemo, useRef, useState} from 'react'

import type {ShowSuggestionsEvent, Suggestions, TriggerAndSuggestions} from '../types'

// The triggerAndSuggestions array must be memoized by the caller
export const useAutocompleteTriggersAndSuggestions = (triggerAndSuggestions: TriggerAndSuggestions[]) => {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [event, setSuggestionEvent] = useState<ShowSuggestionsEvent | null>(null)

  const triggers = useMemo(() => triggerAndSuggestions.map(({trigger}) => trigger), [triggerAndSuggestions])

  const lastEventRef = useRef<ShowSuggestionsEvent | null>(null)

  const onHideSuggestions = () => {
    setSuggestionEvent(null)
    setSuggestions(null) // the effect would do this anyway, but this allows React to batch the update
  }

  // running the calculation in an effect (rather than in the onShowSuggestions handler) allows us
  // to automatically recalculate if the suggestions change while the menu is open
  useEffect(() => {
    if (!event) {
      setSuggestions(null)
      return
    }

    void (async function () {
      lastEventRef.current = event
      setSuggestions('loading')
      for (const {trigger, suggestionsCalculator} of triggerAndSuggestions) {
        if (event.trigger.triggerChar === trigger.triggerChar) {
          setSuggestions(await suggestionsCalculator(event.query))
          break
        }
      }
    })()
  }, [event, triggerAndSuggestions])

  const active = !!event

  return {triggers, suggestions, setSuggestionEvent, onHideSuggestions, active}
}
