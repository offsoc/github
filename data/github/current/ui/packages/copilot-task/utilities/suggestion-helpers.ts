import {reactFetchJSON} from '@github-ui/verified-fetch'
import type {FileStatuses} from '@github-ui/web-commit-dialog'
import {applyPatch, type ParsedDiff} from 'diff'

import type {BlobPayload, CodeEditorPayload, FocusedTaskData, FocusedTaskSuggestion} from './copilot-task-types'
import {lightweightFileUrl} from './urls'

export const PROBLEM_NO_SUGGESTION = 'No suggestion to apply'
export const PROBLEM_ALREADY_APPLIED = 'Suggestion already applied'
export const PROBLEM_APPLIES_TO_DELETED_FILES = 'Suggestion modifies deleted files'

export function problemWithSuggestion(
  appliedSuggestions: number[],
  fileStatuses: FileStatuses,
  focusedTask?: FocusedTaskData,
): string | undefined {
  if (!focusedTask) {
    return PROBLEM_NO_SUGGESTION
  }

  if (appliedSuggestions.includes(focusedTask.sourceId)) {
    return PROBLEM_ALREADY_APPLIED
  }

  const paths = getFilePathsForSuggestion(focusedTask)
  for (const path of paths) {
    if (fileStatuses[path] === 'D') {
      return PROBLEM_APPLIES_TO_DELETED_FILES
    }
  }
}

export function getFilePathsForSuggestion(focusedTask: FocusedTaskData): Set<string> {
  // Gather files we need for this suggestion
  const suggestedFiles = new Set<string>()
  for (const suggestion of focusedTask.suggestions) {
    suggestedFiles.add(suggestion.filePath)
  }
  return suggestedFiles
}

export async function getPayloadsForSuggestion(currentPayload: CodeEditorPayload): Promise<BlobPayload[]> {
  const {focusedTask, path, pullRequest, repo} = currentPayload
  if (!focusedTask) {
    return []
  }

  // Get payloads for the files in this suggestion
  // (Note: May not be the file currently being viewed)
  const suggestedFiles = getFilePathsForSuggestion(focusedTask)
  const promises = Array.from(suggestedFiles).map(async suggestedFile => {
    if (suggestedFile === path) {
      return {blobContents: currentPayload.blobContents, path: currentPayload.path}
    } else {
      const response = await reactFetchJSON(
        lightweightFileUrl({
          owner: repo.ownerLogin,
          repo: repo.name,
          pullNumber: pullRequest.number,
          path: suggestedFile,
        }),
        {
          method: 'GET',
        },
      )
      return (await response.json()) as BlobPayload
    }
  })

  return Promise.all(promises)
}

export function applySuggestions(
  filePath: string,
  content: string | undefined,
  focusedTask?: FocusedTaskData,
): string | undefined {
  if (!focusedTask) {
    return content
  }

  if (content === undefined) {
    return ''
  }

  let updatedContent: string = content
  for (const suggestion of focusedTask.suggestions) {
    updatedContent = applySuggestion(filePath, updatedContent, suggestion)
  }

  return updatedContent
}

function applySuggestion(filePath: string, content: string, suggestion: FocusedTaskSuggestion): string {
  if (suggestion.filePath !== filePath) {
    return content
  }

  const structuredPatch: ParsedDiff = {
    oldFileName: filePath,
    newFileName: filePath,
    hunks: [
      {
        oldStart: suggestion.oldStart,
        oldLines: suggestion.oldLines,
        newStart: suggestion.newStart,
        newLines: suggestion.newLines,
        linedelimiters: Array(suggestion.lines.length).fill('\n'),
        lines: suggestion.lines,
      },
    ],
  }
  const result = applyPatch(content, structuredPatch)
  if (result) {
    return result
  }

  // TODO: If/when we get better error handling, use that instead
  // eslint-disable-next-line no-console
  console.error(`FAILED DIFF: ${JSON.stringify(structuredPatch)}`)
  alert('Cannot apply suggestion to current content. See console for failed diff details.')
  return content
}
