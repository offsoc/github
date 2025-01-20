import {useCallback} from 'react'
import {getSelectedLineRange} from './utils'
import type {SyntheticChangeEmitter} from '@github-ui/use-synthetic-change'

type UseListEditingSettings = {
  emitChange: SyntheticChangeEmitter
}

type UseListEditingResult = {
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
}

const calculateNextListItemStarter = ({leadingWhitespace = '', delimeter, taskBox, text}: ListItem) => {
  if (!text) return null // Delete the current list item if the user presses enter without typing anything

  const updatedDelimeter = typeof delimeter === 'number' ? `${delimeter + 1}.` : delimeter
  const maybeEmptyTaskBox = taskBox ? ' [ ]' : ''
  return `\n${leadingWhitespace}${updatedDelimeter}${maybeEmptyTaskBox} `
}

const calculatePreviousListItemStarter = ({leadingWhitespace = '', delimeter, taskBox}: ListItem) => {
  const updatedDelimeter = typeof delimeter === 'number' ? `${delimeter}.` : delimeter
  const maybeEmptyTaskBox = taskBox ? ' [ ]' : ' '
  return `${updatedDelimeter}${leadingWhitespace}${maybeEmptyTaskBox}\n`
}

/**
 * Adapted from: https://github.com/github/github/blob/ef649172de6802a699638e22798396ca78d61dc8/app/assets/modules/github/behaviors/task-list.ts#L404
 *
 * Groups:
 *  0. Leading whitespace
 *  1. Delimeter
 *  2. Item number (optional)
 *     - Note that we don't have item letter - we don't do autocomplete for lettered lists like (a, b, c) or (i, ii, iii) because it's too complex
 *  3. Task box (optional)
 *  4. Everything following
 *
 * This part of the regex ^(\s*(?:>\s*)*(?:[*-]\s{1,4})*) defines the allowed leading content for a list item.
 * It allows for:
 * - unlimited whitespace (at the start of the line)
 * - any number of (">" followed by unlimited spaces) (for blockquotes)
 * - any number of ("*" or "-" followed by 1-4 spaces) (for nested lists)
 */
export const listItemRegex = /^(\s*(?:>\s*)*(?:[*-]\s{1,4})*)([*-]|(\d+)\.)(\s{1,4})(?:(\[[\sx]\])\s)?(.*)/i

export type ListItem = {
  leadingWhitespace: string
  middleWhitespace: string
  text: string
  delimeter: '-' | '*' | number
  taskBox: '[ ]' | '[x]' | null
}

type NumericListItem = ListItem & {delimeter: number}

const isNumericListItem = (item: ListItem | null): item is NumericListItem => typeof item?.delimeter === 'number'

export const parseListItem = (line: string): ListItem | null => {
  const result = listItemRegex.exec(line)
  if (!result) return null
  const [, leadingWhitespace = '', fullDelimeter, itemNumberStr = '', middleWhitespace, taskBox = null, text] = result
  const itemNumber = Number.parseInt(itemNumberStr, 10)
  const delimeter = Number.isNaN(itemNumber) ? (fullDelimeter as '*' | '-') : itemNumber

  // fixme: handle types better
  return {
    leadingWhitespace,
    text: text!,
    delimeter,
    middleWhitespace: middleWhitespace!,
    taskBox: taskBox as '[ ]' | '[x]' | null,
  }
}

export const listItemToString = (item: ListItem) =>
  typeof item.delimeter === 'number'
    ? `${item.leadingWhitespace}${`${item.delimeter}.`}${item.middleWhitespace}${item.text}`
    : `${item.leadingWhitespace}${item.delimeter}${item.middleWhitespace}${item.taskBox || ''} ${item.text}`

/**
 * Provides support for list editing in the Markdown editor. This includes inserting new
 * list items and auto-incrementing numeric lists.
 */
export const useListEditing = ({emitChange}: UseListEditingSettings): UseListEditingResult => {
  const incrementFollowingNumericLines = useCallback(
    (textarea: HTMLTextAreaElement, lineRange?: [number, number]) => {
      // this must be recalculated instead of passed because we are on a new line now
      const [currentLineStart, currentLineEnd] = lineRange || getSelectedLineRange(textarea)
      const currentLineText = textarea.value.slice(currentLineStart, currentLineEnd)
      const currentLineItem = parseListItem(currentLineText)
      if (!isNumericListItem(currentLineItem)) return

      // Strip off the leading newline by adding 1
      const followingText = textarea.value.slice(currentLineEnd + 1)
      const followingLines = followingText.split(/\r?\n/)

      const followingNumericListItems: NumericListItem[] = []
      let prevItemNumber = currentLineItem.delimeter
      for (const line of followingLines) {
        const listItem = parseListItem(line)

        if (!isNumericListItem(listItem) || listItem.delimeter !== prevItemNumber) break

        followingNumericListItems.push(listItem)
        prevItemNumber++
      }

      if (followingNumericListItems.length === 0) return

      // don't forget to re-add the leading newline stripped off earlier
      const updatedItems = `\n${followingNumericListItems
        .map(item => listItemToString({...item, delimeter: item.delimeter + 1}))
        .join('\n')}`

      emitChange(updatedItems, [currentLineEnd, currentLineEnd + updatedItems.length + 1], textarea.selectionStart)
    },
    [emitChange],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Enter' && !event.shiftKey && !event.defaultPrevented) {
        const textarea = event.currentTarget

        const [activeLineStart, activeLineEnd] = getSelectedLineRange(textarea)

        // current line text without any of the selected text
        const activeLineValue =
          textarea.value.slice(activeLineStart, textarea.selectionStart) +
          textarea.value.slice(textarea.selectionEnd, activeLineEnd)

        const listItem = parseListItem(activeLineValue)
        if (!listItem) return // not currently editing a list - let the browser handle the event

        event.preventDefault()

        if (textarea.selectionStart === activeLineStart) {
          // Cursor is at the beginning of a line, potentially before a numeric list item
          const previousItemStarter = calculatePreviousListItemStarter(listItem)

          if (previousItemStarter === null) {
            emitChange('', [activeLineStart, textarea.selectionEnd])
          } else {
            emitChange(previousItemStarter)
            // increment following lines as a separate event so the user can separately undo the change
            incrementFollowingNumericLines(textarea, [
              activeLineStart,
              activeLineStart + previousItemStarter.length - 1,
            ])
          }
        } else {
          // Cursor is not at the beginning of a line, potentially after a numeric list item
          const nextItemStarter = calculateNextListItemStarter(listItem)

          if (nextItemStarter === null) {
            emitChange('', [activeLineStart, textarea.selectionEnd])
          } else {
            emitChange(nextItemStarter)
            // increment following lines as a separate event so the user can separately undo the change
            incrementFollowingNumericLines(textarea)
          }
        }
      }
    },
    [emitChange, incrementFollowingNumericLines],
  )

  return {onKeyDown}
}
