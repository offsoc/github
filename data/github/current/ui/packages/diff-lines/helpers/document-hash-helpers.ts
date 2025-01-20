import type {LineRange} from '../types'

/**
 * Detect if location Hash matches a diff anchor with line numbers
 */
export function matchHash(hash: string): RegExpMatchArray | null {
  const diffAnchorMatch = hash.match(/^#?(diff-[a-f0-9]+)(L|R)(\d+)(?:-(L|R)(\d+))?$/i)
  if (diffAnchorMatch != null && diffAnchorMatch.length === 6) {
    return diffAnchorMatch
  }

  const discussionAnchorMatch = hash.match(/^#?(discussion-diff-[0-9]+)(L|R)(\d+)(?:-(L|R)(\d+))?$/i)
  if (discussionAnchorMatch != null && discussionAnchorMatch.length === 6) {
    return discussionAnchorMatch
  }

  return null
}

function lineHashFragmentFrom(lineNumber: number, orientation: 'left' | 'right'): string {
  return `${orientation === 'left' ? 'L' : 'R'}${lineNumber}`
}

export function parseDiffHash(hash: string): string | undefined {
  const diffMatch = hash.match(/^#?(diff-[a-f0-9]+)/)
  return diffMatch?.[1]
}

/**
 *
 * Check if we're specifying a comment in the hash.
 * This format is defined in
 * [Platform::Models::PullRequestReviewComment#async_current_diff_path_uri](https://github.com/github/github/blob/420ce06f085acf1c9fd9d8948472b3fcca3ba467/packages/pull_requests/app/models/pull_request_review_comment.rb#L571)
 *
 * Basically `#r<database-id>`
 */
export function parseCommentHash(hash: string): number | undefined {
  const resourceMatch = hash.match(/^#?(r\d+)/)
  // coerce the match to a number if it exists
  const commentId = resourceMatch?.[1]

  if (commentId) {
    return parseInt(commentId.slice(1))
  } else {
    return undefined
  }
}

export function parseAnnotationHash(hash: string): number | undefined {
  const resourceMatch = hash.match(/^#annotation_(\d+)/)
  const annotationId = resourceMatch?.[1]

  if (annotationId) {
    return parseInt(annotationId)
  } else {
    return undefined
  }
}

/**
 * Returns the LineRange from the given hash
 *
 * @param hash e.g. #diff-146c1d65b0054fb45053c61a749f7cd421c4e62fdce49e86470aa9d7c32052ccR21-R25
 * @returns LineRange | undefined
 */
export function parseLineRangeHash(hash: string): LineRange | undefined {
  const match = matchHash(hash)
  if (match) {
    // match[0] is the full match so start at 1
    const diffAnchor = match[1]

    // start of range
    const startOrientation = match[2] ? (match[2] === 'L' ? 'left' : 'right') : undefined
    const startLineNumber = match[3] ? parseInt(match[3]) : undefined

    if (!diffAnchor || !startOrientation || startLineNumber === undefined) return undefined

    // end of range
    const endOrientation = match[4] ? (match[4] === 'L' ? 'left' : 'right') : undefined
    const endLineNumber = match[5] ? parseInt(match[5]) : undefined

    return {
      diffAnchor,
      startOrientation,
      startLineNumber,
      endOrientation: endOrientation ?? startOrientation,
      endLineNumber: endLineNumber ?? startLineNumber,
      firstSelectedLineNumber: startLineNumber,
      firstSelectedOrientation: startOrientation,
    }
  }
}

export function updateURLHashFromLineRange(lineRange: LineRange) {
  const newHash = urlHashFromLineRange(lineRange)
  updateURLHash(newHash)
}

export function urlHashFromLineRange(lineRange: LineRange) {
  const lineStartFragment = lineHashFragmentFrom(lineRange.startLineNumber, lineRange.startOrientation)
  let newHash = `${lineRange.diffAnchor}${lineStartFragment}`
  if (
    lineRange.endLineNumber !== lineRange.startLineNumber ||
    lineRange.endOrientation !== lineRange.startOrientation
  ) {
    const lineEndFragment = lineHashFragmentFrom(lineRange.endLineNumber, lineRange.endOrientation)
    newHash += `-${lineEndFragment}`
  }

  return newHash
}

export function updateURLHash(hash: string) {
  const newHash = `#${hash}`
  if (newHash === window.location.hash) return

  const oldURL = window.location.href
  history.replaceState({...history.state}, '', newHash)
  window.dispatchEvent(
    new HashChangeEvent('hashchange', {
      newURL: window.location.href,
      oldURL,
    }),
  )
}
export const clearURLHash = () => updateURLHash('')
