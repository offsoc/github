import useIsMounted from '@github-ui/use-is-mounted'
import type {Mentionable, Reference, SavedReply} from '@primer/react/experimental'
import {useEffect, useState} from 'react'

import type {ApiMarkdownSubject} from '../api/types'
import {useGetMentionSuggestions} from '../api/suggestions/mention-suggestions'
import {useGetReferenceSuggestions} from '../api/suggestions/reference-suggestions'
import {useGetSavedReplies} from '../api/saved-replies'

interface MarkdownSuggestionsData {
  mentions: Mentionable[]
  references: Reference[]
  savedReplies: SavedReply[]
}

const emptySuggestionData = {mentions: [], references: [], savedReplies: []}

export function useMarkdownSuggestions(apiSubject: Partial<ApiMarkdownSubject> = {}): MarkdownSuggestionsData {
  const isMounted = useIsMounted()

  const getMentionSuggestions = useGetMentionSuggestions(apiSubject)
  const getReferenceSuggestions = useGetReferenceSuggestions(apiSubject)

  const getSavedReplies = useGetSavedReplies()

  const [data, setData] = useState<MarkdownSuggestionsData>(emptySuggestionData)

  useEffect(() => {
    const fetchSuggestions = async () => {
      const [mentions, references, savedReplies] = await Promise.all([
        getMentionSuggestions(),
        getReferenceSuggestions(),
        getSavedReplies(),
      ])

      if (isMounted() && (mentions.length || references.length || savedReplies.length)) {
        setData({mentions, references, savedReplies})
      }
    }

    void fetchSuggestions()
  }, [getMentionSuggestions, getReferenceSuggestions, getSavedReplies, isMounted])

  return data
}
