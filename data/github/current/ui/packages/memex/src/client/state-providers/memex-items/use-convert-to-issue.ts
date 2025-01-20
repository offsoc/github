import {useCallback} from 'react'

import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import type {ConvertDraftItemToIssueResponse} from '../../api/memex-items/contracts'
import {useConvertToIssueMutation} from './mutations/use-convert-to-issue-mutation'

type ConvertToIssueHookReturnType = {
  convertToIssue: (itemId: number, repositoryId: number) => Promise<ConvertDraftItemToIssueResponse>
}

export const useConvertToIssue = (): ConvertToIssueHookReturnType => {
  const mutation = useConvertToIssueMutation()
  const convertToIssue = useCallback(
    async (itemId: number, repositoryId: number) => {
      cancelGetAllMemexData()
      return mutation.mutateAsync({
        repositoryId,
        memexProjectItemId: itemId,
      })
    },
    [mutation],
  )
  return {convertToIssue}
}
