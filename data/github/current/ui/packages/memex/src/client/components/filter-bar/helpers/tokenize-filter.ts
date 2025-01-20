import invariant from 'tiny-invariant'

/**
 * Represents the location of a token inside of a tokenized string.
 */
type TokenLocation = {
  /** The index of the first character of this token, relative to the beginning of the tokenized string */
  start: number
  /** The index of the last character of this token, relative to the beginning of the tokenized string */
  end: number
}

/** Represents a generic token from a string that was tokenized */
type Token = {
  /** The raw text of this token from the original string */
  text: string
  /** The location of this token within the string */
  location: TokenLocation
}

// Filter token kinds are loosely based on the tokenization used by VSCode,
// which uses TextMate grammars to syntax highlight code.
// For reference, see: https://macromates.com/manual/en/language_grammars.
/** Represents a single token (number, string, operator, etc.) in a Memex-style filter string */
export type FilterToken =
  | (Token & {kind: 'source.whitespace'})
  | (Token & {kind: 'punctuation.separator'})
  | (Token & {kind: 'punctuation.definition.string.begin'})
  | (Token & {kind: 'punctuation.definition.string.end'})
  | (Token & {kind: 'keyword.operator'})
  | (Token & {kind: 'keyword.operator.separator'})
  | (Token & {kind: 'keyword.operator.plus'})
  | (Token & {kind: 'keyword.operator.minus'})
  | (Token & {kind: 'keyword.operator.comparison'})
  | (Token & {kind: 'keyword.operator.range'})
  | (Token & {kind: 'variable'})
  | (Token & {kind: 'string'})
  | (Token & {kind: 'unknown'})
export type FilterTokenKind = FilterToken['kind']

const WHITESPACE = /^\s+/
const COMMA = /^,/
const GT = /^>/
const LT = /^</
const GTE = /^>=/
const LTE = /^<=/
const RANGE = /^\.\./
const MINUS = /^-/
const PLUS = /^\+/
const COLON = /^:/
const SINGLE_QUOTE = /^'/
const NOT_SINGLE_QUOTE = /^[^']*/
const DOUBLE_QUOTE = /^"/
const NOT_DOUBLE_QUOTE = /^[^"]*/
// A field cannot start with a dash, but it can contain one.
// The dash represents an excluded field.
const FIELD = /^-?[A-Za-z0-9_][A-Za-z0-9_-]*/
// Field values can be bare (no quotes) and contain certain characters
const FIELD_VALUE = /^([A-Za-z0-9_=!@#$%^*]+)([A-Za-z0-9_\-=!@#$%^*+]*)/
// Special field values that can be incremented/decremented like `@today+3` or `@current-2`
const ARITHMETIC_FIELD_VALUE = /^@(today|next|previous|current)/
// Matches any non-zero prefixed number (0, 1, 99, 123543, etc.)
const NUMBER = /^(0|[1-9][0-9]*)/
// Placeholder token for anything else that we don't recognize, except
// for whitespace, which should always be easy to recognize. This ensures
// that an input with an invalid token in the middle of the input should
// still be able to tokenize correctly after the unknown token.
const UNKNOWN = /^[^ ]+/

/**
 * Gets the next token from the string, and returns the remaining text (without the token)
 */
const getToken = (pattern: RegExp, tokenKind: FilterTokenKind, text: string, offset: number) => {
  const partialText = offset > 0 ? text.substring(offset) : text
  const match = partialText.match(pattern)
  if (match === null) {
    throw new Error(
      `Tried to emit a '${tokenKind}' token, but the pattern (${pattern.toString()}) did not match. Did you check if the pattern has a token before trying to emit it?\n\nText: ${partialText}`,
    )
  }

  const location: TokenLocation = {
    start: offset,
    end: match[0].length - 1 + offset,
  }

  // The token that we found in the text
  const token: FilterToken = {kind: tokenKind, text: match[0], location}

  // The text remaining after the token
  const remainder = partialText.replace(pattern, '')

  return {token, remainder, length: token.text.length}
}

/**
 * Takes a filter string and turns it into a list of tokens in the same order as the original string.
 *
 * This function can accept **valid or invalid** input, though invalid input is not guaranteed to always return a
 * logical result. However, a best attempt is made to ensure that all text appears in the output and that tokens
 * are valid up until any malformed input.
 * @param query The filter string to parse.
 * @returns An array of tokens.
 */
// While some tokenizers are a first step in the process of parsing, this tokenizer is intended only to
// be used for syntax highlighting, suggestions/autocompletion, etc. in order to make the code simpler.
export function tokenizeFilter(query: string): Array<FilterToken> {
  const tokens: Array<FilterToken> = []

  let offset = 0

  // Push a token into the list and update the character offset for token locations,
  // returns the remaining text after this token
  const pushToken = (token: FilterToken | Omit<FilterToken, 'location'>) => {
    // Accept either a token with or without a location to be more convenient for development.
    if ('location' in token) {
      tokens.push(token)
      offset = token.location.end + 1
    } else {
      // If a location is not passed, we will assume it comes immediately after the previous offset
      tokens.push({...token, location: {start: offset, end: offset + token.text.length - 1}})
      offset += token.text.length
    }
  }

  // Helper function for grabbing a token from the given input at the current offset
  // and then pushing the token into the tokens array.
  const addToken = (pattern: RegExp, tokenKind: FilterTokenKind) => {
    const {token} = getToken(pattern, tokenKind, query, offset)
    pushToken(token)
    return token
  }

  const hasToken = (pattern: RegExp, text?: string): boolean => pattern.test(text ?? query.substring(offset))

  while (offset < query.length) {
    if (hasToken(WHITESPACE)) {
      addToken(WHITESPACE, 'source.whitespace')
    } else if (hasToken(MINUS)) {
      addToken(MINUS, 'keyword.operator.minus')
    } else if (hasToken(FIELD)) {
      // If it looks like a field, we will need to check if it's a free text search or a field name
      const {token, remainder} = getToken(FIELD, 'unknown', query, offset)

      if (hasToken(COLON, remainder)) {
        // Field like `x:y`, so it's a variable
        pushToken({...token, kind: 'variable'})
      } else {
        // Free text keyword search
        pushToken({...token, kind: 'string'})
      }

      if (hasToken(COLON)) {
        addToken(COLON, 'keyword.operator.separator')

        // Match additional operators after the colon
        if (hasToken(GTE)) {
          addToken(GTE, 'keyword.operator.comparison')
        } else if (hasToken(GT)) {
          addToken(GT, 'keyword.operator.comparison')
        } else if (hasToken(LTE)) {
          addToken(LTE, 'keyword.operator.comparison')
        } else if (hasToken(LT)) {
          addToken(LT, 'keyword.operator.comparison')
        }

        // Keep expecting values until we hit some whitespace or
        // run out of values in the string.
        while ((hasToken(FIELD_VALUE) || hasToken(ARITHMETIC_FIELD_VALUE)) && !hasToken(WHITESPACE)) {
          if (hasToken(ARITHMETIC_FIELD_VALUE)) {
            const specialValueToken = addToken(ARITHMETIC_FIELD_VALUE, 'string')

            // Look for a +- number after a special value like `@today+3` or `@current-2`
            if (hasToken(PLUS)) {
              addToken(PLUS, 'keyword.operator.plus')
              if (hasToken(NUMBER)) {
                addToken(NUMBER, 'string')
              }
            } else if (hasToken(MINUS)) {
              addToken(MINUS, 'keyword.operator.minus')
              if (hasToken(NUMBER)) {
                addToken(NUMBER, 'string')
              }
            } else if (hasToken(FIELD_VALUE)) {
              // If there is a field value immediately following this, then combine it to handle the case
              // where we eagerly matched something like `@previous` inside `@previousthensomeotherstuff`
              const {token: nextToken} = getToken(FIELD_VALUE, 'string', query, offset)
              specialValueToken.location.end += nextToken.text.length
              specialValueToken.text += nextToken.text
              offset += nextToken.text.length
            }
          } else if (hasToken(FIELD_VALUE)) {
            addToken(FIELD_VALUE, 'string')
          }

          // Might be a range, which looks something like `(VALUE)..(VALUE)`
          if (hasToken(RANGE)) {
            addToken(RANGE, 'keyword.operator.range')
          } else if (hasToken(COMMA)) {
            // expect a comma for a possible next value
            addToken(COMMA, 'punctuation.separator')
          }
        }
      }
    } else if (hasToken(SINGLE_QUOTE) || hasToken(DOUBLE_QUOTE)) {
      const [QUOTE, NOT_QUOTE] = hasToken(SINGLE_QUOTE)
        ? [SINGLE_QUOTE, NOT_SINGLE_QUOTE]
        : [DOUBLE_QUOTE, NOT_DOUBLE_QUOTE]

      addToken(QUOTE, 'punctuation.definition.string.begin')

      // Search for a matching single quote
      while (!hasToken(QUOTE) && offset < query.length) {
        if (hasToken(NOT_QUOTE)) {
          addToken(NOT_QUOTE, 'string')
        }
      }

      if (hasToken(QUOTE)) {
        addToken(QUOTE, 'punctuation.definition.string.end')
      }
    } else if (hasToken(COLON)) {
      addToken(COLON, 'keyword.operator.separator')
    } else if (hasToken(COMMA)) {
      addToken(COMMA, 'punctuation.separator')
    } else if (hasToken(RANGE)) {
      addToken(RANGE, 'keyword.operator.range')
    } else if (hasToken(PLUS)) {
      addToken(PLUS, 'keyword.operator.plus')
    } else if (hasToken(ARITHMETIC_FIELD_VALUE)) {
      const token = addToken(ARITHMETIC_FIELD_VALUE, 'string')

      // Look for a +- number after a special value like `@today+3` or `@current-2`
      if (hasToken(PLUS)) {
        addToken(PLUS, 'keyword.operator.plus')
        if (hasToken(NUMBER)) {
          addToken(NUMBER, 'string')
        }
      } else if (hasToken(MINUS)) {
        addToken(MINUS, 'keyword.operator.minus')
        if (hasToken(NUMBER)) {
          addToken(NUMBER, 'string')
        }
      } else if (hasToken(FIELD_VALUE)) {
        // If there is a field value immediately following this, then combine it to handle the case
        // where we eagerly matched something like `@previous` inside `@previousthensomeotherstuff`
        const {token: nextToken} = getToken(FIELD_VALUE, 'string', query, offset)
        token.location.end += nextToken.text.length
        token.text += nextToken.text
        offset += nextToken.text.length
      }
    } else if (hasToken(FIELD_VALUE)) {
      // Free text keyword search
      addToken(FIELD_VALUE, 'string')
    } else if (hasToken(UNKNOWN)) {
      addToken(UNKNOWN, 'unknown')
    }
  }

  return tokens
}

const getTokensBeforeCursor = (tokens: Array<FilterToken>, cursorPosition: number): Array<FilterToken> => {
  return tokens.filter(token => token.location.end <= cursorPosition)
}

const getTokensAfterCursor = (tokens: Array<FilterToken>, cursorPosition: number): Array<FilterToken> => {
  return tokens.filter(token => token.location.start >= cursorPosition)
}

/**
 * Searches for some kind of token in the token array, starting from the `start` index and moving
 * backwards until the beginning of the array or the stop condition (`end`) (if specified).
 * @param tokens The token array to search.
 * @param options.kind The kind(s) of token to search for.
 * @param options.start Where to begin the reverse search
 * @param options.end (optional) When to stop searching: either a specific offset or token kind(s)
 */
export const findLastToken = (
  tokens: Array<FilterToken>,
  options: {
    kind: FilterTokenKind | Array<FilterTokenKind>
    start: number | FilterToken
    end?: number | FilterToken | FilterTokenKind | Array<FilterTokenKind>
  },
): FilterToken | null => {
  const {kind, start, end} = options
  const tokensBeforeCursor =
    typeof start === 'number'
      ? getTokensBeforeCursor(tokens, start)
      : getTokensBeforeCursor(tokens, start.location.start)

  const tokenKinds = Array.isArray(kind) ? kind : [kind]

  for (let i = tokensBeforeCursor.length - 1; i >= 0; i--) {
    const token = tokensBeforeCursor[i]
    invariant(token != null, 'Token must exist')
    // Check if any of the token kinds much that token's kind, using prefix matching
    // example: `keyword.operator` will match `keyword.operator.comparison`
    // example: `keyword.operator.comparison` will NOT match `keyword.operator`, since it is more specific
    if (tokenKinds.some(tokenKind => token.kind.startsWith(tokenKind))) {
      return token
    }

    // If there was an end condition specified, check it now.
    if (end) {
      if (typeof end === 'number') {
        // A specific index to stop at
        if (token.location.end >= end) {
          return null
        }
      } else if (Array.isArray(end) || typeof end === 'string') {
        const endTokenKinds = Array.isArray(end) ? end : [end]
        // A specific kind of token to stop at
        if (endTokenKinds.includes(token.kind)) {
          return null
        }
      } else {
        // A specific token to stop at
        if (token.location.end >= end.location.start) {
          return null
        }
      }
    }
  }
  return null
}

/**
 * Searches for some kind of token in the token array, starting from the `start` index and moving
 * forward until the end of the array or the stop condition (`end`) (if specified).
 * @param tokens The token array to search.
 * @param options.kind The kind(s) of token to search for.
 * @param options.start Where to begin the search
 * @param options.end (optional) When to stop searching: either a specific offset or token kind(s)
 */
export const findNextToken = (
  tokens: Array<FilterToken>,
  options: {
    kind: FilterTokenKind | Array<FilterTokenKind>
    start: number | FilterToken
    end?: number | FilterToken | FilterTokenKind | Array<FilterTokenKind>
  },
): FilterToken | null => {
  const {kind, start, end} = options
  const tokensAfterCursor =
    typeof start === 'number' ? getTokensAfterCursor(tokens, start) : getTokensAfterCursor(tokens, start.location.start)

  const tokenKinds = Array.isArray(kind) ? kind : [kind]

  for (const token of tokensAfterCursor) {
    // Check if any of the token kinds much that token's kind, using prefix matching
    // example: `keyword.operator` will match `keyword.operator.comparison`
    // example: `keyword.operator.comparison` will NOT match `keyword.operator`, since it is more specific
    if (tokenKinds.some(tokenKind => token.kind.startsWith(tokenKind))) {
      return token
    }

    // If there was an end condition specified, check it now.
    if (end) {
      if (typeof end === 'number') {
        // A specific index to stop at
        if (token.location.start >= end) {
          return null
        }
      } else if (Array.isArray(end) || typeof end === 'string') {
        const endTokenKinds = Array.isArray(end) ? end : [end]
        // A specific kind of token to stop at
        if (endTokenKinds.includes(token.kind)) {
          return null
        }
      } else {
        // A specific token to stop at
        if (token.location.start >= end.location.start) {
          return null
        }
      }
    }
  }
  return null
}

/**
 * Expects an ordered list of tokens to be present, or else returns nothing
 * if it does not match. For example, matching a `string`, `operator`, and then
 * `string` would either return an array of 3 tokens or null.
 * @param tokens The tokenized string to search.
 * @param options.kinds The token sequence to search for.
 * @param options.start Where to begin the search
 * @returns An array of tokens, or null if it didn't match completely.
 */
export function getTokens(
  tokens: Array<FilterToken>,
  options: {
    kinds: Array<FilterTokenKind>
    start?: number | FilterToken
  },
): Array<FilterToken> | null {
  const {kinds, start = 0} = options
  const tokensFound: Array<FilterToken> = []
  const startIndex = typeof start === 'number' ? start : start.location.end

  for (const tokenToFind of kinds) {
    const lastTokenFound = tokensFound[tokensFound.length - 1]
    const tokensAfterLastToken = getTokensAfterCursor(
      tokens,
      lastTokenFound ? lastTokenFound.location.end + 1 : startIndex,
    )
    const nextToken = tokensAfterLastToken[0]
    if (nextToken?.kind.startsWith(tokenToFind)) {
      tokensFound.push(nextToken)
    } else {
      return null
    }
  }
  return tokensFound
}
