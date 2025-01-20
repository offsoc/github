import type {
  ItemPickerPullRequestsAndBranchesItem_BranchFragment$data,
  ItemPickerPullRequestsAndBranchesItem_BranchFragment$key,
} from './__generated__/ItemPickerPullRequestsAndBranchesItem_BranchFragment.graphql'
import type {
  ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$data,
  ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key,
} from './__generated__/ItemPickerPullRequestsAndBranchesItem_PullRequestFragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

export type ItemPickerPullRequestsAndBranchesItem_FragmentData =
  | ItemPickerPullRequestsAndBranchesItem_BranchFragment$data
  | ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$data

export type ItemPickerPullRequestsAndBranchesItem_FragmentKey =
  | (ItemPickerPullRequestsAndBranchesItem_BranchFragment$key & {readonly __typename?: 'Ref'})
  | (ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key & {readonly __typename?: 'PullRequest'})

type AdditionalInfo =
  | OmitFragment<ItemPickerPullRequestsAndBranchesItem_BranchFragment$data>
  | OmitFragment<ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$data>

export type SubmittedPullRequestOrBranch = {
  id: string
  additionalInfo: AdditionalInfo
}
