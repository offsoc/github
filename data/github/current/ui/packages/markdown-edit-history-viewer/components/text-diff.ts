export type LineModification = 'ADDED' | 'REMOVED' | 'UNCHANGED' | 'EDITED'
export type WordModification = 'ADDED' | 'REMOVED' | 'UNCHANGED'

// Ensure we cover all newline characters
const safeSplitLines = (text: string) => text.split(/\r?\n/)
const safeSplitLine = (text: string) => text.split(/\s+/)

export type TextDiffProps = {
  before: string | undefined
  after: string | undefined
}

export type TextDiffSummary = {
  lines: LineDiffComparison[]
}

export type WordSummary = {
  word: string
  modification: WordModification
}

export type LineDiffComparison = {
  words: WordSummary[]
  modification: LineModification
}

function compareLines(before: string | undefined, after: string | undefined): LineDiffComparison {
  const beforeWords = before ? safeSplitLine(before) : []
  const afterWords = after ? safeSplitLine(after) : []

  if ((beforeWords.length === 0 && afterWords.length === 0) || before === after) {
    return {
      words: afterWords.map(word => ({
        word,
        modification: 'UNCHANGED',
      })),
      modification: 'UNCHANGED',
    }
  }

  if (beforeWords.length === 0) {
    return {
      words: afterWords.map(word => ({
        word,
        modification: 'ADDED',
      })),
      modification: 'ADDED',
    }
  }

  if (afterWords.length === 0) {
    return {
      words: beforeWords.map(word => ({
        word,
        modification: 'REMOVED',
      })),
      modification: 'REMOVED',
    }
  }

  const words: WordSummary[] = []

  // Greedy algorithm that loops over and compares word by word for the same index.
  for (let index = 0; index < beforeWords.length || index < afterWords.length; index++) {
    const beforeWord = beforeWords[index]
    const afterWord = afterWords[index]

    if (beforeWord === afterWord) {
      words.push({
        word: beforeWord!,
        modification: 'UNCHANGED',
      })
    } else {
      if (beforeWord !== undefined) {
        words.push({
          word: beforeWord,
          modification: 'REMOVED',
        })
      }

      if (afterWord !== undefined) {
        words.push({
          word: afterWord,
          modification: 'ADDED',
        })
      }
    }
  }

  return {
    words,
    modification: 'EDITED',
  }
}

export function textDiff({before, after}: TextDiffProps): TextDiffSummary {
  const beforeLines = before ? safeSplitLines(before) : []
  const afterLines = after ? safeSplitLines(after) : []

  const outputLines: LineDiffComparison[] = []

  // Greedy algorithm that loops over and compares line by line for the same index, and
  // within each line, word by word by the same index.
  for (let index = 0; index < beforeLines.length || index < afterLines.length; index++) {
    const beforeLine = beforeLines[index]
    const afterLine = afterLines[index]
    outputLines.push(compareLines(beforeLine, afterLine))
  }

  return {
    lines: outputLines,
  }
}
