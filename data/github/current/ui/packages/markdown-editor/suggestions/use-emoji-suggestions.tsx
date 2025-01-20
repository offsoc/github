// eslint-disable-next-line filenames/match-regex
import {ActionList} from '@primer/react'
import {useMemo} from 'react'
import type {UseSuggestionsHook} from '.'
import {suggestionsCalculator} from '.'
import {NO_MATCH} from '@github-ui/fuzzy-score/fuzzy-score'
import type {Suggestion, Trigger} from '@github-ui/inline-autocomplete/types'
import {applyTone} from '@github/g-emoji-element'

type EmojiSuggestionsConfig = {tone?: number} | undefined
type EmojiSuggestionsHook = UseSuggestionsHook<Emoji, EmojiSuggestionsConfig>

type BaseEmoji = {
  /** Name (shortcode) of the emoji. Do not include the wrapping `:` symbols. */
  name: string
}

type UnicodeEmoji = BaseEmoji & {
  /** Unicode representation of the emoji. */
  character: string

  /** Optional fallback URL for rendering emoji characters. */
  url?: string
}

type CustomEmoji = BaseEmoji & {
  /** URL to an image of the emoji. */
  url: string
}

export type Emoji = UnicodeEmoji | CustomEmoji

function isUnicodeEmoji(emoji: Emoji): emoji is UnicodeEmoji {
  return 'character' in emoji
}

// A set of emojis we should give slight preference to in the resultant set.
// We do this as the set of emojis comes in as an alphabetically sorted array, and we want to give some preference to the most commonly used emojis.
// Furthermore, we process the array for sorting in the scoring algorithm below.
const PRIORITIZED_EMOJIS = new Set(['+1', 'thumbsup', '-1'])

const trigger: Trigger = {
  triggerChar: ':',
  keepTriggerCharOnCommit: false,
}

// Render emoji with g-emoji when tone is provided.
// This will be consumed for users with `issues_react_server_emoji`.
// In the future, we can move towards using g-emoji universally.
const getUnicodeEmojiContent = (emoji: UnicodeEmoji, tone?: number) =>
  tone !== undefined ? (
    <g-emoji alias={emoji.name} tone={tone} fallback-src={emoji.url}>
      {emoji.character}
    </g-emoji>
  ) : (
    emoji.character
  )

const getEmojiValue = (emoji: Emoji, tone?: number): string => {
  if (!isUnicodeEmoji(emoji)) return `:${emoji.name}:`
  return tone !== undefined ? applyTone(emoji.character, tone) : emoji.character
}

const emojiToSuggestionWithTone = (tone?: number): ((emoji: Emoji) => Suggestion) => {
  return (emoji: Emoji): Suggestion => ({
    value: getEmojiValue(emoji, tone),
    key: emoji.name, // emoji characters may not be unique - ie haircut and haircut_man both have the same emoji codepoint. But names are guaranteed to be unique.
    render: props => (
      <ActionList.Item {...props}>
        <ActionList.LeadingVisual>
          {isUnicodeEmoji(emoji) ? (
            getUnicodeEmojiContent(emoji, tone)
          ) : (
            <img src={emoji.url} alt={`${emoji.name} emoji`} height="16" width="16" />
          )}
        </ActionList.LeadingVisual>
        {emoji.name}
      </ActionList.Item>
    ),
  })
}

// for emojis we don't use a fuzzy search because they are short and easy to accurately search through
const scoreSuggestion = (query: string, emoji: Emoji): number => {
  const name = emoji.name.toLowerCase()
  const q = query.toLowerCase()

  let score = 0
  if (name.includes(q)) {
    score += 5
    if (name.startsWith(q)) score += 5
  }

  // Given the other suggestions use @github-ui/fuzzy-score, we need to conform the "no match" value (which is -Infinity)
  return score === 0 ? NO_MATCH : score
}

const tieBreaker = (emojiOne: Emoji, emojiTwo: Emoji): number => {
  const nameOne = emojiOne.name.toLowerCase()
  const nameTwo = emojiTwo.name.toLowerCase()

  if (PRIORITIZED_EMOJIS.has(nameOne) && !PRIORITIZED_EMOJIS.has(nameTwo)) {
    return -1
  } else if (PRIORITIZED_EMOJIS.has(nameTwo) && !PRIORITIZED_EMOJIS.has(nameOne)) {
    return 1
  } else {
    return 0
  }
}

export const useEmojiSuggestions: EmojiSuggestionsHook = (emojis, opts) => {
  const calculateSuggestions = useMemo(
    () => suggestionsCalculator(emojis, scoreSuggestion, tieBreaker, emojiToSuggestionWithTone(opts?.tone), true),
    [emojis, opts?.tone],
  )
  return {
    calculateSuggestions,
    trigger,
  }
}
