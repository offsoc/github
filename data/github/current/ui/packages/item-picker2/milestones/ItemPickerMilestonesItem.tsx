import {graphql, readInlineData} from 'react-relay'
import type {SubmittedMilestone} from './types'
import type {ItemPickerMilestonesItem_Fragment$key} from './__generated__/ItemPickerMilestonesItem_Fragment.graphql'
import {ActionList, Octicon} from '@primer/react'
import {MilestoneIcon} from '@primer/octicons-react'

export type ItemPickerMilestonesItemProps = {
  milestoneItem: ItemPickerMilestonesItem_Fragment$key
  onItemSelect: (id: string, additionalInfo: SubmittedMilestone['additionalInfo']) => void
  selected: boolean
}

export const ItemPickerMilestonesItem_Fragment = graphql`
  fragment ItemPickerMilestonesItem_Fragment on Milestone
  # Use inline directive to access data on initial selected milestones
  # https://relay.dev/docs/api-reference/graphql-and-directives/#inline
  @inline {
    id
    title
    state
  }
`

export function ItemPickerMilestonesItem({
  milestoneItem,
  onItemSelect,
  selected,
  ...props
}: ItemPickerMilestonesItemProps) {
  // eslint-disable-next-line no-restricted-syntax
  const milestone = readInlineData(ItemPickerMilestonesItem_Fragment, milestoneItem)
  const {id, title, state} = milestone

  const onSelect = () => {
    // TODO: hardcode additional data for now, but check with Issues team if they need optional relay directives
    const additionalData = {
      id,
      title,
      state,
    }
    onItemSelect(id, additionalData)
  }

  return (
    <ActionList.Item selected={selected} onSelect={onSelect} {...props}>
      <ActionList.LeadingVisual>
        <Octicon icon={MilestoneIcon} size={16} sx={{mr: 2, color: 'fg.muted'}} />
      </ActionList.LeadingVisual>
      {title}
    </ActionList.Item>
  )
}
