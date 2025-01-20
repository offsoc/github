import {listItemToString, parseListItem} from '@github-ui/markdown-editor/list-editing'
import type {TaskListItem} from '../constants/types'
import {isTaskListItem} from './helpers'

/**
 * Handles the toggle action for a task item in a markdown document.
 *
 * @param {Object} options - The options object.
 * @param {string} options.markdownValue - The markdown content.
 * @param {number} options.markdownIndex - The index of the task item in the markdown content.
 * @param {boolean} options.checked - The current checked state of the task item.
 * @param {(markdown: string) => void | Promise<void>} options.onChange - The callback function to be called when the markdown content changes.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} options.setChecked - The state setter function for the checked state.
 */
export const handleItemToggle = async ({
  markdownValue,
  markdownIndex,
  onChange,
}: {
  markdownValue: string
  markdownIndex: number
  onChange: (markdown: string) => void | Promise<void>
}) => {
  const lines = markdownValue.split(/\r?\n/)
  let currentCodeFence: string | null | undefined = null

  for (let lineIndex = 0, taskIndex = 0; lineIndex < lines.length; lineIndex++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const line = lines[lineIndex]!

    if (!currentCodeFence) {
      currentCodeFence = parseCodeFenceBegin(line)
    } else if (isCodeFenceEnd(line, currentCodeFence)) {
      currentCodeFence = null
      continue
    }

    if (currentCodeFence) continue

    const parsedLine = parseListItem(line)

    if (!isTaskListItem(parsedLine)) continue

    if (taskIndex === markdownIndex) {
      const updatedLine = listItemToString(toggleTaskListItem(parsedLine))
      lines.splice(lineIndex, 1, updatedLine)

      const updatedMarkdown = lines.join('\n')

      return await onChange(updatedMarkdown)
    }

    taskIndex++
  }
}

const toggleTaskListItem = (item: TaskListItem): TaskListItem => ({
  ...item,
  taskBox: item.taskBox === '[ ]' ? '[x]' : '[ ]',
})

/**
 * Parses the beginning of a code fence in a Markdown file.
 *
 * @param line The line of text to parse.
 * @returns The code fence characters if found, otherwise null.
 */
const parseCodeFenceBegin = (line: string) => {
  const match = line.match(/^ {0,3}(`{3,}|~{3,})[^`]*$/)
  return match ? match[1] : null
}

/**
 * Checks if a line is the end of a code fence.
 * @param line - The line to check.
 * @param fence - The code fence string.
 * @returns A boolean indicating whether the line is the end of a code fence.
 */
const isCodeFenceEnd = (line: string, fence: string) => {
  const regex = new RegExp(`^ {0,3}${fence}${fence[0]}* *$`)
  return regex.test(line)
}
