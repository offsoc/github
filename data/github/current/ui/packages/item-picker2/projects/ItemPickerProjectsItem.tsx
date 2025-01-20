import {graphql, readInlineData} from 'react-relay'
import {
  ActionListItemProject,
  type ActionListItemProjectProps,
} from '@github-ui/action-list-items/ActionListItemProject'

import type {SubmittedProject} from './types'
import type {ItemPickerProjectsItem_ProjectV2Fragment$key} from './__generated__/ItemPickerProjectsItem_ProjectV2Fragment.graphql'
import type {ItemPickerProjectsItem_ClassicProjectFragment$key} from './__generated__/ItemPickerProjectsItem_ClassicProjectFragment.graphql'

export type ItemPickerProjectsItem = {
  onItemSelect: (id: string, additionalInfo: SubmittedProject['additionalInfo']) => void
  selected: boolean
  selectType: 'multiple' | 'instant' | 'single'
  uniqueListId: string
} & Pick<ActionListItemProjectProps, 'disabled' | 'inactiveText'>

export const ItemPickerProjectsItem_ClassicProjectFragment = graphql`
  fragment ItemPickerProjectsItem_ClassicProjectFragment on Project
  # Use inline directive to access data on initial selected projects
  # https://relay.dev/docs/api-reference/graphql-and-directives/#inline
  @inline {
    __typename
    id
    title: name
    # eslint-disable-next-line relay/unused-fields
    closed
    # eslint-disable-next-line relay/unused-fields
    columns(first: 10) {
      edges {
        node {
          id
        }
      }
    }
  }
`

export const ItemPickerProjectsItem_ProjectV2Fragment = graphql`
  fragment ItemPickerProjectsItem_ProjectV2Fragment on ProjectV2
  # Use inline directive to access data on initial selected projects
  # https://relay.dev/docs/api-reference/graphql-and-directives/#inline
  @inline {
    __typename
    id
    title
    # eslint-disable-next-line relay/unused-fields
    closed
  }
`

export function ItemPickerProjectsV2Item({
  projectItem,
  onItemSelect,
  selected,
  selectType,
  uniqueListId,
  ...props
}: ItemPickerProjectsItem & {projectItem: ItemPickerProjectsItem_ProjectV2Fragment$key}) {
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerProjectsItem_ProjectV2Fragment, projectItem)
  const {id, title, closed, __typename} = item

  const onSelect = () => {
    onItemSelect(id, {title, closed, __typename})
  }

  const typeSpecificProps =
    selectType === 'multiple' || selectType === 'instant' ? {selectType} : {selectType, radioGroupName: uniqueListId}

  return (
    <ActionListItemProject {...typeSpecificProps} {...props} onSelect={onSelect} selected={selected} name={title} />
  )
}

export function ItemPickerProjectsClassicItem({
  projectItem,
  onItemSelect,
  selected,
  selectType,
  uniqueListId,
  ...props
}: ItemPickerProjectsItem & {projectItem: ItemPickerProjectsItem_ClassicProjectFragment$key}) {
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerProjectsItem_ClassicProjectFragment, projectItem)
  const {id, title, closed, __typename} = item

  const onSelect = () => {
    onItemSelect(id, {title, closed, __typename})
  }

  const typeSpecificProps =
    selectType === 'multiple' || selectType === 'instant' ? {selectType} : {selectType, radioGroupName: uniqueListId}

  return (
    <ActionListItemProject
      {...typeSpecificProps}
      {...props}
      onSelect={onSelect}
      selected={selected}
      name={title}
      isClassic
    />
  )
}
