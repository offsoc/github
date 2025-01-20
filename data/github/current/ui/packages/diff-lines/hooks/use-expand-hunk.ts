import {useDiffContext} from '../contexts/DiffContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'

export default function useExpandHunk(): {
  expandStartOfHunk: () => void
  expandEndOfHunk: () => void
  expandEndOfPreviousHunk: () => void
  canExpandStartOfHunk: boolean
  canExpandEndOfHunk: boolean
} {
  const {nextHunk, currentHunk, previousHunk} = useDiffLineContext()
  const {addInjectedContextLines} = useDiffContext()
  const MAX_REQUEST_LINE_LIMIT = 20
  const canExpandStartOfHunk = currentHunk && currentHunk.startBlobLineNumber !== 0 ? true : false
  const canExpandEndOfHunk = currentHunk && !!nextHunk ? true : false

  const expandStartOfHunk = () => {
    if (!canExpandStartOfHunk || !currentHunk) return
    const range = {
      start: Math.max(0, currentHunk.startBlobLineNumber - MAX_REQUEST_LINE_LIMIT),
      end: currentHunk.startBlobLineNumber,
    }
    addInjectedContextLines(range)
  }

  const expandEndOfHunk = () => {
    if (!canExpandEndOfHunk || !currentHunk) return
    const range = {
      start: currentHunk.endBlobLineNumber + 1,
      end: currentHunk.endBlobLineNumber + 1 + MAX_REQUEST_LINE_LIMIT,
    }
    addInjectedContextLines(range)
  }

  const expandEndOfPreviousHunk = () => {
    if (!previousHunk) return

    const range = {
      start: previousHunk.endBlobLineNumber + 1,
      end: previousHunk.endBlobLineNumber + 1 + MAX_REQUEST_LINE_LIMIT,
    }
    addInjectedContextLines(range)
  }

  return {expandStartOfHunk, expandEndOfHunk, expandEndOfPreviousHunk, canExpandEndOfHunk, canExpandStartOfHunk}
}
