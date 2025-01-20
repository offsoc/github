// eslint-disable-next-line filenames/match-regex
import {useActionBarResize} from '@github-ui/action-bar'
import {CommentIcon, IssueClosedIcon, PencilIcon, SortDescIcon, TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  // Use Avatar instead of GithubAvatar component to avoid importing the dependency
  // eslint-disable-next-line no-restricted-imports
  Avatar,
  Button,
  Label as PrimerLabel,
  Link,
  Octicon,
  SelectPanel,
} from '@primer/react'
import {LeadingVisual} from '@primer/react/lib-esm/ActionList/Visuals'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {Dispatch, SetStateAction} from 'react'
import {useEffect, useMemo, useRef, useState} from 'react'

import {useNestedListViewSelection} from '../context/SelectionContext'
import {NestedListItemActionBar} from '../NestedListItem/ActionBar'
import {NestedListItemLeadingContent} from '../NestedListItem/LeadingContent'
import {NestedListItemLeadingVisual} from '../NestedListItem/LeadingVisual'
import {NestedListItem} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListViewHeader, type NestedListViewHeaderProps} from '../NestedListViewHeader/NestedListViewHeader'
import {
  branches,
  checkStates,
  iconMap,
  type Label,
  labels,
  type ListItemDescriptionAreaOption,
  type ListItemPrimaryAreaOption,
  relativeTimes,
  reviewStates,
  titles,
} from './mocks'
import styles from './stories.module.css'

const getRandomEntry = <T extends string | object>(array: T[]) => array[Math.floor(Math.random() * array.length)]

/******************
 * COMMENT
 ******************/

export const Comments = ({count}: {count: number}) =>
  count ? (
    <>
      <CommentIcon size={16} /> {count}
    </>
  ) : null

/******************
 * LABEL
 ******************/

export const generateLabels = (index: number) => labels.slice(index, index * 3)

export const getLabelsDescription = (items: string[]) => {
  return `Labels: ${items.join(', ')};`
}

export function Labels({items}: {items: Label[]}) {
  const labelRef = useRef<HTMLDivElement>(null)

  const labelsDescription = useMemo(() => {
    return getLabelsDescription(items.map(label => label.name))
  }, [items])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden">
      <div className={styles.labelContainer} role="group" aria-label={labelsDescription}>
        <div className={styles.label} ref={labelRef}>
          {items.map((label, index) => {
            const {name, variant} = label
            return (
              <Link key={index} muted>
                <PrimerLabel variant={variant}>{name}</PrimerLabel>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/******************
 * STATUS ICON
 ******************/

export const generateStatusIcon = (type: 'Issues' | 'Pull Requests' | 'Deployments' | 'Repositories') => {
  const icons = iconMap[type] || iconMap['Issues']
  return getRandomEntry(icons as object[])
}

/******************
 * AVATAR
 ******************/

export const generateAvatar = () => {
  return <Avatar className={styles.avatar} src="https://avatars.githubusercontent.com/u/92997159?v=4" />
}

/******************
 * TITLE
 ******************/

export const generateTitle = (type: ListItemPrimaryAreaOption, id: number) => {
  return titles[type][id] || `${type} + ${id}`
}

/******************
 * DESCRIPTION
 ******************/

const reviews = reviewStates.map(({icon, color, description}) => (
  <>
    <Octicon icon={icon} size={12} sx={{color}} />
    <span className={styles.reviewDescription}>{description}</span>
  </>
))

const checkStatuses = checkStates.map(({icon, color, count}) => (
  <>
    <Octicon icon={icon} sx={{color}} />
    <span>{count}</span>
  </>
))

export const generateDescription = (type: ListItemDescriptionAreaOption) => {
  switch (type) {
    case 'Branch name':
      return getRandomEntry(branches)
    case 'Relative time':
      return `Updated ${getRandomEntry(relativeTimes)}`
    case 'Review state and checks':
      return (
        <span className={styles.reviewContainer}>
          {getRandomEntry(reviews)} &middot; {getRandomEntry(checkStatuses)}
        </span>
      )
    default:
      return (
        <>
          {getRandomEntry(branches)} &middot; {getRandomEntry(reviews)} &middot; {getRandomEntry(checkStatuses)}
        </>
      )
  }
}

/******************
 * NestedListItem.ActionBar
 ******************/

export const SampleNestedListItemActionBar = () => (
  <NestedListItemActionBar
    label="sample action bar"
    staticMenuActions={[
      {
        key: 'mark-as',
        render: () => <ActionList.Item>Mark as</ActionList.Item>,
      },
      {
        key: 'assign-to',
        render: () => <ActionList.Item>Assign</ActionList.Item>,
      },
      {
        key: 'set-label',
        render: () => <ActionList.Item>Label</ActionList.Item>,
      },
      {
        key: 'set-milestone',
        render: () => <ActionList.Item>Milestone</ActionList.Item>,
      },
      {
        key: 'add-to-project',
        render: () => <ActionList.Item>Project</ActionList.Item>,
      },
    ]}
  />
)

/******************
 * SUBITEMS
 ******************/

const subItems = [
  <NestedListItem
    key={0}
    title={<NestedListItemTitle value="Create sound effects for blasters and light thrusters" href="#" />}
    subItems={[
      <NestedListItem
        key={3}
        title={<NestedListItemTitle value="Trigger enemy generation upon level creation" href="#" />}
      >
        <NestedListItemLeadingContent>
          <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
        </NestedListItemLeadingContent>
      </NestedListItem>,
    ]}
  >
    <NestedListItemLeadingContent>
      <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
    </NestedListItemLeadingContent>
  </NestedListItem>,
  <NestedListItem key={1} title={<NestedListItemTitle value="Do not update velocity?" href="#" />}>
    <NestedListItemLeadingContent>
      <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
    </NestedListItemLeadingContent>
  </NestedListItem>,
  <NestedListItem key={1} title={<NestedListItemTitle value="Add player dash animation" href="#" />}>
    <NestedListItemLeadingContent>
      <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} newActivity={true} />
    </NestedListItemLeadingContent>
  </NestedListItem>,
]

export const generateSubItems = () => {
  const numberOfSubItems = Math.floor(Math.random() * subItems.length)
  const arr = [] as JSX.Element[]
  for (let i = 0; i < numberOfSubItems; i++) {
    const subItem = subItems[Math.floor(Math.random() * subItems.length)]
    if (subItem) arr.push(subItem)
  }

  return arr.length > 0 ? arr : undefined
}

/******************
 * NestedListViewHeader
 ******************/

const coloredCircle = (hexColor: string) => (
  <div className={styles.circle} style={{background: hexColor, borderColor: hexColor}} />
)

export const allLabelItems: ItemInput[] = [
  {text: 'bug', leadingVisual: () => coloredCircle('#d73a4a')},
  {text: 'documentation', leadingVisual: () => coloredCircle('#0075ca')},
  {text: 'duplicate', leadingVisual: () => coloredCircle('#cfd3d7')},
  {text: 'enhancement', leadingVisual: () => coloredCircle('#a2eeef')},
  {text: 'good first issue', leadingVisual: () => coloredCircle('#7057ff')},
]

type SampleSelectPanelProps = {
  nested?: boolean
  selectedItems: ItemInput[]
  setSelectedItems: Dispatch<SetStateAction<ItemInput[]>>
  actionKey: string
}

export const SampleSelectPanel = ({
  nested = false,
  selectedItems,
  setSelectedItems,
  actionKey,
}: SampleSelectPanelProps) => {
  const toggleButtonContainerRef = useRef<HTMLDivElement>(null)
  const toggleButtonContainer = toggleButtonContainerRef.current
  const {recalculateItemSize} = useActionBarResize()
  const [filter, setFilter] = useState('')
  const filteredItems = useMemo(
    () => allLabelItems.filter(item => item.text?.toLowerCase().includes(filter.toLowerCase())),
    [filter],
  )
  const [open, setOpen] = useState(false)
  const selectPanelProps = useMemo(
    () => ({
      title: `Select labels (${selectedItems.length})`,
      selected: selectedItems,
      onSelectedChange: setSelectedItems,
      items: filteredItems,
      onFilterChange: setFilter,
    }),
    [selectedItems, filteredItems, setSelectedItems],
  )

  useEffect(() => {
    if (!open && toggleButtonContainer && actionKey) recalculateItemSize(actionKey, toggleButtonContainer)
  }, [open, recalculateItemSize, actionKey, toggleButtonContainer])

  return (
    <SelectPanel
      renderAnchor={({children, ...anchorProps}) =>
        nested ? (
          <ActionList.Item {...anchorProps} role="menuitem">
            <LeadingVisual>
              <TagIcon />
            </LeadingVisual>{' '}
            Set label
          </ActionList.Item>
        ) : (
          <div ref={toggleButtonContainerRef}>
            <Button leadingVisual={TagIcon} trailingAction={TriangleDownIcon} {...anchorProps}>
              {children || 'Set label'}
            </Button>
          </div>
        )
      }
      {...selectPanelProps}
      open={open}
      onOpenChange={setOpen}
    />
  )
}

const sampleActionListItems = (
  <>
    <ActionList.Item role="menuitemradio">Foo</ActionList.Item>
    <ActionList.Item role="menuitemradio">Bar</ActionList.Item>
    <ActionList.Item role="menuitemradio">Baz</ActionList.Item>
  </>
)

export const SampleListViewHeaderWithActions = ({children, ...args}: NestedListViewHeaderProps) => {
  const [selectedLabels, setSelectedLabels] = useState<ItemInput[]>([
    {
      text: 'duplicate',
      leadingVisual: () => coloredCircle('#cfd3d7'),
    },
  ])
  const applyLabelsProps = useMemo(
    () => ({selectedItems: selectedLabels, setSelectedItems: setSelectedLabels}),
    [selectedLabels],
  )
  const {selectedCount} = useNestedListViewSelection()
  return (
    <NestedListViewHeader
      actionsLabel="Actions"
      actions={
        selectedCount < 1
          ? [
              {
                key: 'sort',
                render: isOverflowMenu => {
                  return isOverflowMenu ? (
                    <ActionList.Item>
                      <ActionList.LeadingVisual>
                        <SortDescIcon />
                      </ActionList.LeadingVisual>
                      Newest
                    </ActionList.Item>
                  ) : (
                    <ActionMenu>
                      <ActionMenu.Button leadingVisual={SortDescIcon} variant="invisible">
                        Newest
                      </ActionMenu.Button>
                      <ActionMenu.Overlay>
                        <ActionList>{sampleActionListItems}</ActionList>
                      </ActionMenu.Overlay>
                    </ActionMenu>
                  )
                },
              },
              {
                key: 'edit',
                render: isOverflowMenu => {
                  return isOverflowMenu ? (
                    <ActionList.Item>
                      <ActionList.LeadingVisual>
                        <PencilIcon />
                      </ActionList.LeadingVisual>
                      Edit
                    </ActionList.Item>
                  ) : (
                    <Button leadingVisual={PencilIcon}>Edit</Button>
                  )
                },
              },
            ]
          : [
              {
                key: 'apply-labels',
                render: isOverflowMenu => (
                  <SampleSelectPanel actionKey="apply-labels" nested={isOverflowMenu} {...applyLabelsProps} />
                ),
              },
              {
                key: 'mark-as',
                render: isOverflowMenu => (
                  <ActionMenu>
                    {isOverflowMenu ? (
                      <ActionMenu.Anchor>
                        <ActionList.Item>
                          <ActionList.LeadingVisual>
                            <IssueClosedIcon />
                          </ActionList.LeadingVisual>
                          Mark as...
                        </ActionList.Item>
                      </ActionMenu.Anchor>
                    ) : (
                      <ActionMenu.Button leadingVisual={IssueClosedIcon}>Mark as...</ActionMenu.Button>
                    )}

                    <ActionMenu.Overlay>
                      <ActionList>{sampleActionListItems}</ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                ),
              },
            ]
      }
      {...args}
    >
      {children}
    </NestedListViewHeader>
  )
}
