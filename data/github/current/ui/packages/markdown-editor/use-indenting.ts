import {useCallback} from 'react'

import {getSelectedLineRange} from './utils'
import type {SyntheticChangeEmitter} from '@github-ui/use-synthetic-change'

type UseIndentingSettings = {
  emitChange: SyntheticChangeEmitter
}

type UseIndentingResult = {
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
}

const indentationRegex = /^(?:\t| ? ?)(.*)/

const dedent = (line: string) => indentationRegex.exec(line)?.[1] ?? ''
const indent = (line: string) => `  ${line}`

/**
 * Provides functionality for indenting and dedenting selected lines in the Markdown editor.
 */
export const useIndenting = ({emitChange}: UseIndentingSettings): UseIndentingResult => {
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = event.currentTarget
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.defaultPrevented || event.key !== 'Tab' || textarea.selectionEnd - textarea.selectionStart === 0) return
      event.preventDefault()

      const [start, end] = getSelectedLineRange(textarea)
      const updatedLines = textarea.value
        .slice(start, end)
        .split(/\r?\n/)
        .map(line => (event.shiftKey ? dedent(line) : indent(line)))
        .join('\n')

      emitChange(updatedLines, [start, end], [start, start + updatedLines.length])
    },
    [emitChange],
  )

  return {onKeyDown}
}
