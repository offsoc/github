import {
  CopyIcon,
  IssueClosedIcon,
  PasteIcon,
  PencilIcon,
  RowsIcon,
  TagIcon,
  ThreeBarsIcon,
  TrashIcon,
  TriangleDownIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, IconButton, SegmentedControl, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {Meta} from '@storybook/react'
import {type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState} from 'react'

import type {ActionBarProps} from '../ActionBar'
import {ActionBar} from '../ActionBar'
import {useActionBarResize} from '../ActionBarResizeContext'

type StoryArgs = {containerWidth?: number; includeNonCollapsibleContent: boolean} & ActionBarProps

const meta: Meta<StoryArgs> = {
  title: 'Recipes/ActionBar',
  component: ActionBar,
  parameters: {controls: {sort: 'none'}},
  args: {
    containerWidth: 400,
    density: 'normal',
    label: 'Sample controls',
    includeNonCollapsibleContent: true,
  },
  argTypes: {
    containerWidth: {
      control: {type: 'number', step: 25, min: 0},
      description: 'The width in pixels of the container for the action bar, to easily see the overflow menu behavior.',
    },
    density: {
      control: 'radio',
      options: ['none', 'condensed', 'normal', 'spacious'],
    },
    includeNonCollapsibleContent: {
      description: "Whether content that won't fall into the overflow menu should be included in the example.",
    },
  },
}

export default meta

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

const allLabelItems: ItemInput[] = [
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

const SampleSelectPanel = ({nested = false, selectedItems, setSelectedItems, actionKey}: SampleSelectPanelProps) => {
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
      renderAnchor={props =>
        nested ? (
          <ActionList.Item leadingVisual={TagIcon} {...props} role="menuitem">
            Set label…
          </ActionList.Item>
        ) : (
          <div ref={toggleButtonContainerRef}>
            <Button
              leadingVisual={TagIcon}
              trailingAction={TriangleDownIcon}
              {...props}
              aria-labelledby={` ${props['aria-labelledby']}`}
            >
              {props.children || 'Set label'}
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

const onEditClick = () => alert('Selected Edit action')
const onDeleteClick = () => alert('Selected Delete action')
const onCopyClick = () => alert('Selected Copy action')
const onPasteClick = () => alert('Selected Paste action')

const sampleMarkAsItems = (
  <>
    <ActionList.Item role="menuitemradio">Foo</ActionList.Item>
    <ActionList.Item role="menuitemradio">Bar</ActionList.Item>
    <ActionList.Item role="menuitemradio">Baz</ActionList.Item>
  </>
)

const SampleActionBar = ({containerWidth, density, includeNonCollapsibleContent}: StoryArgs) => {
  const [selectedLabels, setSelectedLabels] = useState([allLabelItems[2]!])
  const applyLabelsProps = useMemo(
    () => ({selectedItems: selectedLabels, setSelectedItems: setSelectedLabels}),
    [selectedLabels],
  )
  return (
    <Box
      sx={useMemo(
        () => ({
          border: '3px dashed',
          borderColor: 'border.subtle',
          borderRadius: 1,
          width: typeof containerWidth === 'number' ? `${containerWidth}px` : 'auto',
          p: '2px',
        }),
        [containerWidth],
      )}
    >
      <ActionBar
        label="Sample controls"
        density={density}
        actions={[
          {
            key: 'edit',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <ActionList.Item onSelect={onEditClick}>
                  <ActionList.LeadingVisual>
                    <PencilIcon />
                  </ActionList.LeadingVisual>
                  Edit
                </ActionList.Item>
              ) : (
                <Button onClick={onEditClick} leadingVisual={PencilIcon}>
                  Edit
                </Button>
              )
            },
          },
          {
            key: 'mark-as',
            render: isOverflowMenu => (
              <ActionMenu>
                {isOverflowMenu ? (
                  <ActionMenu.Anchor>
                    <ActionList.Item>Mark as…</ActionList.Item>
                  </ActionMenu.Anchor>
                ) : (
                  <ActionMenu.Button leadingVisual={IssueClosedIcon}>Mark as…</ActionMenu.Button>
                )}
                <ActionMenu.Overlay>
                  <ActionList>{sampleMarkAsItems}</ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            ),
          },
          {
            key: 'apply-labels',
            render: isOverflowMenu => (
              <SampleSelectPanel actionKey="apply-labels" nested={isOverflowMenu} {...applyLabelsProps} />
            ),
          },
          {
            key: 'delete',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <ActionList.Item variant="danger" onSelect={onDeleteClick}>
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  Delete
                </ActionList.Item>
              ) : (
                <Button variant="danger" onClick={onDeleteClick} leadingVisual={TrashIcon}>
                  Delete
                </Button>
              )
            },
          },
          {
            key: 'copy',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <ActionList.Item onSelect={onCopyClick}>
                  <ActionList.LeadingVisual>
                    <CopyIcon />
                  </ActionList.LeadingVisual>
                  Copy
                </ActionList.Item>
              ) : (
                <IconButton aria-label="Copy" variant="invisible" onClick={onCopyClick} icon={CopyIcon} />
              )
            },
          },
          {
            key: 'paste',
            render: isOverflowMenu => {
              return isOverflowMenu ? (
                <ActionList.Item onSelect={onPasteClick}>
                  <ActionList.LeadingVisual>
                    <PasteIcon />
                  </ActionList.LeadingVisual>
                  Paste
                </ActionList.Item>
              ) : (
                <IconButton aria-label="Paste" variant="invisible" onClick={onPasteClick} icon={PasteIcon} />
              )
            },
          },
        ]}
      >
        {includeNonCollapsibleContent && (
          <SegmentedControl aria-label="Display density">
            <SegmentedControl.IconButton aria-label="Comfortable" selected icon={RowsIcon} />
            <SegmentedControl.IconButton aria-label="Compact" icon={ThreeBarsIcon} />
          </SegmentedControl>
        )}
      </ActionBar>
    </Box>
  )
}

export const ActionBarToolbarVariant = {
  render: (args: StoryArgs) => <SampleActionBar {...args} />,
}
