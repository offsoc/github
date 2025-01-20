import type {RepositoryNWO} from '@github-ui/current-repository'
import type {DiffLine} from '@github-ui/diff-lines'
import {getInsightsUrl, reportTraceData} from '@github-ui/internal-api-insights'
import {diffLinesPath} from '@github-ui/paths'
import {reactFetchJSON} from '@github-ui/verified-fetch'

type DiffLinesResponse = {
  diffLines: DiffLine[]
}

type LoadDiffLinesProps = {
  repo: RepositoryNWO
  sha1: string
  sha2: string
  /**
   * The index of the diff entry to load
   */
  entry: string
}
export type ContextLineRange = {
  start: number
  end: number
}

export type ContextLineResponse = {
  diffEntryWithContext: DiffLine[]
}

function getRangesAsSeparateURLParams(contextLineRanges: ContextLineRange[]) {
  let returnString = ''
  for (let i = 0; i < contextLineRanges.length; i++) {
    returnString += `&lineRanges[]=${JSON.stringify(contextLineRanges[i])}`
  }
  return returnString
}

export function useDiffLines() {
  return {fetchInjectedContextLines, fetchDiffLines}
}

/**
 * Fetches the context lines for a given diff entry
 */
async function fetchInjectedContextLines(
  contextLineRanges: ContextLineRange[],
  url: string,
  pathDigest: string,
): Promise<ContextLineResponse | undefined> {
  const response = await reactFetchJSON(
    `${url}?pathDigest=${pathDigest}${getRangesAsSeparateURLParams(contextLineRanges)}`,
  )

  if (response.ok) {
    const data = await response.json()

    return data ?? undefined
  }
}

/**
 * Fetches the diff lines for a given diff entry
 * This is used when the diff is truncated (ie - deleted or generated)
 * The user can click on the "Load more" button to fetch the diff lines
 */
async function fetchDiffLines({repo, sha1, sha2, entry}: LoadDiffLinesProps) {
  const response = await reactFetchJSON(
    getInsightsUrl(
      diffLinesPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        entry,
        sha1,
        sha2,
      }),
    ),
  )

  if (response.ok) {
    const data: DiffLinesResponse = await response.json()
    reportTraceData(data)
    return data.diffLines
  } else {
    return undefined
  }
}
