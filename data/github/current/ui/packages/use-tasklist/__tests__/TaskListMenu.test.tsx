import {TaskListMenu} from '../components/TaskListMenu'
import {fireEvent, screen} from '@testing-library/react'
import {noop} from '@github-ui/noop'
import {DragAndDrop} from '@github-ui/drag-and-drop'
import {render} from '@github-ui/react-core/test-utils'
// eslint-disable-next-line unused-imports/no-unused-imports
import React from 'react'
import {createItem} from '../test-utils/helpers'
import type {TaskItem} from '../constants/types'

const items = [0, 1, 2].map(item => createItem(item, item))

describe('TaskListMenu', () => {
  const item = items[0] as TaskItem
  it('renders correctly', () => {
    render(<TaskListMenuWrapper item={item} />)
    expect(screen.getByLabelText('Open item 1 task options')).toBeInTheDocument()
  })

  it('opens the menu correctly', () => {
    render(<TaskListMenuWrapper item={item} onConvertToIssue={noop} />)

    const menuButton = screen.getByLabelText('Open item 1 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    expect(screen.getByLabelText('Move up')).toBeInTheDocument()
    expect(screen.getByLabelText('Move down')).toBeInTheDocument()
    expect(screen.getByLabelText('Convert to issue')).toBeInTheDocument()
  })

  it('can move first element down but not up', () => {
    render(<TaskListMenuWrapper item={item} />)

    const menuButton = screen.getByLabelText('Open item 1 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    const moveUpButton = screen.getByLabelText('Move up')
    expect(moveUpButton).toBeInTheDocument()
    expect(moveUpButton).toHaveAttribute('aria-disabled', 'true')

    const moveDownButton = screen.getByLabelText('Move down')
    expect(moveDownButton).toBeInTheDocument()
    expect(moveDownButton).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('can move middle element up and down', () => {
    render(<TaskListMenuWrapper item={items[1] as TaskItem} />)

    const menuButton = screen.getByLabelText('Open item 2 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    const moveUpButton = screen.getByLabelText('Move up')
    expect(moveUpButton).toBeInTheDocument()
    expect(moveUpButton).not.toHaveAttribute('aria-disabled', 'true')

    const moveDownButton = screen.getByLabelText('Move down')
    expect(moveDownButton).toBeInTheDocument()
    expect(moveDownButton).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('can move last element up but not down', () => {
    render(<TaskListMenuWrapper item={items[2] as TaskItem} />)

    const menuButton = screen.getByLabelText('Open item 3 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    const moveUpButton = screen.getByLabelText('Move up')
    expect(moveUpButton).toBeInTheDocument()
    expect(moveUpButton).not.toHaveAttribute('aria-disabled', 'true')

    const moveDownButton = screen.getByLabelText('Move down')
    expect(moveDownButton).toBeInTheDocument()
    expect(moveDownButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('can convert an item to an issue if there is an onConvertToIssue function provided', () => {
    render(<TaskListMenuWrapper item={item} onConvertToIssue={noop} />)

    const menuButton = screen.getByLabelText('Open item 1 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    const convertToIssueButton = screen.getByLabelText('Convert to issue')
    expect(convertToIssueButton).toBeInTheDocument()
  })

  it('cannot convert an item to an issue if there is no onConvertToIssue function provided', () => {
    render(<TaskListMenuWrapper item={item} />)

    const menuButton = screen.getByLabelText('Open item 1 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    expect(screen.queryByLabelText('Convert to issue')).not.toBeInTheDocument()
  })

  it('cannot convert an item to an issue if it is an existing issue', () => {
    render(<TaskListMenuWrapper item={item} onConvertToIssue={noop} isIssue={true} />)

    const menuButton = screen.getByLabelText('Open item 1 task options')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)

    expect(screen.queryByLabelText('Convert to issue')).not.toBeInTheDocument()
  })
})

const TaskListMenuWrapper = ({
  item,
  onConvertToIssue,
  isIssue = false,
}: {
  item: TaskItem
  onConvertToIssue?: (task: TaskItem, setIsConverting: (converting: boolean) => void) => void
  isIssue?: boolean
}) => {
  return (
    <DragAndDrop items={[]} onDrop={noop} renderOverlay={() => <></>}>
      <DragAndDrop.Item id={item.id} title={item.title} index={item.index}>
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
