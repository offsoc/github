import {verifiedFetch} from '@github-ui/verified-fetch'
import type {ApiMarkdownSubject, SubjectType} from './types'
import {useCallback} from 'react'
import type {SafeHTMLString} from '@github-ui/safe-html'

interface MarkdownPreviewRequest {
  text: string
  issue: string
  repository: string
  project: string
  subjectType?: 'Issue' | 'PullRequest' | 'Project'
}

/**
 * Fetches a markdown preview for the given text.
 * We can brand the returned html as a SafeHTMLString because it is generated
 * by GitHub and we trust it.
 */
async function tryGetPreview({
  text,
  issue,
  repository,
  project,
  subjectType,
}: MarkdownPreviewRequest): Promise<SafeHTMLString> {
  const formData = new FormData()
  formData.append('text', text)
  formData.append('issue', issue)
  formData.append('repository', repository)
  formData.append('project', project)
  if (subjectType) {
    formData.append('subject_type', subjectType)
  }
  const response = await verifiedFetch('/preview', {body: formData, method: 'POST'})
  if (!response.ok) {
    return Promise.resolve('Markdown preview unavailable' as SafeHTMLString)
  }
  const htmlText = await response.text()
  return Promise.resolve(htmlText as SafeHTMLString)
}

export function useGetPreview({subjectId, subjectType, subjectRepoId}: Partial<ApiMarkdownSubject>) {
  return useCallback(
    async (body: string) => {
      return tryGetPreview({
        text: body,
        issue: subjectId?.toString() ?? '',
        repository: subjectRepoId?.toString() ?? '',
        project: subjectId?.toString() ?? '',
        subjectType: resolvePreviewSubjectType(subjectType),
      })
    },
    [subjectId, subjectType, subjectRepoId],
  )
}

function resolvePreviewSubjectType(subjectType: SubjectType | undefined): MarkdownPreviewRequest['subjectType'] {
  switch (subjectType) {
    case 'issue':
      return 'Issue'
    case 'pull_request':
      return 'PullRequest'
    case 'project':
      return 'Project'
    default:
      return undefined
  }
}
