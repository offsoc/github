/**
 * Lazy iterator that returns one match at a time
 * @param regex regular expression used for the search
 * @param text raw text blob
 * @param startFromLine line in the text blob indexed from 0
 */

enum MatchableType {
  Text,
  Symbol,
}

export interface Matchable {
  kind: MatchableType
  regexp: RegExp
}

export function symbolMatchable(symbol: string) {
  const escapedRegex = `(\\W|^)${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\W|$)`
  return {
    kind: MatchableType.Symbol,
    regexp: new RegExp(escapedRegex, 'g'),
  }
}

export function textMatchable(query: string) {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return {
    kind: MatchableType.Text,
    regexp: new RegExp(escapedQuery, 'gi'),
  }
}

export function* getMatchGenerator(regex: Matchable, lines: string[], startFromLine = 0) {
  for (let line = startFromLine; line < lines.length; line++) {
    const snippet = lines[line]!

    let match: RegExpExecArray | null

    while ((match = regex.regexp.exec(snippet)) !== null) {
      let matchContent = match[0]
      let column = match.index

      // Symbol matcher regex match leading whitespace, but don't actually include
      // that in the match positions! This is necessary because regex
      // lookbehinds aren't widely supported in browsers...
      if (regex.kind === MatchableType.Symbol) {
        if (matchContent.length > 0 && /\W/.test(matchContent[0]!)) {
          matchContent = matchContent.substring(1)
          column += match[0].length - matchContent.length
        }
        if (matchContent.length > 0 && /\W/.test(matchContent[matchContent.length - 1]!)) {
          matchContent = matchContent.substring(0, matchContent.length - 1)
        }
      }

      yield {
        line,
        column,
        columnEnd: column + matchContent.length,
        text: snippet,
      }
    }
  }
}
