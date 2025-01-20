import {LabelToken} from '@github-ui/label-token'
import {noop} from '@github-ui/noop'
import {CodeIcon, CopyIcon, FileCodeIcon} from '@primer/octicons-react'
import {IconButton, Link, RelativeTime} from '@primer/react'
import type {Meta} from '@storybook/react'
import {type ReactElement, useCallback, useEffect, useMemo, useState} from 'react'

import {ListItemDescription} from '../../ListItem/Description'
import {ListItemLeadingBadge} from '../../ListItem/LeadingBadge'
import {ListItemLeadingContent} from '../../ListItem/LeadingContent'
import {ListItemLeadingVisual} from '../../ListItem/LeadingVisual'
import {ListItem} from '../../ListItem/ListItem'
import {ListItemMainContent} from '../../ListItem/MainContent'
import {ListItemMetadata} from '../../ListItem/Metadata'
import {ListItemTitle} from '../../ListItem/Title'
import {ListItemTrailingBadge} from '../../ListItem/TrailingBadge'
import {ListViewDensityToggle} from '../DensityToggle'
import {ListView, type ListViewProps} from '../ListView'
import {ListViewMetadata} from '../Metadata'
import {ListViewSectionFilterLink} from '../SectionFilterLink'
import {
  Comments,
  generateAvatar,
  generateDescription,
  generateLabels,
  generateStatusIcon,
  generateTitle,
  Labels,
  SampleListItemActionBar,
  SampleListViewMetadataWithActions,
} from './helpers'
import {
  type ListItemDescriptionAreaOption,
  ListItemDescriptionAreaOptions,
  type ListItemPrimaryAreaOption,
  ListItemPrimaryAreaOptions,
  type ListItemStatusAreaOption,
  ListItemStatusAreaOptions,
  type ListViewMetaDataAreaOption,
  ListViewMetaDataAreaOptions,
  titles,
} from './mocks'

type ListViewWithMetadataProps = ListViewProps & {
  listViewMetadataArea: ListViewMetaDataAreaOption[]
  listItemMetadataArea?: (index: number) => ReactElement
  listItemPrimaryArea: ListItemPrimaryAreaOption
  listItemStatusArea: ListItemStatusAreaOption
  listItemDescriptionArea: ListItemDescriptionAreaOption
  listItemActionArea: boolean
  includeLeadingBadge?: boolean
  includeTrailingBadge?: boolean
}

const meta: Meta<ListViewWithMetadataProps> = {
  title: 'Recipes/ListView',
  component: ListView,
  args: {
    title: 'List of items',
    includeLeadingBadge: false,
    includeTrailingBadge: false,
    listViewMetadataArea: ['isSelectable', 'DensityToggle', 'ActionBar'],
    listItemDescriptionArea: 'Branch name',
    listItemPrimaryArea: 'Issues',
    listItemStatusArea: 'Issues',
    listItemActionArea: true,
    variant: 'default',
  },
  argTypes: {
    listViewMetadataArea: {
      control: 'check',
      description: 'Toggle sample metadata within the ListView',
      options: ListViewMetaDataAreaOptions,
    },
    listItemStatusArea: {
      control: 'select',
      description: 'Toggle sample status visual within the ListItem',
      options: ListItemStatusAreaOptions,
    },
    listItemPrimaryArea: {
      control: 'select',
      description: 'Toggle sample primary content within the ListItem',
      options: ListItemPrimaryAreaOptions,
    },
    listItemDescriptionArea: {
      control: 'select',
      description: 'Toggle sample description content within the ListItem',
      options: ListItemDescriptionAreaOptions,
    },
    listItemActionArea: {
      control: 'boolean',
      description: 'Include action bar within the ListItem',
    },
    listItemMetadataArea: {
      control: 'select',
      description: 'Toggle sample metadata within the ListItem',
      options: ['Combo', 'Labels', 'Icons', 'Text', 'None'],
      mapping: {
        Combo: (index: number) => (
          <>
            <ListItemMetadata style={{flexShrink: 1}}>
              <Labels items={generateLabels(index)} />
            </ListItemMetadata>
            <ListItemMetadata>
              <Comments count={index * 2} />
            </ListItemMetadata>
          </>
        ),
        Labels: (index: number) => (
          <ListItemMetadata style={{flexShrink: 1}}>
            <Labels items={generateLabels(index)} />
          </ListItemMetadata>
        ),
        Icons: (index: number) => (
          <>
            <ListItemMetadata>
              <Comments count={index * 2} />
            </ListItemMetadata>
            <ListItemMetadata>
              <IconButton icon={CopyIcon} variant="invisible" aria-label="Copy something." />
            </ListItemMetadata>
            <ListItemMetadata>
              <IconButton icon={FileCodeIcon} variant="invisible" aria-label="View something." />
            </ListItemMetadata>
            <ListItemMetadata>
              <IconButton icon={CodeIcon} variant="invisible" aria-label="Browse something." />
            </ListItemMetadata>
          </>
        ),
        Text: (index: number) => (
          <>
            <ListItemMetadata style={{overflow: 'hidden'}}>
              <Link href="#">
                <span>(#{index})</span>
              </Link>
            </ListItemMetadata>
            <ListItemMetadata>
              <RelativeTime
                datetime={new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()}
                format="relative"
                prefix=""
              />
            </ListItemMetadata>
          </>
        ),
        None: undefined,
      },
    },
    // disabled controls
    ariaLabelledBy: {table: {disable: true}},
    isSelectable: {table: {disable: true}},
    listRef: {table: {disable: true}},
    metadata: {table: {disable: true}},
    onVariantChange: {table: {disable: true}},
    pluralUnits: {table: {disable: true}},
    singularUnits: {table: {disable: true}},
    titleHeaderTag: {table: {disable: true}},
    totalCount: {table: {disable: true}},
  },
}

export default meta

const SampleActionBar = ({
  checked,
  hasSelectedItems,
  onToggleSelectAll,
}: {
  checked: ListViewWithMetadataProps['listViewMetadataArea']
  hasSelectedItems: boolean
  onToggleSelectAll: (selectAll: boolean) => void
}) => {
  const [has, setHas] = useState({
    Title: false,
    SectionFilterLink: false,
    DensityToggle: false,
    ActionBar: false,
  } as {[key in ListViewMetaDataAreaOption]: boolean})

  useEffect(() => {
    if (checked) {
      const selected = {} as {[key in ListViewMetaDataAreaOption]: boolean}
      for (const el of checked) {
        selected[el] = true
      }
      setHas(selected)
    }
  }, [checked])

  const sectionFilters = hasSelectedItems
    ? []
    : [
        <ListViewSectionFilterLink key={0} title="Opened" count={8} href="#" isSelected />,
        <ListViewSectionFilterLink key={1} title="Closed" count={20} href="#" />,
      ]

  const props = {
    onToggleSelectAll,
    densityToggle: has['DensityToggle'] ? <ListViewDensityToggle /> : undefined,
    sectionFilters: has['SectionFilterLink'] ? sectionFilters : undefined,
    title: has['Title'] ? 'List of items' : undefined,
  }
  return has['ActionBar'] ? <SampleListViewMetadataWithActions {...props} /> : <ListViewMetadata {...props} />
}

const SampleListItem = ({
  id,
  isSelected,
  onSelect,
  args,
}: {
  id: string
  isSelected: boolean
  onSelect: (id: string, value: boolean) => void
  args: ListViewWithMetadataProps
}) => {
  const title = useMemo(() => generateTitle(args.listItemPrimaryArea, Number(id)), [args.listItemPrimaryArea, id])
  const description = useMemo(() => generateDescription(args.listItemDescriptionArea), [args.listItemDescriptionArea])
  const leadingContent = useMemo(
    () =>
      args.listItemStatusArea === 'Avatars' ? (
        generateAvatar()
      ) : (
        <ListItemLeadingVisual {...generateStatusIcon(args.listItemStatusArea)} />
      ),
    [args.listItemStatusArea],
  )
  return (
    <ListItem
      isSelected={isSelected}
      onSelect={newIsSelected => onSelect(id, newIsSelected)}
      title={
        <ListItemTitle
          value={title!}
          href="#"
          onClick={noop}
          {...(args.includeLeadingBadge && {leadingBadge: <ListItemLeadingBadge title="leading badge" />})}
          {...(args.includeTrailingBadge && {
            trailingBadges: [
              <ListItemTrailingBadge key={0} title="foo">
                <Link href="#">
                  <LabelToken text={'label token'} key={3} fillColor="#000000" />
                </Link>{' '}
              </ListItemTrailingBadge>,
              <ListItemTrailingBadge key={1} title="trailing badge" />,
              <ListItemTrailingBadge key={2} title="another badge" />,
              <ListItemTrailingBadge key={3} title="yolo">
                <Link href="#">
                  <LabelToken text={'label token'} key={3} fillColor="#000000" />
                </Link>{' '}
              </ListItemTrailingBadge>,
            ],
          })}
        />
      }
      {...(args.listItemActionArea && {secondaryActions: <SampleListItemActionBar />})}
      metadata={args.listItemMetadataArea?.(Number(id))}
    >
      <ListItemLeadingContent>{leadingContent}</ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>{description}</ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
const ListWithMetadata = ({...args}: ListViewWithMetadataProps) => {
  const itemsToRender = [...Array(titles[args.listItemPrimaryArea].length).keys()]
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set<string>())
  const isSelectable = args.listViewMetadataArea?.includes('isSelectable')

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

  const onToggleSelectAll = (isSelectAllChecked: boolean) => {
    if (isSelectAllChecked) {
      setCheckedItems(new Set<string>(itemsToRender.map(i => i.toString())))
    } else {
      setCheckedItems(new Set())
    }
  }

  return (
    // Force re-rendering of the list when the variant changes
    <ListView
      key={args.variant}
      metadata={
        args.listViewMetadataArea?.length > 0 ? (
          <SampleActionBar
            checked={args.listViewMetadataArea}
            onToggleSelectAll={onToggleSelectAll}
            hasSelectedItems={checkedItems.size > 0}
          />
        ) : undefined
      }
      isSelectable={isSelectable}
      {...args}
    >
      {itemsToRender.map(id => (
        <SampleListItem
          key={id}
          id={id.toString()}
          isSelected={checkedItems.has(id.toString())}
          onSelect={onSelect}
          args={args}
        />
      ))}
    </ListView>
  )
}

export const Playground = {
  render: (args: ListViewWithMetadataProps) => <ListWithMetadata {...args} />,
}
