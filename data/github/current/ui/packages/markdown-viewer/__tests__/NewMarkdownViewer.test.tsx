import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {NewMarkdownViewer} from '../NewMarkdownViewer'
import type {SafeHTMLString} from '@github-ui/safe-html'

const taskListHtml = `
<p>text before list</p>
<ul class='contains-task-list'>
  <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 1</li>
  <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 2</li>
</ul>
<p>text after list</p>` as SafeHTMLString

const noItemsCheckedMarkdown = `
text before list

- [ ] item 1
- [ ] item 2

text after list`

const firstItemCheckedMarkdown = `
text before list

- [x] item 1
- [ ] item 2

text after list`

describe('NewMarkdownViewer', () => {
  describe('checklists', () => {
    it('initializes tasklists', () => {
      render(<NewMarkdownViewer verifiedHTML={taskListHtml} onChange={jest.fn()} markdownValue="" />)
      const items = screen.getAllByRole('checkbox')
      expect(items).toHaveLength(2)
    })

    it('initializes tasklists even when nested in other tags', () => {
      const nestedTasklistHtml = `
<p>text before list</p>
<details>
  <ul class='contains-task-list'>
    <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 1</li>
    <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 2</li>
  </ul>
</details>
<p>text after list</p>` as SafeHTMLString

      render(<NewMarkdownViewer verifiedHTML={nestedTasklistHtml} onChange={jest.fn()} markdownValue="" />)
      const items = screen.getAllByRole('checkbox')
      expect(items).toHaveLength(2)
    })

    it('enables checklist by default', () => {
      render(<NewMarkdownViewer verifiedHTML={taskListHtml} onChange={jest.fn()} markdownValue="" />)
      const items = screen.getAllByRole('checkbox')
      for (const item of items) expect(item).not.toBeDisabled()
    })

    it('calls `onChange` with the updated Markdown when a task is checked', async () => {
      const onChangeMock = jest.fn()

      render(
        <NewMarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={noItemsCheckedMarkdown}
          onChange={onChangeMock}
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.click(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(firstItemCheckedMarkdown))
    })

    it('calls `onChange` with the updated Markdown when a task is unchecked', async () => {
      const onChangeMock = jest.fn()
      render(
        <NewMarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={firstItemCheckedMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.click(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(noItemsCheckedMarkdown))
    })
  })
})
