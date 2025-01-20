import {FileDiffIcon} from '@primer/octicons-react'
import {MarkdownEditor, type MarkdownEditorHandle} from '@github-ui/markdown-editor'
import {flushSync} from 'react-dom'
import {useEffect} from 'react'

type AddSuggestionButtonProps = {
  onChange: (text: string) => void
  inputValue: string
  sourceContentFromDiffLines: string | undefined
  onInsertSuggestedChange: () => void
  shouldInsertSuggestionOnRender: boolean | undefined
  editorRef: React.RefObject<MarkdownEditorHandle>
}

/**
 * Inserts the suggested change backticks + original line into the comment box's markdown editor
 * Moves cursor to end of suggested change line
 *
 * @param onChange - function that changes the body of the comment box's markdown editor
 * @param inputValue - the current value of the comment box markdown editor, used to determine where to insert the suggestion
 * @param sourceContentFromDiffLines - the lines from the diff to insert as a suggestion
 * @param onInsertSuggestedChange - function called when the suggestion block is inserted
 * @param shouldInsertSuggestionOnRender - boolean indicating whether to auto insert the suggested change lines (invoked by context menu)
 * @param editorRef - ref to the markdown editor's input
 */
export function AddSuggestionButton({
  onChange,
  inputValue,
  sourceContentFromDiffLines,
  onInsertSuggestedChange,
  shouldInsertSuggestionOnRender,
  editorRef,
}: AddSuggestionButtonProps) {
  const suggestionLines = sourceContentFromDiffLines ?? ''

  const markdownPrefix = '```suggestion'
  const markdownSuffix = '```'
  const suggestion = `${markdownPrefix}\n${suggestionLines}\n${markdownSuffix}`

  const insertSuggestion = () => {
    onInsertSuggestedChange()
    // Focus the editor so there is a valid activeElement
    editorRef.current?.focus()
    const updatedMarkdownBody = inputValue === '' ? suggestion : `${inputValue}\n${suggestion}`
    // Synchronously update the DOM so we can position the cursor correctly
    flushSync(() => {
      onChange(updatedMarkdownBody)
    })
    const activeElement = document.activeElement
    if (!activeElement || !(activeElement instanceof HTMLTextAreaElement)) return

    const endOfSuggestedChangeLine = updatedMarkdownBody.length - markdownSuffix.length
    activeElement.selectionStart = endOfSuggestedChangeLine - 1
    activeElement.selectionEnd = endOfSuggestedChangeLine - 1
  }

  useEffect(() => {
    if (shouldInsertSuggestionOnRender) {
      // Wait a tick to prevent calling flushSync during rendering
      setTimeout(() => insertSuggestion())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <MarkdownEditor.ToolbarButton icon={FileDiffIcon} aria-label="Add a suggestion" onClick={insertSuggestion} />
}
