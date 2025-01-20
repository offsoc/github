import {graphql, readInlineData} from 'react-relay'
import {ActionListItemUser} from '@github-ui/action-list-items/ActionListItemUser'
import type {SubmittedAssignee} from './types'
import type {ItemPickerRepositoryAssignableUsersItem_Fragment$key} from './__generated__/ItemPickerRepositoryAssignableUsersItem_Fragment.graphql'

export type ItemPickerRepositoryAssignableUsersItemProps = {
  assigneeItem: ItemPickerRepositoryAssignableUsersItem_Fragment$key
  onItemSelect: (id: string, additionalInfo: SubmittedAssignee['additionalInfo']) => void
  selected: boolean
  disabled?: boolean
}

export const ItemPickerRepositoryAssignableUsersItem_Fragment = graphql`
  fragment ItemPickerRepositoryAssignableUsersItem_Fragment on User
  # Use inline directive to access data on initial selected assignees
  # https://relay.dev/docs/api-reference/graphql-and-directives/#inline
  @inline {
    id
    name
    login
    avatarUrl(size: 64)
  }
`

export function ItemPickerRepositoryAssignableUsersItem({
  assigneeItem,
  onItemSelect,
  selected,
  ...props
}: ItemPickerRepositoryAssignableUsersItemProps) {
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerRepositoryAssignableUsersItem_Fragment, assigneeItem)
  const {name, id, avatarUrl, login} = item

  const onSelect = () => {
    // TODO: hardcode additional data for now, but check with Issues team if they need optional relay directives
    const additionalData = {
      name: name || '',
      login,
      avatarUrl,
    }
    onItemSelect(id, additionalData)
  }

  return (
    <ActionListItemUser
      id={id}
      username={login}
      avatarUrl={avatarUrl}
      fullName={name || ''}
      selectType="multiple"
      onSelect={onSelect}
      selected={selected}
      {...props}
    />
  )
}
