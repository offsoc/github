import type {DiffLine, ClientDiffLine} from '../types'
import {isEmptyDiffLine} from './line-helpers'

export const HunkHeaderData = {
  finalLineId: 'final-hunk-header-line',
}

export interface HunkData {
  startBlobLineNumber: number
  endBlobLineNumber: number
}

// Used with Array.prototype.sort to ensure that hunks are sorted by 0..n using their startBlobLineNumber value
function orderHunksByBlobLineNumber(hunkA: HunkData, hunkB: HunkData) {
  return hunkA.startBlobLineNumber - hunkB.startBlobLineNumber
}

export function getLineHunkData(
  line: DiffLine,
  hunksData: HunkData[],
): {
  currentHunk?: HunkData
  nextHunk?: HunkData
  previousHunk?: HunkData
} {
  const isLastHunkLine = line.type === 'HUNK' && line.__id === HunkHeaderData.finalLineId
  if (isLastHunkLine) {
    return {currentHunk: hunksData[hunksData.length - 1], previousHunk: hunksData[hunksData.length - 2]}
  }

  const currentHunkIdx = hunksData
    // Hunks data should be sorted when this is called, but this is a fast operation and will ensure that they are never out of order.
    .sort(orderHunksByBlobLineNumber)
    .findIndex(
      hunkData =>
        hunkData.startBlobLineNumber <= line.blobLineNumber && hunkData.endBlobLineNumber >= line.blobLineNumber,
    )

  return {
    currentHunk: hunksData[currentHunkIdx],
    nextHunk: hunksData[currentHunkIdx + 1],
    previousHunk: hunksData[currentHunkIdx - 1],
  }
}

export function getDiffHunksData(lines: ClientDiffLine[]): HunkData[] {
  const hunksData: HunkData[] = []
  let currentHunkIdx = 0

  // Skip index 1 as that will always be a hunk row
  for (let idx = 1; idx < lines.length; idx++) {
    const line = lines[idx]
    const isLastLine = idx === lines.length - 1

    if (!line) continue
    if (isEmptyDiffLine(line)) continue

    if (line.type === 'HUNK') {
      const hunkHeaderLine = lines[currentHunkIdx]
      if (!hunkHeaderLine || isEmptyDiffLine(hunkHeaderLine)) continue
      let lastLine
      let lastLineIdx = idx - 1

      // The last line could be an empty diffline and we want to use the last diffline with a blobLineNumber value.
      // This will work through the difflines backwards to ensure we get the first valid diffline in sequential order
      // The guard will ensure that there is a DiffLine and it's not an EmptyDiffLine value
      while (!lastLine || isEmptyDiffLine(lastLine)) {
        lastLine = lines[lastLineIdx]
        lastLineIdx--

        // Break the while loop if we hit a negative index as there are no more difflines left
        if (lastLineIdx === -1) break
      }

      if (lastLine && !isEmptyDiffLine(lastLine)) {
        hunksData.push({
          startBlobLineNumber: hunkHeaderLine.blobLineNumber,
          endBlobLineNumber: lastLine.blobLineNumber,
        })
      }

      if (line.__id === HunkHeaderData.finalLineId) {
        hunksData.push({
          startBlobLineNumber: line.blobLineNumber,
          endBlobLineNumber: line.blobLineNumber + 20,
        })
      }

      currentHunkIdx = idx
      continue
    }

    // When we are iterating over the last line and it's not a hunk header row,
    // we want to return our last hunk data object and use the last line .blobLineNumber as the end blobLineNumber of the hunk data.
    if (isLastLine) {
      const hunkHeaderLine = lines[currentHunkIdx]
      if (hunkHeaderLine && !isEmptyDiffLine(hunkHeaderLine)) {
        hunksData.push({
          startBlobLineNumber: hunkHeaderLine.blobLineNumber,
          endBlobLineNumber: line.blobLineNumber,
        })
      }
    }
  }

  return hunksData
}
