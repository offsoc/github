import {DragAndDrop} from '@github-ui/drag-and-drop'
import {TaskListItem, type TaskListItemProps} from '../TaskListItem'
import type {Meta} from '@storybook/react'
import {noop} from '@github-ui/noop'

const item = {
  title: 'title',
  id: '0',
  index: 0,
  children: [],
  nested: false,
  content: 'task list item',
  checked: false,
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  container: document.createElement('li'),
  markdownIndex: 0,
}

const defaultArgs: Partial<TaskListItemProps> = {
  markdownValue: '- [ ] task list item',
  onChange: () => {},
  onConvertToIssue: () => {},
  nested: false,
  position: 1,
  item,
  totalItems: 3,
  disabled: false,
}

const TaskListItemWrapper = (args: TaskListItemProps) => {
  return (
    <DragAndDrop items={[item]} onDrop={noop} renderOverlay={() => <></>} style={{listStyle: 'none'}}>
      <DragAndDrop.Item id={item.id} title={item.title} index={0}>
        <TaskListItem {...args} />
      </DragAndDrop.Item>
    </DragAndDrop>
  )
}

const meta = {
  title: 'TaskListItem',
  component: TaskListItem,
} satisfies Meta<typeof TaskListItem>

export default meta

export const TaskListItemDefault = {
  args: {
    ...defaultArgs,
  },
  render: TaskListItemWrapper,
}

export const TaskListItemWithEmbeddedLink = {
  args: {
    ...defaultArgs,
    markdownValue: '- [ ] tasklist item with [test link](/) more text',
    item: {...item, content: 'tasklist item with <a href="/">test link</a> more text'},
  },
  render: TaskListItemWrapper,
}
