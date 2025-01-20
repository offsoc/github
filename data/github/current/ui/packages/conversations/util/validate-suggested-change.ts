import type {ValidationResult} from '@github-ui/entity-validators'

/**
 * Validates any inline suggested changes contained in markdown input. A invalid result
 * is returned if any of the suggested changes contained in the markdown are invalid. A
 * suggested change is invalid if is identical to the supplied diff line content.
 */
export function validateSuggestedChange(markdown: string, diffLineContent: string): ValidationResult {
  const duplicateSuggestionErrorMessage = 'Suggested change cannot be the same as the original line'

  const suggestedChanges = suggestedChangesFromText(markdown)

  for (const suggestedChangeText of suggestedChanges) {
    if (suggestedChangeText === diffLineContent) {
      return {
        isValid: false,
        errorMessage: duplicateSuggestionErrorMessage,
      }
    }
  }

  return {
    isValid: true,
    errorMessage: '',
  }
}

/**
 * Extracts a list of suggested changes from a comment string. Handles most of the edgecases for fence blocks according to the CommonMark spec (https://spec.commonmark.org/0.28/#fenced-code-blocks)
 *
 * Handles:
 * - opening fence line may start with up to 3 spaces (Tabs not supported)
 * - if opening line is indented, an equal amount of leading indention will be trimmed from the content lines
 * - The fence is 3 or more backticks or ~'s
 * - The closing fence must be of equal or greater length than the opening fence
 * - Fences must be on their own lines but may have trailing whitespace
 * Does not handle:
 * - If a fence block is not manually closed, it will auto-close at the end of the current content block (e.g. end of a list item). Behavior: non-closed fence blocks are ignored.
 * - If a fence is indented and content contains a leading tab, then the tab is treated a 4 spaces
 * and de-indented accorindingly. Behavior: Tabs are not de-indented.
 */
function suggestedChangesFromText(text: string, memo: string[] = []): string[] {
  if (text === '') {
    return memo
  }

  // Find the next opening fence to get things started
  const fenceMatch = text.match(suggestionFenceRegExp())
  if (!fenceMatch) {
    return memo
  }

  const fence = fenceMatch.groups!['fence']
  if (!fence) {
    return memo
  }

  const fenceChar = fence.includes('~') ? '~' : '`'
  // Build a strict regex based on what the opening fence looks like. The opening
  // fence dictates the format of the closing fence.
  const suggestionMatch = text.match(suggestionRegexp(fenceChar, fence.length))
  if (!suggestionMatch) {
    return memo
  }

  let indentSize = 0
  const indent = fenceMatch.groups!['indent']!
  if (indent !== '') {
    indentSize = indent.length
  }

  let suggestion = suggestionMatch.groups!['suggestion']!
  // Strip off leading indentation based on the fence opening
  if (indentSize > 0) {
    const search = new RegExp(`^ {0,${indentSize}}`, 'm')
    suggestion = suggestion.replace(search, '')
  }

  memo.push(suggestion)

  // Recurse with the rest of the string
  const subtext = text.slice(suggestionMatch.index! + suggestionMatch[0].length)
  return suggestedChangesFromText(subtext, memo)
}

function suggestionFenceRegExp(fenceChars: string[] = ['`', '~'], fixed?: number): RegExp {
  const fenceLength = fixed ? `{${fixed}}` : '{3,}'
  const fenceConstraints = fenceChars.map(char => {
    return `${char}${fenceLength}`
  })

  return new RegExp(`^(?<indent> {0,3})(?<fence>${fenceConstraints.join('|')})suggestion[ \t]*$`, 'm')
}

function suggestionRegexp(fenceChar: string, fixed: number): RegExp {
  const openFence = suggestionFenceRegExp([fenceChar], fixed)
  return new RegExp(
    `${openFence.source}(?:\r?\n)(?<suggestion>.*?)(?:\r?\n)^ {0,3}${fenceChar}{${fixed},}[ \t]*$`,
    'ms',
  )
}
