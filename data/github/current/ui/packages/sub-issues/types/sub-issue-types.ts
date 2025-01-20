import type {IssueState, IssueStateReason} from '@github-ui/item-picker/IssuePickerIssue.graphql'

export type SubIssueSidePanelItem = {
  id: number
  number: number
  owner: string
  repo: string
  state: IssueState | string
  stateReason?: IssueStateReason | string | null
  title: string
  url: string
}
