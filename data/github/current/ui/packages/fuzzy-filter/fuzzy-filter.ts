// Example
// ```js
//     fuzzyScore("foo.html", "foo")
//     // => 0.6458333333333334
// ```
//
// ```js
//     // Compute re once
//     re = fuzzyRegexp("foo")
//     fuzzyScore("foo.html", re)
//     fuzzyScore("bar.html", re)
//     // => 0.6458333333333334
// ```
//
// Returns a number between 0 and 1. 0 being the worst match and 1
// being an exact match.
// You can change the `prefixBonusWeight` variable to alter ordering.
// Currently fuzzy search for the labels picker uses a weaker prefix bonus to weight heavier full word matches.
export function fuzzyScore(string: string, query: string, prefixBonusWeight = 0.1): number {
  let score = stringScore(string, query, prefixBonusWeight)
  if (score && query.indexOf('/') === -1) {
    const basename = string.substring(string.lastIndexOf('/') + 1)
    score += stringScore(basename, query, prefixBonusWeight)
  }
  return score
}

// Create a regexp that can be used to fuzzy match a given string. Any
// special regexp characters in the input string will be escaped
// correctly.
//
// A query of "bar" becomes /(.*)(b)([^a]*?)(a)([^r]*?)(r)(.*?)/.
//
// /
//  (.*)     whatever's before the first b
//  (b)      grab the first b of bar
//  ([^a]*?) take everything up to the a of bar
//  (a)      take the a of bar
//  ([^r]*?) take everything up to the r of bar
//  (r)      take the r of bar
//  (.*?)    take the rest of the string
// /
export function fuzzyRegexp(query: string): RegExp {
  const chars = query.toLowerCase().split('')

  let regex = ''

  let firstChar = true
  for (const char of chars) {
    // must escape these chars so we match literals
    const c = char.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
    if (firstChar) {
      // for the first we want to greedily match anything, which pushes
      // the first match as late as possible in the string
      regex += `(.*)(${c})`
      firstChar = false
    } else {
      regex += `([^${c}]*?)(${c})`
    }
  }
  return new RegExp(`${regex}(.*?)$`, 'i')
}

export function fuzzyHighlightElement(content: Element, text?: string, textRe?: RegExp): void {
  if (text) {
    const matches = content.innerHTML.trim().match(textRe || fuzzyRegexp(text))
    if (!matches) return

    let open = false
    const html = []
    for (let i = 1; i < matches.length; ++i) {
      const m = matches[i]
      if (!m) continue

      if (i % 2 === 0) {
        if (!open) {
          // eslint-disable-next-line github/unescaped-html-literal
          html.push('<mark>')
          open = true
        }
      } else if (open) {
        html.push('</mark>')
        open = false
      }
      html.push(m)
    }
    content.innerHTML = html.join('')
  } else {
    const html = content.innerHTML.trim()
    const clean = html.replace(/<\/?mark>/g, '')
    if (html !== clean) {
      content.innerHTML = clean
    }
  }
}

const wordSeparators = new Set([' ', '-', '_'])

// string_score.js: Quicksilver-like string scoring algorithm.
//  https://raw.github.com/joshaven/string_score/master/coffee/string_score.coffee
//
// Copyright (C) 2009-2011 Joshaven Potter <yourtech@gmail.com>
// Copyright (C) 2010-2011 Yesudeep Mangalapilly <yesudeep@gmail.com>
// MIT license: http://www.opensource.org/licenses/mit-license.php
//
// A string score implementation.
function stringScore(originalString: string, abbreviation: string, prefixBonusWeight = 0.1): number {
  let string = originalString
  if (string === abbreviation) {
    return 1.0
  }
  const stringLength = string.length
  let totalCharacterScore = 0.0
  let shouldAwardCommonPrefixBonus = 0
  let firstChar = true
  for (const char of abbreviation) {
    const indexCLowercase = string.indexOf(char.toLowerCase())
    const indexCUppercase = string.indexOf(char.toUpperCase())
    const minIndex = Math.min(indexCLowercase, indexCUppercase)
    const indexInString = minIndex > -1 ? minIndex : Math.max(indexCLowercase, indexCUppercase)
    if (indexInString === -1) {
      return 0.0
    }
    totalCharacterScore += 0.1
    if (string[indexInString] === char) {
      totalCharacterScore += 0.1
    }
    if (indexInString === 0) {
      totalCharacterScore += 0.9 - prefixBonusWeight
      if (firstChar) {
        shouldAwardCommonPrefixBonus = 1
      }
    }
    if (wordSeparators.has(string.charAt(indexInString - 1))) {
      totalCharacterScore += 0.9 - prefixBonusWeight
    }
    string = string.substring(indexInString + 1, stringLength)
    firstChar = false
  }
  const abbreviationLength = abbreviation.length
  const abbreviationScore = totalCharacterScore / abbreviationLength
  let finalScore = (abbreviationScore * (abbreviationLength / stringLength) + abbreviationScore) / 2
  if (shouldAwardCommonPrefixBonus && finalScore + prefixBonusWeight < 1) {
    finalScore += prefixBonusWeight
  }
  return finalScore
}

export type TextScore = {score: number; text: string}
export function compare(a: TextScore, b: TextScore): -1 | 0 | 1 {
  if (a.score > b.score) {
    return -1
  } else if (a.score < b.score) {
    return 1
  } else if (a.text < b.text) {
    return -1
  } else if (a.text > b.text) {
    return 1
  } else {
    return 0
  }
}
