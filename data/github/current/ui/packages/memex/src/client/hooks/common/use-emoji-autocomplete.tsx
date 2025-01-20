import type {InlineAutocompleteProps} from '@github-ui/inline-autocomplete'
import type {ShowSuggestionsEvent, Suggestions} from '@primer/react/experimental'
import {useEmojiSuggestions} from '@primer/react/lib-esm/drafts/MarkdownEditor/suggestions/_useEmojiSuggestions'
import {useMemo, useState} from 'react'

import {emojiCharMap} from '../../helpers/emojis'

const emojiSuggestions = Object.entries(emojiCharMap).map(([name, character]) => ({name, character}))

export const useEmojiAutocomplete = (): Omit<InlineAutocompleteProps, 'children'> => {
  const {calculateSuggestions, trigger} = useEmojiSuggestions(emojiSuggestions ?? [])

  const triggers = useMemo(() => [trigger], [trigger])

  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)

  const onShowSuggestions = async ({query}: ShowSuggestionsEvent) => {
    // no network request is made so this loading spinner never be visible, but it's likely
    // we'll use an API for this in the future so this is more future proof
    setSuggestions('loading')

    setSuggestions(await calculateSuggestions(query))
  }

  return {
    triggers,
    suggestions,
    onShowSuggestions,
    onHideSuggestions: () => setSuggestions(null),
  }
}
