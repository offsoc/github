import {graphql, readInlineData} from 'react-relay'
import type {SubmittedPullRequestOrBranch} from './types'
import type {ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key} from './__generated__/ItemPickerPullRequestsAndBranchesItem_PullRequestFragment.graphql'
import type {ItemPickerPullRequestsAndBranchesItem_BranchFragment$key} from './__generated__/ItemPickerPullRequestsAndBranchesItem_BranchFragment.graphql'

import {
  ActionListItemPullRequest,
  type ActionListItemPullRequestProps,
} from '@github-ui/action-list-items/ActionListItemPullRequest'
import {ActionListItemBranch} from '@github-ui/action-list-items/ActionListItemBranch'

export type ItemPickerPullRequestsAndBranchesItem = {
  onItemSelect: (id: string, additionalInfo: SubmittedPullRequestOrBranch['additionalInfo']) => void
  selected: boolean
  selectType: 'multiple' | 'instant' | 'single'
  uniqueListId: string
} & Pick<ActionListItemPullRequestProps, 'disabled'>

export const ItemPickerPullRequestsAndBranchesItem_BranchFragment = graphql`
  fragment ItemPickerPullRequestsAndBranchesItem_BranchFragment on Ref @inline {
    id
    __typename
    title: name
    # target {
    # oid
    # id
    # __typename
    # }
    # repository {
    #   id
    #   # nameWithOwner
    #   # defaultBranchRef {
    #   # name
    #   # id
    #   # target {
    #   # oid
    #   # id
    #   # __typename
    #   # }
    #   # associatedPullRequests {
    #   #   totalCount
    #   # }
    #   # repository {
    #   #   id
    #   # }
    #   # }
    # }
    # associatedPullRequests {
    #   totalCount
    # }
  }
`

export const ItemPickerPullRequestsAndBranchesItem_PullRequestFragment = graphql`
  fragment ItemPickerPullRequestsAndBranchesItem_PullRequestFragment on PullRequest @inline {
    id
    __typename
    title
    # url
    # number
    # state
    # isDraft
    # createdAt
    # repository {
    #   id
    #   name
    #   nameWithOwner
    #   owner {
    #     login
    #     __typename
    #   }
    # }
  }
`

export function ItemPickerPullRequestItem({
  pullRequestItem,
  onItemSelect,
  selected,
  selectType,
  uniqueListId,
  ...props
}: ItemPickerPullRequestsAndBranchesItem & {
  pullRequestItem: ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key
}) {
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerPullRequestsAndBranchesItem_PullRequestFragment, pullRequestItem)
  const {id, title, __typename} = item

  const onSelect = () => {
    onItemSelect(id, {title, __typename})
  }

  const typeSpecificProps =
    selectType === 'multiple' || selectType === 'instant' ? {selectType} : {selectType, radioGroupName: uniqueListId}

  return (
    <ActionListItemPullRequest {...typeSpecificProps} {...props} onSelect={onSelect} selected={selected} name={title} />
  )
}

export function ItemPickerBranchItem({
  branchItem,
  onItemSelect,
  selected,
  selectType,
  uniqueListId,
  ...props
}: ItemPickerPullRequestsAndBranchesItem & {
  branchItem: ItemPickerPullRequestsAndBranchesItem_BranchFragment$key
}) {
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerPullRequestsAndBranchesItem_BranchFragment, branchItem)
  const {id, title, __typename} = item

  const onSelect = () => {
    onItemSelect(id, {title, __typename})
  }

  const typeSpecificProps =
    selectType === 'multiple' || selectType === 'instant' ? {selectType} : {selectType, radioGroupName: uniqueListId}

  return <ActionListItemBranch {...typeSpecificProps} {...props} onSelect={onSelect} selected={selected} name={title} />
}
