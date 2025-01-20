// Use Avatar instead of GithubAvatar component to avoid importing the dependency
// eslint-disable-next-line filenames/match-regex
import {useActionBarResize} from '@github-ui/action-bar'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {CommentIcon, IssueClosedIcon, PencilIcon, TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  // eslint-disable-next-line no-restricted-imports
  Avatar,
  Box,
  Button,
  Label as PrimerLabel,
  Link,
  Octicon,
  SelectPanel,
  Text,
  Token,
  Tooltip,
} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {clsx} from 'clsx'
import type {Dispatch, SetStateAction} from 'react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {ListItemActionBar} from '../../ListItem/ActionBar'
import {ListViewMetadata, type ListViewMetadataProps} from '../Metadata'
import {useListViewSelection} from '../SelectionContext'
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

export const getLabelsDescription = (items: string[], truncatedLabelCount: number) => {
  const description = `Labels: ${items.slice(0, items.length - truncatedLabelCount).join(', ')}`

  if (truncatedLabelCount > 0) {
    return `${description}, and ${truncatedLabelCount} more;`
  }
  return `${description};`
}

export function Labels({items}: {items: Label[]}) {
  const [truncatedLabelCount, setTruncatedLabelCount] = useState(0)
  const lastVisibleLabelIndex = items.length - truncatedLabelCount - 1

  const labelRef = useRef<HTMLDivElement>(null)

  const recalculatedTruncatedLabelCount = useCallback(() => {
    if (labelRef?.current) {
      const childLabels = Array.from(labelRef.current.children) as HTMLDivElement[]
      const baseOffset = labelRef.current.offsetTop
      const breakIndex = childLabels.findIndex(item => item.offsetTop > baseOffset)
      setTruncatedLabelCount(breakIndex > 0 ? items.length - breakIndex : 0)
    }
  }, [items.length])

  useEffect(() => {
    // recalculate the truncated label count when the window is resized
    const curObserver = new ResizeObserver(() => {
      recalculatedTruncatedLabelCount()
    })

    if (labelRef?.current) {
      curObserver.observe(labelRef.current)
    }

    return () => {
      curObserver.disconnect()
    }
  }, [recalculatedTruncatedLabelCount])

  // using this to synchronize the rendering of the labels and the + badge
  useLayoutEffect(() => {
    recalculatedTruncatedLabelCount()
  }, [items.length, recalculatedTruncatedLabelCount])

  const labelsDescription = useMemo(() => {
    return getLabelsDescription(
      items.map(label => label.name),
      truncatedLabelCount,
    )
  }, [items, truncatedLabelCount])

  if (items.length === 0) {
    return null
  }

  return (
    <Box sx={{overflow: 'hidden'}}>
      <Box
        sx={{
          display: 'flex',
          flexShrink: 1,
          alignItems: 'flex-start',
          gap: 1,
          height: '100%',
          position: 'relative',
        }}
        role="group"
        aria-label={labelsDescription}
      >
        <Box
          sx={{
            display: 'flex',
            flexShrink: 1,
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            overflow: 'hidden',
            height: '100%',
            justifyContent: 'flex-end',
          }}
          ref={labelRef}
        >
          {items.map((label, index) => {
            const hidden = index > lastVisibleLabelIndex
            const {name, variant} = label
            return (
              <Link key={index} muted>
                <PrimerLabel variant={variant} className={clsx({'sr-only': hidden})}>
                  {name}
                </PrimerLabel>
              </Link>
            )
          })}
        </Box>
        {truncatedLabelCount > 0 && (
          <Tooltip align="right" direction="sw" text={items.map(label => label.name).join(', ')} sx={{display: 'flex'}}>
            <Token text={`+${truncatedLabelCount}`} />
          </Tooltip>
        )}
      </Box>
    </Box>
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
  return (
    <Avatar sx={{marginRight: 2, alignSelf: 'center'}} src="https://avatars.githubusercontent.com/u/92997159?v=4" />
  )
}

/******************
 * TITLE
 ******************/

export const generateTitle = (type: ListItemPrimaryAreaOption, id: number) => {
  return titles[type][id]
}

/******************
 * DESCRIPTION
 ******************/

const reviews = reviewStates.map(({icon, color, description}) => (
  <>
    <Octicon icon={icon} size={12} sx={{color}} />
    <Text sx={{color: 'fg.muted', fontWeight: 'normal', fontSize: 0}}>{description}</Text>
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
        <Box as="span" sx={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', gap: 1, ml: 1}}>
          {getRandomEntry(reviews)} &middot; {getRandomEntry(checkStatuses)}
        </Box>
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
 * ListItem.ActionBar
 ******************/

export const SampleListItemActionBar = () => (
  <ListItemActionBar
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
 * ListView.Metadata
 ******************/

const coloredCircle = (hexColor: string) => (
  <Box
    sx={{
      bg: hexColor,
      borderColor: hexColor,
      width: 14,
      height: 14,
      borderRadius: 10,
      borderWidth: '1px',
      borderStyle: 'solid',
    }}
  />
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
    () => allLabelItems.filter(item => item.text!.toLowerCase().includes(filter.toLowerCase())),
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
            <ActionList.LeadingVisual>
              <TagIcon />
            </ActionList.LeadingVisual>
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

export const SampleListViewMetadataWithActions = ({children, ...args}: ListViewMetadataProps) => {
  const [selectedLabels, setSelectedLabels] = useState([allLabelItems[2]!])
  const applyLabelsProps = useMemo(
    () => ({selectedItems: selectedLabels, setSelectedItems: setSelectedLabels}),
    [selectedLabels],
  )
  const {selectedCount} = useListViewSelection()
  return (
    <ListViewMetadata
      actionsLabel="Actions"
      actions={
        selectedCount < 1
          ? [
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
    </ListViewMetadata>
  )
}
