import type {Meta} from '@storybook/react'
import {TaskListMenu, type TaskListMenuProps} from '../TaskListMenu'
import {noop} from '@github-ui/noop'
import {DragAndDrop} from '@github-ui/drag-and-drop'
import type {TaskItem} from '../../constants/types'

const meta = {
  title: 'TaskListMenu',
  component: TaskListMenu,
} satisfies Meta<typeof TaskListMenu>

export default meta

const defaultArgs: Partial<TaskListMenuProps> = {
  totalItems: 3,
  item: {
    title: 'title',
    position: [0, 1],
    id: '1',
    index: 0,
    children: [],
    nested: false,
    content: 'content',
    checked: false,
    // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
    container: document.createElement('li'),
    markdownIndex: 0,
  },
  onConvertToIssue: noop,
  disabled: false,
}

export const TaskListMenuOnFirstItem = {
  args: {
    ...defaultArgs,
  },
  render: (args: TaskListMenuProps) => <TaskListMenuWrapper {...args} />,
}

export const TaskListMenuOnMiddleItem = {
  args: {
    ...defaultArgs,
    item: {...defaultArgs.item, index: 1},
  },
  render: (args: TaskListMenuProps) => <TaskListMenuWrapper {...args} />,
}

export const TaskListMenuOnLastItem = {
  args: {
    ...defaultArgs,
    item: {...defaultArgs.item, index: 2},
  },
  render: (args: TaskListMenuProps) => <TaskListMenuWrapper {...args} />,
}

const TaskListMenuWrapper = ({
  item,
  onConvertToIssue,
  isIssue = false,
}: {
  item: TaskItem
  onConvertToIssue?: (task: TaskItem, setIsConverting: (converting: boolean) => void) => void
  isIssue: boolean
}) => {
  return (
    <DragAndDrop items={[item]} onDrop={noop} renderOverlay={() => <></>} style={{listStyle: 'none'}}>
      <DragAndDrop.Item id="0" title={item.title} index={0}>
        <TaskListMenu
          totalItems={3}
          item={item}
          isIssue={isIssue}
          setIsConverting={noop}
          onConvertToIssue={onConvertToIssue}
        />
      </DragAndDrop.Item>
    </DragAndDrop>
  )
}
