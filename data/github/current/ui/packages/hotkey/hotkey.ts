// this file is a shim to allow importing @github/hotkey and is the only allowed import for @github/hotkey
// eslint-disable-next-line no-restricted-imports
export * from '@github/hotkey'

// - (?:^|,)    Starting with the beginning of the string or the comma delineating the previous item
// - ((?:[^,]|,(?=\+| |$))*(?:,(?=,))?)    The target capture group, consisting of:
//   - (?:[^,]|,(?=\+| |$))*    Any number of characters that are not commas, or are commas that are followed by a
//     plus sign, space, or end of string (ie, the commas in `,+Control` or `Control+, g` or `Control+,`)
//   - (?:,(?=,))?    Optionally ending with a comma followed by another comma, like the commas in `Control+,,n` or
//     `Control+,,,`
// - (?=,|$)    Ending with a comma or the end of the string
const chordOrKeyRegex = /(?:^|,)((?:[^,]|,(?=\+| |$))*(?:,(?=,))?)/g

export function splitHotkeyString(hotkey: string) {
  // "," is a valid key name, so we can't just use `String.split()`. Even with a regular expression we can't split, for
  // example "Control+,,," into ["Control+,", ","] without a lookbehind (not supported in Safari).

  // Instead, we match against all valid substrings:
  return Array.from(hotkey.matchAll(chordOrKeyRegex)).map(([, chord]) => chord!)
}
