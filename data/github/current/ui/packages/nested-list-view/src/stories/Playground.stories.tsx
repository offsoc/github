import {noop} from '@github-ui/noop'
import {CodeIcon, CopyIcon, FileCodeIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {Meta} from '@storybook/react'
import {type Dispatch, type ReactElement, type SetStateAction, useCallback, useEffect, useMemo, useState} from 'react'

import {NestedListViewCompletionPill} from '../CompletionPill'
import {NestedListItemLeadingBadge} from '../NestedListItem/LeadingBadge'
import {NestedListItemLeadingContent} from '../NestedListItem/LeadingContent'
import {NestedListItemLeadingVisual} from '../NestedListItem/LeadingVisual'
import {NestedListItemMetadata} from '../NestedListItem/Metadata'
import {NestedListItem} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListView, type NestedListViewProps} from '../NestedListView'
import {NestedListViewHeader} from '../NestedListViewHeader/NestedListViewHeader'
import {NestedListViewHeaderSectionFilterLink} from '../NestedListViewHeader/SectionFilterLink'
import {NestedListViewHeaderTitle} from '../NestedListViewHeader/Title'
import {
  Comments,
  generateStatusIcon,
  generateSubItems,
  generateTitle,
  SampleListViewHeaderWithActions,
  SampleNestedListItemActionBar,
} from './helpers'
import {type ListViewHeaderAreaOption, ListViewHeaderAreaOptions, titles} from './mocks'

type NestedListViewWithHeaderProps = NestedListViewProps & {
  listViewHeaderArea: ListViewHeaderAreaOption[]
  listItemMetadataArea?: (index: number) => ReactElement
  listItemActionArea: boolean
  includeLeadingBadge?: boolean
  includeTrailingBadge?: boolean
}

const Icons = ({index}: {index: number}) => (
  <>
    <NestedListItemMetadata>
      <Comments count={index * 2} />
    </NestedListItemMetadata>
    <NestedListItemMetadata>
      <IconButton icon={CopyIcon} variant="invisible" aria-label="Copy something." />
    </NestedListItemMetadata>
    <NestedListItemMetadata>
      <IconButton icon={FileCodeIcon} variant="invisible" aria-label="View something." />
    </NestedListItemMetadata>
    <NestedListItemMetadata>
      <IconButton icon={CodeIcon} variant="invisible" aria-label="Browse something." />
    </NestedListItemMetadata>
  </>
)

const meta: Meta<NestedListViewWithHeaderProps> = {
  title: 'Recipes/NestedListView',
  component: NestedListView,
  args: {
    title: 'Nested list of items',
    includeLeadingBadge: true,
    includeTrailingBadge: true,
    listViewHeaderArea: ['isCollapsible', 'Title', 'CompletionPill', 'ActionBar'],
    listItemActionArea: true,
    listItemMetadataArea: (index: number) => <Icons index={index} />,
  },
  argTypes: {
    listViewHeaderArea: {
      control: 'check',
      description: 'Toggle sample header within the NestedListView',
      options: ListViewHeaderAreaOptions,
    },
    listItemActionArea: {
      control: 'boolean',
      description: 'Include action bar within the NestedListItem',
    },
    listItemMetadataArea: {
      control: 'select',
      description: 'Toggle sample metadata within the NestedListItem',
      options: ['Icons', 'None'],
      defaultValue: 'Icons',
      mapping: {Icons: (index: number) => <Icons index={index} />, None: undefined},
    },
    // disabled controls
    ariaLabelledBy: {table: {disable: true}},
    header: {table: {disable: true}},
    isCollapsible: {table: {disable: true}},
    isSelectable: {table: {disable: true}},
    listRef: {table: {disable: true}},
    pluralUnits: {table: {disable: true}},
    singularUnits: {table: {disable: true}},
    titleHeaderTag: {table: {disable: true}},
    totalCount: {table: {disable: true}},
  },
  parameters: {
    a11y: {
      config: {
        // Disable role=presentation axe rule on anchor tag
        rules: [
          {id: 'aria-allowed-role', enabled: false},
          {id: 'presentation-role-conflict', enabled: false},
        ],
      },
    },
  },
}

export default meta

const SampleNestedListViewHeader = ({
  checked,
  hasSelectedItems,
  onToggleSelectAll,
}: {
  checked: NestedListViewWithHeaderProps['listViewHeaderArea']
  hasSelectedItems: boolean
  onToggleSelectAll: (selectAll: boolean) => void
}) => {
  const [has, setHas] = useState({
    Title: false,
    SectionFilterLink: false,
    CompletionPill: false,
    ActionBar: false,
  } as {[key in ListViewHeaderAreaOption]: boolean})

  useEffect(() => {
    if (checked) {
      const selected = {} as {[key in ListViewHeaderAreaOption]: boolean}
      for (const el of checked) {
        selected[el] = true
      }
      setHas(selected)
    }
  }, [checked])

  const sectionFilters = hasSelectedItems
    ? []
    : [
        <NestedListViewHeaderSectionFilterLink key={0} title="Opened" count={8} href="#" isSelected />,
        <NestedListViewHeaderSectionFilterLink key={1} title="Closed" count={20} href="#" />,
      ]

  const props = {
    onToggleSelectAll,
    sectionFilters: has['SectionFilterLink'] ? sectionFilters : undefined,
    title: has['Title'] ? <NestedListViewHeaderTitle title="NestedList of items" /> : undefined,
    sx: {
      backgroundColor: 'none',
      border: 'none',
    },
    completionPill: has['CompletionPill'] ? (
      <NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />
    ) : undefined,
  }
  return has['ActionBar'] ? <SampleListViewHeaderWithActions {...props} /> : <NestedListViewHeader {...props} />
}

const SampleNestedListItem = ({
  id,
  isSelected,
  onSelect,
  args,
  setDialogVisible,
}: {
  id: string
  isSelected: boolean
  onSelect: (id: string, value: boolean) => void
  args: NestedListViewWithHeaderProps
  setDialogVisible: Dispatch<SetStateAction<boolean>>
}) => {
  const title = useMemo(() => generateTitle('Issues', Number(id)), [id])

  return (
    <NestedListItem
      isSelected={isSelected}
      onSelect={newIsSelected => onSelect(id, newIsSelected)}
      title={
        <NestedListItemTitle
          value={title}
          href="#"
          onClick={noop}
          {...(args.includeLeadingBadge && {leadingBadge: <NestedListItemLeadingBadge title="leading badge" />})}
          {...(args.includeTrailingBadge && {
            trailingBadges: [
              <NestedListViewCompletionPill key={0} progress={{total: 5, completed: 2, percentCompleted: 40}} />,
            ],
          })}
        />
      }
      {...(args.listItemActionArea && {
        secondaryActions: <SampleNestedListItemActionBar />,
        onOpenControlsDialog: () => setDialogVisible(true),
      })}
      metadata={args.listItemMetadataArea?.(Number(id))}
      subItems={generateSubItems()}
    >
      <NestedListItemLeadingContent>
        <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
      </NestedListItemLeadingContent>
    </NestedListItem>
  )
}

const NestedListViewWithHeader = ({...args}: NestedListViewWithHeaderProps) => {
  const itemsToRender = [...Array(titles['Issues'].length).keys()]
  const [dialogVisible, setDialogVisible] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set<string>())
  const isSelectable = args.listViewHeaderArea?.includes('isSelectable')

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
    <>
      <NestedListView
        header={
          args.listViewHeaderArea?.length > 0 ? (
            <SampleNestedListViewHeader
              checked={args.listViewHeaderArea}
              onToggleSelectAll={onToggleSelectAll}
              hasSelectedItems={checkedItems.size > 0}
            />
          ) : undefined
        }
        isCollapsible={args.listViewHeaderArea?.includes('isCollapsible')}
        isSelectable={isSelectable}
        {...args}
      >
        {itemsToRender.map(id => (
          <SampleNestedListItem
            key={id}
            id={id.toString()}
            isSelected={checkedItems.has(id.toString())}
            onSelect={onSelect}
            args={args}
            setDialogVisible={setDialogVisible}
          />
        ))}
      </NestedListView>
      {dialogVisible && (
        <Dialog onClose={() => setDialogVisible(false)} title="Manage item">
          This is where the consumer would render secondary actions to manage the current item
        </Dialog>
      )}
    </>
  )
}

export const Playground = {
  render: (args: NestedListViewWithHeaderProps) => <NestedListViewWithHeader {...args} />,
}
