import {noop} from '@github-ui/noop'
import type {Meta, StoryObj} from '@storybook/react'
import {useCallback, useState} from 'react'

import {HeaderTags} from '../../constants'
import {ListItemDescription} from '../../ListItem/Description'
import {ListItemLeadingContent} from '../../ListItem/LeadingContent'
import {ListItemLeadingVisual} from '../../ListItem/LeadingVisual'
import {ListItem} from '../../ListItem/ListItem'
import {ListItemMainContent} from '../../ListItem/MainContent'
import {ListItemTitle} from '../../ListItem/Title'
import {ListItemTrailingBadge} from '../../ListItem/TrailingBadge'
import {ListViewDensityToggle} from '../DensityToggle'
import {ListView, type ListViewProps} from '../ListView'
import {
  generateDescription,
  generateStatusIcon,
  SampleListItemActionBar,
  SampleListViewMetadataWithActions,
} from './helpers'

const meta: Meta<ListViewProps> = {
  title: 'Recipes/ListView',
  component: ListView,
  args: {
    title: 'List of items',
    titleHeaderTag: 'h2',
    variant: 'default',
    isSelectable: true,
    totalCount: 100,
  },
  argTypes: {
    titleHeaderTag: {
      control: 'select',
      options: HeaderTags,
    },
    totalCount: {
      control: 'number',
      step: 1,
      min: 0,
    },
  },
}

export default meta

const titles = [
  'Updates to velocity of the ship and alien movements to directly support the new engine',
  'Add a new "Alien" type to the game',
  'Support for multiple players',
  'Player ship can shoot laser beams',
  'We should add a new type of alien that moves faster than the others and a new type of alien that moves faster than the others. Both should be worth more points.',
]

const SampleListItem = ({
  id,
  isSelected,
  onSelect,
}: {
  id: string
  isSelected: boolean
  onSelect: (id: string, value: boolean) => void
}) => (
  <ListItem
    isSelected={isSelected}
    onSelect={newIsSelected => onSelect(id, newIsSelected)}
    title={
      <ListItemTitle
        value={titles[Number(id)]!}
        href="#"
        onClick={noop}
        trailingBadges={[<ListItemTrailingBadge key={0} title="trailing badge" />]}
      />
    }
    secondaryActions={<SampleListItemActionBar />}
  >
    <ListItemLeadingContent>
      <ListItemLeadingVisual {...generateStatusIcon('Issues')} />
    </ListItemLeadingContent>

    <ListItemMainContent>
      <ListItemDescription>{generateDescription('Branch name')}</ListItemDescription>
    </ListItemMainContent>
  </ListItem>
)

const ListWithMetadata = ({isSelectable, ...args}: ListViewProps) => {
  const allItemIds = ['0', '1', '2', '3', '4']
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set<string>())

  const onSelect = useCallback(
    (id: string, selected: boolean) => {
      if (selected) {
        if (isSelectable && !checkedItems.has(id)) {
          setCheckedItems(new Set<string>(checkedItems.add(id)))
        }
      } else {
        checkedItems.delete(id)
        setCheckedItems(new Set<string>(checkedItems))
      }
    },
    [checkedItems, setCheckedItems, isSelectable],
  )

  return (
    // Force re-rendering of the list when the variant changes
    <ListView
      key={args.variant}
      metadata={
        <SampleListViewMetadataWithActions
          densityToggle={<ListViewDensityToggle />}
          onToggleSelectAll={isSelectAllChecked => {
            if (isSelectAllChecked) {
              setCheckedItems(new Set(allItemIds))
            } else {
              setCheckedItems(new Set())
            }
          }}
        />
      }
      isSelectable={isSelectable}
      {...args}
    >
      {allItemIds.map(id => (
        <SampleListItem key={id} id={id} isSelected={checkedItems.has(id)} onSelect={onSelect} />
      ))}
    </ListView>
  )
}

export const Example: StoryObj<ListViewProps> = {
  args: {},
  render: args => <ListWithMetadata {...args} />,
}
