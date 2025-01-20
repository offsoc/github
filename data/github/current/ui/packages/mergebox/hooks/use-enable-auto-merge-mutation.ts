import {useMutation} from '@tanstack/react-query'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'

export type EnableAutoMergeInput = {
  authorEmail?: string
  commitMessage?: string
  commitTitle?: string
  mergeMethod?: string
}

export function useEnableAutoMergeMutation({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: (error: Error) => void
}) {
  const apiURL = usePageDataUrl(PageData.enableAutoMerge)
  return useMutation({
    mutationFn: async (input: EnableAutoMergeInput) => {
      const result = await verifiedFetch(`${apiURL}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify({
          author_email: input.authorEmail,
          commit_message: input.commitMessage,
          commit_title: input.commitTitle,
          mergeMethod: input.mergeMethod,
        }),
      })
      if (result.ok) {
        const json = await result.json()
        return json
      }
      throw new Error('Failed enabling auto-merge for pull request.')
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (e: Error) => {
      onError(e)
    },
  })
}
