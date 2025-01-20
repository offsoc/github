import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useState} from 'react'

import {useFilesContext} from '../contexts/FilesContext'
import {assert, assertNonEmptyArray} from '../utilities/asserts'
import type {ChangedFile, CodeEditorPayload} from '../utilities/copilot-task-types'
import {commitChangesUrl} from '../utilities/urls'

type DiffLineType = 'ADDITION' | 'DELETION' | 'CONTEXT'

interface DiffLine {
  text: string
  current: number
  type: DiffLineType
}

interface Diff {
  old_path?: string
  new_path?: string
  status: 'A' | 'D' | 'M' | 'R' | undefined
  lines: DiffLine[]
}

const lineTypeMap: {[key: string]: DiffLineType} = {
  '+': 'ADDITION',
  '-': 'DELETION',
  ' ': 'CONTEXT',
}

/**
 * Map a client diff to a server diff.
 */
function mapDiff(file: ChangedFile): Diff {
  const patch = file.patch
  const lines = patch.hunks.flatMap(hunk => {
    const hunkLines: DiffLine[] = []
    let currentOriginalLineNumber = hunk.oldStart
    let currentModifiedLineNumber = hunk.newStart

    for (let i = 0; i < hunk.lines.length; i++) {
      const line = hunk.lines[i]!
      const type = lineTypeMap[line.charAt(0)]
      if (!type) continue
      if (type === 'CONTEXT') {
        currentOriginalLineNumber++
        currentModifiedLineNumber++
        continue
      }

      hunkLines.push({
        text: line,
        current: type === 'ADDITION' ? currentModifiedLineNumber : currentOriginalLineNumber,
        type,
      })

      if (type === 'DELETION') currentOriginalLineNumber++
      if (type === 'ADDITION') currentModifiedLineNumber++
    }

    return hunkLines
  })

  return {lines, new_path: patch.newFileName, old_path: patch.oldFileName, status: file.status}
}

/**
 * Arguments of the `commitChanges` function.
 */
type CommitChangesArgs = {
  // Commit message to commit with.
  commitMessage: string
  // Commit description with more details re the commit.
  commitDescription: string
  // Target branch name to commit to.
  headBranch: string
  // Expected head SHA of the target branch.
  headSHA: string
  // Repository owner username.
  ownerLogin: string
  // Associated pull request number.
  pullRequestNumber: string
  // The name of the repository to commit to.
  repoName: string
  // Selected file paths to commit.
  selectedFiles: Set<string>
  // Author email to commit with.
  authorEmail?: string
}

interface ICommitChangesSuccessResponse {
  commit_oid: string
}

interface ICommitChangesFailureResponse {
  error?: string
}

type ICommitChangesResponse = ICommitChangesSuccessResponse | ICommitChangesFailureResponse

export function useCommitChanges() {
  const {getChangedFiles, getCurrentFileContent, markFilesCommitted} = useFilesContext()
  const payload = useRoutePayload<CodeEditorPayload>()
  const [isInFlight, setIsInFlight] = useState(false)

  const commitChanges = useCallback(
    async ({
      commitDescription,
      commitMessage,
      headBranch,
      headSHA,
      ownerLogin,
      pullRequestNumber,
      repoName,
      selectedFiles,
      authorEmail,
    }: CommitChangesArgs) => {
      if (isInFlight) return

      const changedFiles = getChangedFiles().filter(f => selectedFiles.has(f.path))

      assertNonEmptyArray(changedFiles, 'No selected files to commit.')
      assert(commitMessage.trim().length > 0, 'No commit message provided.')

      try {
        const diffs = changedFiles.map(file => mapDiff(file))
        setIsInFlight(true)

        // TODO: use react query `useMutation` hook instead
        const response = await reactFetchJSON(
          commitChangesUrl({
            owner: ownerLogin,
            repo: repoName,
            pullNumber: pullRequestNumber,
          }),
          {
            method: 'POST',
            body: {
              branch: headBranch,
              branch_head: headSHA,
              message: commitMessage,
              description: commitDescription,
              diffs,
              author_email: authorEmail,
            },
          },
        )

        const result: ICommitChangesResponse = await response.json()

        if ('commit_oid' in result === false) {
          // validate that if result JSON does not have commit ID, the HTTP request has failed
          // othwerwise it means that the server has returned an unexpected response data
          assert(!response.ok, 'Unexpected server response. Please try reloading the page and try again.')

          throw new Error(result.error ?? `HTTP ${response.status}`)
        }

        // update the branch SHA with the new commit ID
        payload.pullRequest.headSHA = result.commit_oid

        if (payload.blobContents !== undefined) {
          payload.blobContents = getCurrentFileContent(payload.path, payload.blobContents)
        }

        markFilesCommitted(selectedFiles)

        return result
      } finally {
        setIsInFlight(false)
      }
    },
    [getChangedFiles, getCurrentFileContent, isInFlight, markFilesCommitted, payload],
  )

  return {commitChanges, isInFlight}
}
