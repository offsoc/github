import {fireEvent, waitFor, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import React from 'react'
import type {SafeHTMLString} from '@github-ui/safe-html'

import {MarkdownViewer} from '../MarkdownViewer'

describe('MarkdownViewer', () => {
  describe('task list interaction', () => {
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
    const nestedTaskListHtml = `
<p>text before list</p>

<ul class='contains-task-list'>
  <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 1</li>
  // first level of nesting
  <ul class='contains-task-list'>
    <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 2</li>
    // second level of nesting
    <ul class='contains-task-list'>
      <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 3</li>
    </ul>
    <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 4</li>
  </ul>
</ul>

<p>text after list</p>` as SafeHTMLString
    const nestedItemsMarkdown = `
text before list
- [ ] test1
    - [ ] test2
        - [ ] test3
    - [ ] test4
text after list`
    const firstItemCheckedNestedItemsMarkdown = `
text before list
- [x] test1
    - [ ] test2
        - [ ] test3
    - [ ] test4
text after list`
    const firstLevelNestingItemCheckedNestedItemsMarkdown = `
text before list
- [ ] test1
    - [x] test2
        - [ ] test3
    - [ ] test4
text after list`
    const secondLevelNestingItemCheckedNestedItemsMarkdown = `
text before list
- [ ] test1
    - [ ] test2
        - [x] test3
    - [ ] test4
text after list`

    const noItemsCheckedWithSpecialNewLineMarkdown = `\ntext before list\r\n\r\n- [ ] item 1\n- [ ] item 2\r\n\r\ntext after list`
    const hierarchyBeforeTaskListNoItemsChecked = `
text before list

\`\`\`[tasklist]
- [ ] item A
- [ ] item B
\`\`\`

- [ ] item 1
- [ ] item 2

text after list`
    const hierarchyBeforeTaskListOneItemChecked = `
text before list

\`\`\`[tasklist]
- [ ] item A
- [ ] item B
\`\`\`

- [x] item 1
- [ ] item 2

text after list`
    const hierarchyBeforeTaskListNoItemsCheckedTildes = `
text before list

~~~[tasklist]
- [ ] item A
- [ ] item B
\`\`\`
~~~~~~

- [ ] item 1
- [ ] item 2

text after list`
    const hierarchyBeforeTaskListOneItemCheckedTildes = `
text before list

~~~[tasklist]
- [ ] item A
- [ ] item B
\`\`\`
~~~~~~

- [x] item 1
- [ ] item 2

text after list`

    it('enables checklists by default', () => {
      render(<MarkdownViewer verifiedHTML={taskListHtml} markdownValue={noItemsCheckedMarkdown} onChange={jest.fn()} />)
      const items = screen.getAllByRole('checkbox')
      for (const item of items) expect(item).not.toBeDisabled()
    })

    it('does not enable checklists if task interaction is disabled', () => {
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={noItemsCheckedMarkdown}
          onChange={jest.fn()}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      for (const item of items) expect(item).toBeDisabled()
    })

    it('does not enable checklists if no onChange handler is provided', () => {
      render(<MarkdownViewer verifiedHTML={taskListHtml} />)
      const items = screen.getAllByRole('checkbox')
      for (const item of items) expect(item).toBeDisabled()
    })

    it('calls `onChange` with the updated Markdown when a task is checked', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={noItemsCheckedMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(firstItemCheckedMarkdown))
    })

    it('calls `onChange` with the updated Markdown when a task is checked in a text with different new line chars', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={noItemsCheckedWithSpecialNewLineMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(firstItemCheckedMarkdown))
    })

    it('calls `onChange` with the updated Markdown when a task is checked and hierarchy is present', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={hierarchyBeforeTaskListNoItemsChecked}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(hierarchyBeforeTaskListOneItemChecked))
    })

    it('calls `onChange` with the updated Markdown when a task is checked and hierarchy is present with tildes', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={hierarchyBeforeTaskListNoItemsCheckedTildes}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(hierarchyBeforeTaskListOneItemCheckedTildes))
    })

    it('calls `onChange` with the updated Markdown when a task is unchecked', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={taskListHtml}
          markdownValue={firstItemCheckedMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(noItemsCheckedMarkdown))
    })

    it('attaches event handlers to new tasks', async () => {
      const onChangeMock = jest.fn()
      const TestComponent = () => {
        const [html, setHtml] = React.useState(taskListHtml)
        const [markdown, setMarkdown] = React.useState(noItemsCheckedMarkdown)
        return (
          <>
            <button
              onClick={() => {
                setMarkdown(`${markdown}
- [ ] item 3
`)
                setHtml(
                  `${html}
<ul class='contains-task-list'>
  <li class='task-list-item'><input type='checkbox' class='task-list-item-checkbox' disabled/> item 3</li>
</ul>
` as SafeHTMLString,
                )
              }}
            >
              Add markdown
            </button>
            <MarkdownViewer verifiedHTML={html} markdownValue={markdown} onChange={onChangeMock} />
          </>
        )
      }
      render(<TestComponent />)

      // Change markdown and html content
      const button = screen.getByRole('button', {name: 'Add markdown'})
      fireEvent.click(button)

      const items = screen.getAllByRole('checkbox')
      if (items[2]) fireEvent.change(items[2])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(`${noItemsCheckedMarkdown}\n- [x] item 3\n`))
    })

    it('checking works with nested checkboxes (when a high-level checkbox is checked)', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={nestedTaskListHtml}
          markdownValue={nestedItemsMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[0]) fireEvent.change(items[0])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(firstItemCheckedNestedItemsMarkdown))
      // make sure all the other boxes are unchanged, precaution when fixing https://github.com/github/issues/issues/10100
      // Removing the first item from the list as it is checked and we expect all the others to be unchecked
      items.shift()
      for (const item of items as HTMLInputElement[]) {
        expect(item.checked).toBe(false)
      }
    })

    it('checking works with nested checkboxes (when first-level nested checkbox is checked)', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={nestedTaskListHtml}
          markdownValue={nestedItemsMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')

      if (items[1]) fireEvent.change(items[1])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(firstLevelNestingItemCheckedNestedItemsMarkdown))
      // make sure all the other boxes are unchanged, precaution when fixing https://github.com/github/issues/issues/10100
      // Removing the second item from the list as it is checked and we expect all the others to be unchecked
      items.splice(1, 1)
      for (const item of items as HTMLInputElement[]) {
        expect(item.checked).toBe(false)
      }
    })

    it('checking works with nested checkboxes (when second-level nested checkbox is checked)', async () => {
      const onChangeMock = jest.fn()
      render(
        <MarkdownViewer
          verifiedHTML={nestedTaskListHtml}
          markdownValue={nestedItemsMarkdown}
          onChange={onChangeMock}
          disabled
        />,
      )
      const items = screen.getAllByRole('checkbox')
      if (items[2]) fireEvent.change(items[2])
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(secondLevelNestingItemCheckedNestedItemsMarkdown))
      // make sure all the other boxes are unchanged, precaution when fixing https://github.com/github/issues/issues/10100
      // Removing the third item from the list as it is checked and we expect all the others to be unchecked
      items.splice(2, 1)
      for (const item of items as HTMLInputElement[]) {
        expect(item.checked).toBe(false)
      }
    })
  })

  describe('link interception', () => {
    it('makes all links open in a new tab when enabled', async () => {
      const windowOpenSpy = jest.spyOn(window, 'open')
      windowOpenSpy.mockImplementation(jest.fn())

      const {user} = render(
        <MarkdownViewer verifiedHTML={'<a href="https://example.com">link</a>' as SafeHTMLString} openLinksInNewTab />,
      )
      const link = screen.getByRole('link')
      await user.click(link)
      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener noreferrer')
    })

    it('calls onLinkClick on link click', async () => {
      const onLinkClick = jest.fn()
      const {user} = render(
        <MarkdownViewer
          verifiedHTML={'<a href="https://example.com">link</a>' as SafeHTMLString}
          onLinkClick={onLinkClick}
        />,
      )
      const link = screen.getByRole('link')
      await user.click(link)

      expect(onLinkClick).toHaveBeenCalled()
    })
  })
})
