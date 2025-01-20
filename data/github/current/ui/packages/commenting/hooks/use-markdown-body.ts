import type {CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import type {ValidationResult} from '@github-ui/entity-validators'
import {validateComment} from '@github-ui/entity-validators'
import {useItemPickersContext} from '@github-ui/item-picker/ItemPickersContext'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useKeyPress} from '@github-ui/use-key-press'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import type {ForwardedRef, RefObject} from 'react'
import {useCallback, useEffect, useImperativeHandle, useState} from 'react'

import {CLASS_NAMES, withClassSelector} from '../constants/dom-elements'
import {HOTKEYS} from '../constants/hotkeys'
import {VALUES} from '../constants/values'
import type {CommentingAppPayload} from '../types'
import {type SelectionContext, selectQuoteFromComment} from '../utils/quotes'

export interface MarkdownComposerRef {
  appendText: (text: string) => void
  setText: (text: string) => void
  focus: () => void
}

interface UseMarkdownBodyArgs {
  commentBoxRef: RefObject<CommentBoxHandle>
  markdownComposerRef: ForwardedRef<MarkdownComposerRef>
  onChange: () => void
  onCancel: () => void
  referenceId: string
  hasSingleKeyShortcutEnabled?: boolean
  insidePortal?: boolean
}

export function useMarkdownBody({
  commentBoxRef,
  markdownComposerRef,
  onChange,
  onCancel,
  referenceId,
  hasSingleKeyShortcutEnabled,
  insidePortal,
}: UseMarkdownBodyArgs) {
  const [presavedComment, setPresavedComment] = useSessionStorage<string>(
    VALUES.localStorageKeys.issueNewComment('viewer', referenceId),
    '',
  )
  const [markdownBody, setMarkdownBody] = useState<string>(presavedComment)

  const [markdownValidationResult, setMarkdownValidationResult] = useState<ValidationResult>(
    validateComment(markdownBody),
  )

  const appPayload = useAppPayload<CommentingAppPayload>()
  // Some apps that use this do not use AppPayload, so this will allow for that to be a fallback if hasSingleKeyShortcutEnabled is not provided as a prop to this hook
  const singleKeyShortcutIsEnabled =
    hasSingleKeyShortcutEnabled !== undefined
      ? hasSingleKeyShortcutEnabled
      : appPayload?.current_user_settings?.use_single_key_shortcut || false

  const {anyItemPickerOpen} = useItemPickersContext()

  const changeMarkdownBody = useCallback(
    (newMarkdown: string) => {
      setMarkdownBody(newMarkdown)
      setPresavedComment(newMarkdown)
    },
    [setPresavedComment],
  )

  const handleMarkdownBodyChanged = useCallback(
    (newMarkdown: string) => {
      changeMarkdownBody(newMarkdown)
      onChange()
      if (newMarkdown === '') onCancel()
    },
    [changeMarkdownBody, onCancel, onChange],
  )

  useImperativeHandle(
    markdownComposerRef,
    () => ({
      appendText: (text: string) => {
        handleMarkdownBodyChanged(`${markdownBody}\n\n${text}`)
      },
      setText: (text: string) => {
        handleMarkdownBodyChanged(text)
      },
      focus: () => {
        commentBoxRef.current?.focus()
      },
    }),
    [handleMarkdownBodyChanged, markdownBody, commentBoxRef],
  )

  useEffect(() => setMarkdownBody(markdownBody), [markdownBody, setMarkdownBody])
  useEffect(() => {
    setMarkdownValidationResult(validateComment(markdownBody))
  }, [markdownBody])

  const onFocusShortcutActivated = useCallback(
    (e: KeyboardEvent) => {
      if (!singleKeyShortcutIsEnabled || anyItemPickerOpen()) {
        return
      }

      if (commentBoxRef && commentBoxRef.current) {
        e.preventDefault()

        const current = window.getSelection()
        if (current && current.anchorNode) {
          const selectionContext: SelectionContext = {anchorNode: current.anchorNode, range: current.getRangeAt(0)}
          const container = current.anchorNode.parentElement
          const quotedItem =
            container?.closest(withClassSelector(CLASS_NAMES.issueComment)) ??
            container?.closest(withClassSelector(CLASS_NAMES.issueBody))

          // Checking if we can identify the item the selection was made on
          if (quotedItem && quotedItem instanceof HTMLDivElement) {
            const newValue = selectQuoteFromComment(quotedItem, selectionContext)
            changeMarkdownBody(`${newValue}`)
          }
        }

        commentBoxRef.current.scrollIntoView()
        commentBoxRef.current.focus()
      }
    },
    [anyItemPickerOpen, changeMarkdownBody, commentBoxRef, singleKeyShortcutIsEnabled],
  )

  const resetMarkdownBody = useCallback(() => {
    // resetting the ref will also reset dynamic height and will trigger a state update through onChange
    if (commentBoxRef.current) commentBoxRef.current.reset()
    else setMarkdownBody('')
    // This will remove the key from sessionStorage
    setPresavedComment(undefined)
  }, [commentBoxRef, setPresavedComment])

  useKeyPress([HOTKEYS.focusCommentComposer], onFocusShortcutActivated, {
    triggerWhenInputElementHasFocus: false,
    triggerWhenPortalIsActive: insidePortal,
  })

  return {handleMarkdownBodyChanged, markdownValidationResult, markdownBody, resetMarkdownBody}
}
