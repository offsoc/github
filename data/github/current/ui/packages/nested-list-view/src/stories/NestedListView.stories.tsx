import type {OnDropArgs} from '@github-ui/drag-and-drop'
import {dragEnd, dragMove, dragStart} from '@github-ui/drag-and-drop/test-utils'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {expect} from '@storybook/jest'
import type {Meta, StoryObj} from '@storybook/react'
import {userEvent, within} from '@storybook/test'
import {useCallback, useMemo, useState} from 'react'

import {HeaderTags} from '../constants'
import {NestedListItemLeadingContent} from '../NestedListItem/LeadingContent'
import {NestedListItemLeadingVisual} from '../NestedListItem/LeadingVisual'
import {NestedListItem} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListView, type NestedListViewProps} from '../NestedListView'
import {NestedListViewHeaderSectionFilterLink} from '../NestedListViewHeader/SectionFilterLink'
import {generateStatusIcon, generateSubItems, generateTitle, SampleListViewHeaderWithActions} from './helpers'
import styles from './stories.module.css'

const meta: Meta<NestedListViewProps> = {
  title: 'Recipes/NestedListView',
  component: NestedListView,
  parameters: {},
  args: {
    title: 'List of items',
    titleHeaderTag: 'h2',
    isSelectable: true,
    totalCount: 100,
    isCollapsible: false,
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
  decorators: [
    Story => (
      <div className={styles.outline}>
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Example = {
  render: (args: NestedListViewProps) => {
    const itemsToRender = [0, 1, 2, 3, 4]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set<string>())

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onSelect = useCallback(
      (id: string, selected: boolean) => {
        if (selected) {
          if (args.isSelectable && !checkedItems.has(id)) {
            setCheckedItems(new Set<string>(checkedItems.add(id)))
          }
        } else {
          checkedItems.delete(id)
          setCheckedItems(new Set<string>(checkedItems))
        }
      },
      [checkedItems, setCheckedItems, args.isSelectable],
    )

    const onToggleSelectAll = (isSelectAllChecked: boolean) => {
      if (isSelectAllChecked) {
        setCheckedItems(new Set<string>(itemsToRender.map(i => i.toString())))
      } else {
        setCheckedItems(new Set())
      }
    }

    return (
      <NestedListView
        {...args}
        header={
          <SampleListViewHeaderWithActions
            onToggleSelectAll={onToggleSelectAll}
            sectionFilters={
              checkedItems.size > 0
                ? []
                : [
                    <NestedListViewHeaderSectionFilterLink key={0} title="Opened" count={999} href="#" isSelected />,
                    <NestedListViewHeaderSectionFilterLink key={1} title="Closed" count={999} href="#" />,
                  ]
            }
          />
        }
      >
        {itemsToRender.map((id, index) => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem
              key={index}
              title={<NestedListItemTitle value={title} />}
              subItems={generateSubItems()}
              onSelect={i => onSelect(id.toString(), i)}
              isSelected={checkedItems.has(id.toString())}
            >
              <NestedListItemLeadingContent>
                <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
              </NestedListItemLeadingContent>
            </NestedListItem>
          )
        })}
      </NestedListView>
    )
  },
}

const renderBaseNestedListView = (args: NestedListViewProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [items, setItems] = useState([
    {id: '1', title: 'Hello World', subItems: generateSubItems()},
    {id: '2', title: 'This is drag and drop', subItems: generateSubItems()},
    {id: '3', title: 'Woohoo', subItems: generateSubItems()},
    {
      id: '4',
      title:
        'This is a really really really really really really really really really really really really really really long title',
      subItems: generateSubItems(),
    },
    {id: '5', title: 'Test drag and drop with nested list view', subItems: generateSubItems()},
  ])

  const onDrop = ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => {
    if (dragMetadata.id === dropMetadata?.id) {
      return
    }
    const dragItem = items.find(item => item.id === dragMetadata.id)
    if (dragItem) {
      setItems(
        items.reduce(
          (newItems, item) => {
            if (dragItem.id === item.id) {
              return newItems
            }
            if (item.id !== dropMetadata?.id) {
              newItems.push(item)
            } else if (isBefore) {
              newItems.push(dragItem, item)
            } else {
              newItems.push(item, dragItem)
            }
            return newItems
          },
          [] as typeof items,
        ),
      )
    }
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set<string>())

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onSelect = useCallback(
    (id: string, selected: boolean) => {
      if (selected) {
        if (args.isSelectable && !checkedItems.has(id)) {
          setCheckedItems(new Set<string>(checkedItems.add(id)))
        }
      } else {
        checkedItems.delete(id)
        setCheckedItems(new Set<string>(checkedItems))
      }
    },
    [checkedItems, setCheckedItems, args.isSelectable],
  )

  const onToggleSelectAll = (isSelectAllChecked: boolean) => {
    if (isSelectAllChecked) {
      setCheckedItems(new Set<string>(items.map(item => item.id)))
    } else {
      setCheckedItems(new Set())
    }
  }

  return (
    <NestedListView
      {...args}
      header={
        <SampleListViewHeaderWithActions
          onToggleSelectAll={onToggleSelectAll}
          sectionFilters={
            checkedItems.size > 0
              ? []
              : [
                  <NestedListViewHeaderSectionFilterLink key={0} title="Opened" count={999} href="#" isSelected />,
                  <NestedListViewHeaderSectionFilterLink key={1} title="Closed" count={999} href="#" />,
                ]
          }
        />
      }
      dragAndDropProps={{
        renderOverlay: ({title, id}) => {
          return (
            <NestedListView title={'overlay'}>
              <NestedListItem
                key={id}
                title={<NestedListItemTitle value={title} />}
                isSelected={checkedItems.has(id)}
                dragAndDropProps={{
                  isOverlay: true,
                  showTrigger: true,
                  itemId: id,
                }}
              >
                <NestedListItemLeadingContent>
                  <NestedListItemLeadingVisual icon={IssueOpenedIcon} color="success.fg" description="Open Issue" />
                </NestedListItemLeadingContent>
              </NestedListItem>
            </NestedListView>
          )
        },
        onDrop,
        items: items.map(item => ({
          id: item.id,
          title: item.title,
        })),
      }}
    >
      {items.map(item => {
        return (
          <NestedListItem
            key={item.id}
            title={<NestedListItemTitle value={item.title} />}
            subItems={item.subItems}
            onSelect={i => onSelect(item.id, i)}
            isSelected={checkedItems.has(item.id)}
            dragAndDropProps={{showTrigger: true, itemId: item.id}}
          >
            <NestedListItemLeadingContent>
              <NestedListItemLeadingVisual icon={IssueOpenedIcon} color="success.fg" description="Open Issue" />
            </NestedListItemLeadingContent>
          </NestedListItem>
        )
      })}
    </NestedListView>
  )
}

export const DragAndDropKeyboard: StoryObj<typeof NestedListView> = {
  render: renderBaseNestedListView,
  play: async ({context}) => {
    const {canvasElement, step} = context
    const canvas = within(canvasElement)

    await step('dismiss keyboard specific instructions modal', async () => {
      const itemsLocator = canvas.getAllByTestId('sortable-item')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag

      const keyboardSpecificInstructionsModal = canvas.queryByRole('dialog', {name: 'How to move objects via keyboard'})
      if (keyboardSpecificInstructionsModal) {
        const hideCheckbox = within(keyboardSpecificInstructionsModal).getByRole('checkbox')
        await userEvent.click(hideCheckbox)

        await userEvent.keyboard('{Tab}') // focus close button
        await userEvent.keyboard(' ') // close modal
      }
      await userEvent.keyboard('{Escape}') // end drag
    })

    await step('should drag and drop item when pressing the space key', async () => {
      let itemsLocator = canvas.getAllByTestId('sortable-item')
      await expect(itemsLocator[0]).toHaveTextContent('Hello World')
      await expect(itemsLocator[1]).toHaveTextContent('This is drag and drop')
      await expect(itemsLocator[2]).toHaveTextContent('Woohoo')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag
      await userEvent.keyboard('{ArrowDown}') // move item one down
      await userEvent.keyboard(' ') // end drag drag

      itemsLocator = canvas.getAllByTestId('sortable-item')
      await expect(itemsLocator[0]).toHaveTextContent('This is drag and drop')
      await expect(itemsLocator[1]).toHaveTextContent('Hello World')
      await expect(itemsLocator[2]).toHaveTextContent('Woohoo')
    })

    await step('should cancel drag and revert to original state when pressing escape', async () => {
      let itemsLocator = canvas.getAllByTestId('sortable-item')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag
      await userEvent.keyboard('{ArrowDown}') // move item one down
      await userEvent.keyboard('{Escape}') // end drag drag

      itemsLocator = canvas.getAllByTestId('sortable-item')
      await expect(itemsLocator[0]).toHaveTextContent('This is drag and drop')
      await expect(itemsLocator[1]).toHaveTextContent('Hello World')
      await expect(itemsLocator[2]).toHaveTextContent('Woohoo')
    })
  },
}

export const DragAndDropMouse: StoryObj<typeof NestedListView> = {
  render: renderBaseNestedListView,
  play: async ({context}) => {
    const {canvasElement, step} = context
    const canvas = within(canvasElement)

    await step('should drag and drop item with mouse', async () => {
      let itemsLocator = canvas.getAllByTestId('sortable-item')

      const firstTrigger = within(itemsLocator[0]!).getByTestId('sortable-mouse-trigger')
      // const secondTrigger = within(itemsLocator[1]!).getByTestId('sortable-mouse-trigger')
      const {currentPosition, mouseStep} = await dragStart({element: firstTrigger, delta: {x: 0, y: 40}})
      const moveCurrentPosition = await dragMove(firstTrigger, currentPosition, mouseStep)
      await dragEnd(firstTrigger, moveCurrentPosition)

      itemsLocator = canvas.getAllByTestId('sortable-item')
      await expect(itemsLocator[0]).toHaveTextContent('This is drag and drop')
      await expect(itemsLocator[1]).toHaveTextContent('Hello World')
      await expect(itemsLocator[2]).toHaveTextContent('Woohoo')
    })
  },
}
