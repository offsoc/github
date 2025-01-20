// Gets the length of code-points from a String.
//
// This is different to `string.length` which returns the amount of utf-8
// bytes, which is a different metric as - for example - the poo emoji is 2
// utf-8 bytes, but 1 unicode code point.
//
// See http://blog.jonnew.com/posts/poo-dot-length-equals-two for more.
export function getUtf8StringLength(str: string): number {
  const joiner = '\u200D'
  const split = str.split(joiner)
  let count = 0

  for (const s of split) {
    // removing the variation selectors
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length
    count += num
  }

  // assuming the joiners are used appropriately
  return count / split.length
}
/**
 * Replace text in a textarea with a new string and
 * place the cursor at the selectionEnd position.
 * @param textarea an `<input>` or `<textarea>` element
 * @param oldText The text to replace
 * @param newText The new text to replace with
 * @param isFocused whether the textarea is currently in focus
 * @returns The new text
 */
export function replaceText(
  textarea: HTMLInputElement | HTMLTextAreaElement,
  oldText: string,
  newText: string,
  isFocused = true,
): string {
  let beginning = textarea.value.substring(0, textarea.selectionEnd || 0)
  let remaining = textarea.value.substring(textarea.selectionEnd || 0)
  beginning = beginning.replace(oldText, newText)
  remaining = remaining.replace(oldText, newText)

  setTextareaValueAndCursor(textarea, beginning + remaining, beginning.length, isFocused)

  return newText
}

/**
 * Replace selected text in a textarea with a new string.
 * If the selection is empty, the old text is replaced by the
 * new text in the whole textarea.
 * @param textarea an `<input>` or `<textarea>` element
 * @param oldText The text to replace
 * @param newText The new text to replace with
 * @returns The new text
 */
export function replaceSelection(
  textarea: HTMLInputElement | HTMLTextAreaElement,
  oldText: string,
  newText: string,
): string {
  if (textarea.selectionStart === null || textarea.selectionEnd === null) {
    return replaceText(textarea, oldText, newText)
  }
  const beginning = textarea.value.substring(0, textarea.selectionStart)
  const remaining = textarea.value.substring(textarea.selectionEnd)

  setTextareaValueAndCursor(textarea, beginning + newText + remaining, beginning.length)

  return newText
}

type InsertOptions = {
  appendNewline?: boolean
}
/**
 * Inserts text into a text input and moves the cursor appropriately.
 * If the cursor happens to be in the middle of a line, or the textarea isn't empty,
 * we add a newline character before the inserted text. We also advance the cursor
 * appropriately
 * @param textarea an `<input>` or `<textarea>` element
 * @param text The text to add
 * @param appendNewline optionally adds a `\n` character after `text`
 */
export function insertText(
  textarea: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: InsertOptions = {},
): string {
  const point = textarea.selectionEnd || 0
  const beginning = textarea.value.substring(0, point)
  const remaining = textarea.value.substring(point)
  const newline = textarea.value === '' || beginning.match(/\n$/) ? '' : '\n'
  const trailingNewline = options.appendNewline ? '\n' : ''
  const insertedText = newline + text + trailingNewline

  textarea.value = beginning + insertedText + remaining
  const newPoint = point + insertedText.length
  textarea.selectionStart = newPoint
  textarea.selectionEnd = newPoint
  textarea.dispatchEvent(new CustomEvent('change', {bubbles: true, cancelable: false}))
  textarea.focus()
  return insertedText
}

/**
 * Helper function to set the value of a textarea and move the cursor to a given position.
 * Emits a `change` event.
 * @param textarea an `<input>` or `<textarea>` element
 * @param value The new value
 * @param cursor The position to move the cursor to
 * @param isFocused whether the textarea is currently in focus
 */
function setTextareaValueAndCursor(
  textarea: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  cursor: number,
  isFocused = true,
) {
  textarea.value = value

  if (isFocused) {
    textarea.selectionStart = cursor
    textarea.selectionEnd = cursor
  }

  textarea.dispatchEvent(new CustomEvent('change', {bubbles: true, cancelable: false}))
}

// Returns the character index for a given byte position, taking character encoding into account
// Example usage for this method: highlighing text in a textarea that may contain non-UTF8 characters
//
// For context, in Javascript, strings are UTF16. However, Codemirror uses simple Javascript
// indexing, that isn't Unicode aware. This leads to incorrect highlighting.
//
// For example, '💩' is represented as 4 bytes. In Javascript, it has length 2
// and is composed of a surrogate pair (2 code points). '💩'.length is 2.
// Given text string such as 'hello 💩 world', this would be represented in hex as:
// ┌────────┬─────────────────────────┬─────────────────────────┬────────┬────────┐
// │00000000│ 68 65 6c 6c 6f 20 f0 9f ┊ 92 a9 20 77 6f 72 6c 64 │hello ××┊×× world│
// └────────┴─────────────────────────┴─────────────────────────┴────────┴────────┘
// The string 'world' appears at byte positions (11, 16), but in Javascript `str.slice(11, 16)` returns 'rld'.
// The correct position in Javascript, and codemirror, would be: (9, 14).
//
// When encoded using `TextEncoder#encodeInto` with '💩', we'd get an object with
// the following properties: {written: 4, read: 2}. This discrepancy informs us
// that we need to offset the start and end positions by 2.
export function GetCharIndexFromBytePosition(str: string, pos: number): number {
  // The string iterator [...str] is unicode aware, and allows us to correctly
  // iterate over each grapheme in the string. Iterating over `str[i]` would
  // not work, as it separates the astral symbol into each of its surrogates.
  const contents = [...str]
  const encoder = new TextEncoder()

  // Astral code points in Javascript are a surrogate pair of 2 UTF16 code units, or 4 bytes
  const u8array = new Uint8Array(4)

  for (let i = 0; i < contents.length; i++) {
    const char = contents[i]!
    const {written, read} = encoder.encodeInto(char, u8array)
    if (!written || !read) {
      return -1
    }
    const diff = written - read
    if (diff === 0) {
      continue
    }

    if (i < pos) {
      pos -= diff
    }

    if (i >= pos) {
      break
    }
  }

  return pos
}
