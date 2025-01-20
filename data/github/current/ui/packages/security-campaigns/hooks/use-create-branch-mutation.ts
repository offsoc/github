import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'
import {useMutation, type UseMutationResult} from '@tanstack/react-query'

export type CreateBranchRequest = {
  name: string
  alertNumbers: number[]
  commitAutofixSuggestions: boolean
  createNewBranch: boolean
  createDraftPR: boolean
}

export type CreateBranchResponse = {
  branchName: string
  pullRequestPath: string
  messages: string[]
}

export function useCreateBranchMutation(
  path: string,
): UseMutationResult<CreateBranchResponse, Error, CreateBranchRequest> {
  return useMutation({
    mutationFn: request => {
      return fetchJson(path, {
        defaultErrorMessage: 'Something went wrong',
        method: 'post',
        body: {
          name: request.name,
          alert_numbers: request.alertNumbers,
          commit_autofix_suggestions: request.commitAutofixSuggestions,
          create_new_branch: request.createNewBranch,
          create_draft_pr: request.createDraftPR,
        },
      })
    },
  })
}
