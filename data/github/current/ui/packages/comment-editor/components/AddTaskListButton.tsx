import {ChecklistIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {MarkdownEditor} from '@github-ui/markdown-editor'
import {flushSync} from 'react-dom'

const DEFAULT_TASKLIST_CONTENT = '- [ ] Add a draft title or issue reference here'

const getHierarchyShell = (content: string): string => {
  return `\`\`\`[tasklist]\n### Tasks\n${content}\n\`\`\``
}

export const AddTasklistButton = ({
  editedBody,
  onChangeBody,
}: {
  editedBody: string
  onChangeBody: (next: string) => void
}) => {
  const onAddHierarchyShell = () => {
    let content = DEFAULT_TASKLIST_CONTENT
    const activeElement = document.activeElement

    // If the user is not interacting with the textarea, just append the tasklist block to the end.
    if (!activeElement || !(activeElement instanceof HTMLTextAreaElement)) {
      const tasklistBlock = getHierarchyShell(content)
      onChangeBody(`${editedBody ? `${editedBody}\n` : ''}${tasklistBlock}`)
      return
    }

    const cursorStart = activeElement.selectionStart || 0
    const cursorEnd = activeElement.selectionEnd || 0
    if (cursorStart !== cursorEnd) {
      content = editedBody.slice(cursorStart, cursorEnd)
    }
    const bodyStart = editedBody && cursorStart ? `${editedBody.slice(0, cursorStart)}\n` : ''
    const bodyEnd = editedBody ? `\n${editedBody.slice(cursorEnd)}` : ''
    const tasklistBlock = getHierarchyShell(content)
    flushSync(() => {
      onChangeBody(`${bodyStart}${tasklistBlock}${bodyEnd}`)
    })

    const moveCursorTo = cursorStart + tasklistBlock.length + 1
    activeElement.selectionStart = moveCursorTo
    activeElement.selectionEnd = moveCursorTo
  }

  return (
    <Box sx={{position: 'relative'}}>
      <MarkdownEditor.ToolbarButton icon={ChecklistIcon} aria-label="Add a tasklist" onClick={onAddHierarchyShell} />
    </Box>
  )
}
