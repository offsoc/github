import {graphql, useFragment} from 'react-relay'
import type {SubmittedRepository} from './types'
import {ActionListItemRepository} from '@github-ui/action-list-items/ActionListItemRepository'
import type {ItemPickerRepositoryItem_Fragment$key} from './__generated__/ItemPickerRepositoryItem_Fragment.graphql'

export type ItemPickerRepositoryItemProps = {
  repositoryItem: ItemPickerRepositoryItem_Fragment$key
  showTrailingVisual: boolean
  onItemSelect: (id: string, additionalInfo: SubmittedRepository['additionalInfo']) => void
}

export const ItemPickerRepositoryItem_Fragment = graphql`
  fragment ItemPickerRepositoryItem_Fragment on Repository {
    id
    nameWithOwner
    owner {
      avatarUrl(size: 64)
    }
  }
`

export function ItemPickerRepositoryItem({
  repositoryItem,
  onItemSelect,
  showTrailingVisual,
}: ItemPickerRepositoryItemProps) {
  const repoItem = useFragment(ItemPickerRepositoryItem_Fragment, repositoryItem)

  const {nameWithOwner, owner, id} = repoItem

  const onSelect = () => {
    const additionalData = {
      nameWithOwner,
      owner,
    }
    onItemSelect(id, additionalData)
  }

  return (
    <ActionListItemRepository
      id={id}
      onSelect={onSelect}
      nameWithOwner={nameWithOwner}
      ownerAvatarUrl={owner.avatarUrl}
      selectType="action"
      showTrailingVisual={showTrailingVisual}
    />
  )
}
