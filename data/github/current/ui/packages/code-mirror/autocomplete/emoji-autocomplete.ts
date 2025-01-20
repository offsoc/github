import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  acceptCompletion,
  autocompletion,
} from '@codemirror/autocomplete'
import {Prec} from '@codemirror/state'
import {keymap} from '@codemirror/view'
import memoize from '@github/memoize'
import {autocompleteTheme} from './theme'

interface Emoji {
  name: string
  src: string
  emoji?: string
}

interface EmojiResponse {
  [name: string]: [src: string, emoji?: string]
}

const emojiRequest = memoize(async function getEmojis() {
  const request = new Request('/autocomplete/emojis_for_editor', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  const res = await fetch(request)
  if (res.status !== 200) {
    throw new Error(`emoji request failed with a ${res.status}`)
  }

  const emojiData: EmojiResponse = await res.json()

  // flatten the response into something more reasonable to work with
  const emojis: Emoji[] = Object.keys(emojiData).map(emojiName => {
    const emoji = emojiData[emojiName]!

    return {
      name: emojiName,
      src: emoji[0],
      emoji: emoji[1],
    }
  })

  return emojis
})

function emojiAutocompleteContext(context: CompletionContext, data: Emoji[] = []): CompletionResult | null {
  const word = context.matchBefore(/:\w+/)

  if (!word) return null
  if (word && word.from === word.to && !context.explicit) {
    return null
  }

  const filteredEmojis = data.filter(emoji => {
    return emoji.name.indexOf(word.text.replace(':', '')) !== -1
  })

  const completions: Completion[] = filteredEmojis.map(emoji => {
    return {
      label: emoji.name,

      // some emojis don't have a unicode representation and get rendered from markdown pipeline
      apply: emoji.emoji || `:${emoji.name}:`,

      // we can only talk to the render via Completion objects - hack the src in this way
      // alternatively we could push the emoji data into a global store and have the render look it up
      type: emoji.src,
    }
  })

  return {
    from: word.from,
    to: word.to,
    options: completions,
    filter: false,
  }
}

export function emojiAutocomplete() {
  return [
    autocompleteTheme,
    autocompletion({
      override: [
        async (context: CompletionContext) => {
          const emojiData = await emojiRequest()
          return emojiAutocompleteContext(context, emojiData)
        },
      ],
      icons: false,
      addToOptions: [
        {
          render: (completion: Completion) => {
            const emojiOption = document.createElement('img')
            emojiOption.className = 'emoji emoji-result mr-2'
            emojiOption.height = 20
            emojiOption.width = 20
            emojiOption.alt = `:${completion.label}:`
            emojiOption.src = completion.type!
            emojiOption.setAttribute('async', '')

            return emojiOption
          },
          position: 0,
        },
      ],
    }),
    Prec.highest(keymap.of([{key: 'Tab', run: acceptCompletion}])),
  ]
}
