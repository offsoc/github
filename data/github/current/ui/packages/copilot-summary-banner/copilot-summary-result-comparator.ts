import {distance, closest} from 'fastest-levenshtein'

export function prepStringsForComparison(strings: string) {
  // split the paragraph into an array of strings delimited by \n
  // for each string be sure to strip any trailing whitespace
  // remove any empty strings
  return strings
    .split('\n')
    .filter(Boolean)
    .map(line => line.trim())
}

// This function returns a number representing the similarity of two arrays of strings.
// For example, a return value of `100` means all of the generatedSummary array is in the
// bodyLines array, a return value of `50` means half of the generatedSummary array is
// in the bodyLines array, and a return value of `0` means none of the generatedSummary
// array is in the bodyLines array. A result of `0` is very unlikely because if the lines
// are different, this function calculates how similar they are at the character level
// to try and represent lines that might have started the same but were later edited by
// the user.
export function comparator(bodyLines: string[], generatedSummary: string[]) {
  // get the overall length of generated_summary
  const generatedSummaryLength = generatedSummary.length
  let matches = 0
  let matchPercentage = 0
  const remainingLines: string[] = [...generatedSummary]
  // if the line of generatedSummarry matches any line in
  // bodyLines, then increment matches
  // and remove the line from bodyLines and generatedSummary
  for (const line of generatedSummary) {
    if (bodyLines.length === 0) {
      break
    }
    for (const bLine of bodyLines) {
      if (bLine.includes(line)) {
        matches++
        bodyLines.splice(bodyLines.indexOf(bLine), 1)
        remainingLines.splice(remainingLines.indexOf(line), 1)
        // if we have a match, we can break out of the inner loop
        break
      }
    }
  }

  if (matches === generatedSummaryLength) {
    return 100
  } else {
    // if there are any remaining lines in bodyLines
    // and any lines in remainingLines then
    // compare the remaining lines in bodyLines to
    // the remaining lines in remainingLines
    // using levenshtein
    matchPercentage = matches / generatedSummaryLength
    const weight = 1 / generatedSummaryLength
    const remainingLinesLength = remainingLines.length
    let levPercentage = 0
    const unmatched: string[] = [...remainingLines]
    if (bodyLines.length > 0 && remainingLinesLength > 0) {
      for (const line of remainingLines) {
        if (bodyLines.length === 0) {
          break
        }
        for (const bLine of bodyLines) {
          if (line.slice(0, 10) === bLine.slice(0, 10) || line.slice(-10) === bLine.slice(-10)) {
            const levDistance = distance(line, bLine)
            const variance = levDistance / line.length
            if (variance > 1) {
              // this means that the text has changed so much that it is not discernable as a match
              continue
            }
            // if the string is less than 705 similar continue to the next
            const pct = 1 - variance
            if (pct <= 0.7) {
              continue
            } else {
              levPercentage += pct * weight
              bodyLines.splice(bodyLines.indexOf(bLine), 1)
              unmatched.splice(unmatched.indexOf(line), 1)
              break
            }
          }
        }
      }
    }

    // get a levenshtein distance from all remaining lines
    if (bodyLines.length > 0 && unmatched.length > 0) {
      for (const line of unmatched) {
        if (bodyLines.length === 0) {
          break
        }
        const potentialMatch = closest(line, bodyLines)
        if (potentialMatch === null) {
          continue
        }
        const levDistance = distance(line, potentialMatch)
        const variance = levDistance / line.length
        if (variance > 1) {
          // this means that the text has changed so much that it is not discernable as a match
          continue
        }
        const pct = 1 - variance
        // identify the percentage change based on the distance and line.length as floats
        levPercentage += pct * weight
        bodyLines.splice(bodyLines.indexOf(potentialMatch), 1)
      }
    }

    matchPercentage += levPercentage

    if (matchPercentage === 0) {
      const summary = generatedSummary.join('\n')
      const levDistance = distance(bodyLines.join('\n'), summary)
      const variance = levDistance / summary.length
      if (variance > 1) {
        // this means that the text has changed so much that it is not discernable as a match
        return 0
      }
      matchPercentage = 1 - variance
    }

    return matchPercentage * 100
  }
}
