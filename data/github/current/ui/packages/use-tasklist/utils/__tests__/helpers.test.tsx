import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import type {PropsWithChildren} from 'react'
import {render, screen} from '@testing-library/react'

import {getTaskItemContent, isTaskListItem} from '../helpers'
import {MarkdownBodyWrapper, ListWithTasks, TaskItem} from '../../__tests__/wrappers'
import type {ListItem} from '@github-ui/markdown-editor/list-editing'

describe('getTaskItemContent', () => {
  test('returns the content of a task item containing an issue reference', () => {
    const IssueReference = ({children}: PropsWithChildren) => (
      <span className="reference">
        <svg aria-hidden="true" />
        <a className="issue-link js-issue-link" href="https://github.localhost/monalisa/smile/issues/123">
          {children}
          <span className="issue-shorthand">&nbsp;#123</span>
        </a>
      </span>
    )

    const {container} = render(
      <MarkdownBodyWrapper>
        <ListWithTasks>
          <TaskItem>
            <IssueReference>Issue title</IssueReference>
            <a href="/">test link</a>
          </TaskItem>
        </ListWithTasks>
      </MarkdownBodyWrapper>,
    )

    const result = getTaskItemContent(container)
    render(<SafeHTMLBox html={result.content as SafeHTMLString} />)

    expect(screen.getAllByText('Issue title').length).toBeTruthy()
    expect(screen.getAllByText('test link').length).toBeTruthy()
  })

  test('skips #comment nodes in task item content', () => {
    const {container} = render(
      <MarkdownBodyWrapper>
        <ListWithTasks>
          <TaskItem>
            <span>Visible text</span>
          </TaskItem>
        </ListWithTasks>
      </MarkdownBodyWrapper>,
    )

    // Add a comment node to the container, these should be skipped
    const commentNode = document.createComment('This is a comment')
    // eslint-disable-next-line testing-library/no-container
    container.appendChild(commentNode)

    const result = getTaskItemContent(container)
    render(<SafeHTMLBox html={result.content as SafeHTMLString} />)

    expect(screen.getAllByText('Visible text').length).toBeTruthy()
    expect(screen.queryByText('This is a comment')).toBeNull()
    expect(screen.queryByText('undefined')).toBeNull()
  })

  test('returns the content of a normal list item containing a link', () => {
    render(
      <li data-testid="normal-list-item">
        <p dir="auto">
          1.1 regular item with link <a href="/">test link</a> more text
        </p>
      </li>,
    )

    const result = getTaskItemContent(screen.getByTestId('normal-list-item'))

    // returns the outerhtml of the paragraph
    expect(result.content).toBe('<p dir="auto">1.1 regular item with link <a href="/">test link</a> more text</p>')
  })

  test('returns the content of a task list item containing a link', () => {
    render(
      <li className="task-list-item" data-testid="task-item">
        <p dir="auto">
          <input type="checkbox" id="" className="task-list-item-checkbox" />
          1.1 tasklist item with link <a href="/">test link</a> more text
        </p>
      </li>,
    )

    const result = getTaskItemContent(screen.getByTestId('task-item'))

    // returns the inner html of the paragraph
    expect(result.content).toBe(
      '<input type="checkbox" id="" class="task-list-item-checkbox">1.1 tasklist item with link <a href="/">test link</a> more text',
    )
  })
})

describe('isTaskListItem', () => {
  test('returns true for a task list item', () => {
    const tasklistItem: ListItem = {
      leadingWhitespace: '  ',
      middleWhitespace: '',
      text: 'Task 0',
      delimeter: '-',
      taskBox: '[ ]',
    }

    expect(isTaskListItem(tasklistItem)).toBeTruthy()
  })

  test('returns true for `- [ ]   item`', () => {
    const tasklistItem: ListItem = {
      leadingWhitespace: '  ',
      middleWhitespace: '',
      text: '   item',
      delimeter: '-',
      taskBox: '[ ]',
    }

    expect(isTaskListItem(tasklistItem)).toBeTruthy()
  })

  test('returns false for non-tasklist item', () => {
    const tasklistItem: ListItem = {
      leadingWhitespace: '  ',
      middleWhitespace: '',
      text: 'Item',
      delimeter: '-',
      taskBox: null,
    }

    expect(isTaskListItem(tasklistItem)).toBeFalsy()
  })

  test('returns false for `- [ ]   `', () => {
    const tasklistItem: ListItem = {
      leadingWhitespace: '  ',
      middleWhitespace: '',
      text: '   ',
      delimeter: '-',
      taskBox: '[ ]',
    }

    expect(isTaskListItem(tasklistItem)).toBeFalsy()
  })
})
