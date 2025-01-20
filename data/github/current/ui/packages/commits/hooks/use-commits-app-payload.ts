import {useAppPayload} from '@github-ui/react-core/use-app-payload'

export interface CommitsAppPayload {
  helpUrl: string
  findFileWorkerPath: string
  findInFileWorkerPath: string
  findInDiffWorkerPath: string
  githubDevUrl: string
}

export function useCommitsAppPayload() {
  return useAppPayload<CommitsAppPayload>()
}
