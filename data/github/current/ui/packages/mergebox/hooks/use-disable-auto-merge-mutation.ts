import {useMutation} from '@tanstack/react-query'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'

export function useDisableAutoMergeMutation({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: (error: Error) => void
}) {
  const apiURL = usePageDataUrl(PageData.disableAutoMerge)
  return useMutation({
    mutationFn: async () => {
      const result = await verifiedFetch(`${apiURL}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      if (result.ok) {
        const json = await result.json()
        return json
      }
      throw new Error('Failed to disable auto-merge for pull request.')
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (e: Error) => {
      onError(e)
    },
  })
}
