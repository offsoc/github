import {hasCustomTitle, validateContent} from '@github-ui/tasklist-validation'
import {testIdProps} from '@github-ui/test-id-props'
import {ChecklistIcon, PlusIcon} from '@primer/octicons-react'
import {Box, Button, IconButton, Spinner} from '@primer/react'
import {flushSync} from 'react-dom'

const DEFAULT_TASKLIST_CONTENT = '- [ ] Add a draft title or issue reference here'

const getHierarchyShell = (content: string, addTitle = true): string => {
  const title = addTitle ? `### Tasks` : ''
  const newLine = content ? '\n' : ''
  return `\`\`\`[tasklist]\n${title}${newLine}${content}\n\`\`\``
}

export const AddTasklistButton: React.FC<{
  editedBody: string
  onChangeBody: (next: string) => void
  isTextButton?: boolean
  loading?: boolean
  tasklistContent?: string
}> = ({
  editedBody,
  onChangeBody,
  isTextButton = false,
  loading = false,
  tasklistContent = DEFAULT_TASKLIST_CONTENT,
}) => {
  const onAddHierarchyShell = () => {
    let content = tasklistContent
    let addTitle = true
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
      addTitle = !hasCustomTitle(content)
      content = validateContent(content)
    }
    const bodyStart = editedBody && cursorStart ? `${editedBody.slice(0, cursorStart)}\n` : ''
    const bodyEnd = editedBody ? `\n${editedBody.slice(cursorEnd)}` : ''
    const tasklistBlock = getHierarchyShell(content, addTitle)
    flushSync(() => {
      onChangeBody(`${bodyStart}${tasklistBlock}${bodyEnd}`)
    })

    const moveCursorTo = cursorStart + tasklistBlock.length + 1
    activeElement.selectionStart = moveCursorTo
    activeElement.selectionEnd = moveCursorTo
  }

  return (
    <Box sx={{position: 'relative'}}>
      {isTextButton ? (
        loading ? (
          <Button
            size="small"
            sx={{
              borderRadius: 20,
              px: 2,
              boxShadow: 'none',
              marginRight: 2,
              display: 'flex',
              alignItems: 'center',
            }}
            disabled
          >
            <Box sx={{alignItems: 'center', display: 'flex'}}>
              <Spinner
                size="small"
                sx={{
                  marginRight: 1,
                }}
              />
              Adding tasklist...
            </Box>
          </Button>
        ) : (
          <Button
            size="small"
            sx={{
              borderRadius: 20,
              px: 2,
              boxShadow: 'none',
              marginRight: 2,
            }}
            className="js-add-tasklist-button"
            leadingVisual={PlusIcon}
            onClick={onAddHierarchyShell}
            {...testIdProps('add-tasklist-text-button')}
          >
            Add tasklist
          </Button>
        )
      ) : (
        <IconButton
          size="small"
          icon={ChecklistIcon}
          aria-label="Add a tasklist"
          onClick={onAddHierarchyShell}
          {...testIdProps('add-tasklist-button')}
        />
      )}
    </Box>
  )
}
