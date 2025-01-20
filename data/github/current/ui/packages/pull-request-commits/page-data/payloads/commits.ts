import type {CommitsProps} from '@github-ui/commits/shared/Commits'

export type CommitsPageData = CommitsProps & {
  timeOutMessage: string
  truncated: boolean
}
