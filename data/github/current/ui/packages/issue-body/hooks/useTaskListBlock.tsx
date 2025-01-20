import {type MDOperationPayload, performTasklistBlockOperation} from '@github-ui/tasklist-block-operations'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {commitUpdateIssueBodyMutation} from '../mutations/update-issue-body-mutation'

type Props = {
  id: string
  markdown: string
  setMarkdown: (markdown: string) => void
  html: string
  isEditing: boolean
  bodyVersion: string
}

// a hook that setup the required callbacks to enable editing of tasklist blocks
export const useTaskListBlock = ({id, markdown, setMarkdown, html, isEditing, bodyVersion}: Props) => {
  const environment = useRelayEnvironment()
  const viewerRef = useRef<HTMLDivElement>(null)
  const [editedBody, setEditedBody] = useState<string>(markdown || '')
  const isTasklistBlockDirtyRef = useRef(false)

  const unsavedMarkdownRef = useRef<null | string>(null)
  const [isSavingTasklistBlock, setIsSavingTasklistBlock] = useState(false)

  // ensures that the rendered html in use reflects the most recent state of the "interactive" rendered markdown
  const renderedHtmlSnapshotRef = useRef<null | string>(null)
  const [renderedHtml, setRenderedHtml] = useState(html)

  useEffect(() => {
    setRenderedHtml('')
  }, [id])

  const resetRenderedHtml = useCallback(() => {
    if (isEditing || isSavingTasklistBlock || (isTasklistBlockDirtyRef.current && !unsavedMarkdownRef.current)) return

    // Don't reset the HTML if the user made another optimistic update or is currently dragging.
    if (viewerRef.current?.querySelector('.is-dirty, .js-tasklist-dragging')) return

    // If the user is not editing, reset the rendered HTML to the HTML from the response.
    if (viewerRef.current?.contains(document.activeElement)) return

    const bodyHtml =
      isTasklistBlockDirtyRef.current && renderedHtmlSnapshotRef.current ? renderedHtmlSnapshotRef.current : html
    setRenderedHtml(bodyHtml ?? '')
  }, [html, isEditing, isSavingTasklistBlock])

  const updateRenderedHtmlSnapshot = useCallback(async () => {
    const previousTasklistBlockState = viewerRef.current?.querySelector('tracking-block:first-of-type')
    if (!previousTasklistBlockState) return

    // otherwise update the current Markdown DOM snapshot
    const closestMarkdownBody = previousTasklistBlockState?.closest('.markdown-body')
    renderedHtmlSnapshotRef.current = closestMarkdownBody?.innerHTML ?? ''
  }, [])

  const resetUnsavedTasklistMarkdown = useCallback(() => {
    if (isEditing || !unsavedMarkdownRef.current) return
    setEditedBody(unsavedMarkdownRef.current)
  }, [isEditing])

  useLayoutEffect(() => {
    // Keep the edited body in sync with the description body while not editing.
    if ((isEditing ? isSavingTasklistBlock : !isSavingTasklistBlock) && !isTasklistBlockDirtyRef.current) {
      setEditedBody(markdown || '')
      setMarkdown(markdown || '')
    }
  }, [markdown, isEditing, isSavingTasklistBlock, setMarkdown])

  useLayoutEffect(() => {
    resetRenderedHtml()
    resetUnsavedTasklistMarkdown()
  }, [resetRenderedHtml, resetUnsavedTasklistMarkdown])

  useEffect(() => {
    const container = viewerRef.current
    if (!container) {
      return
    }

    const updateCallback = async (event: Event) => {
      const {detail} = event as CustomEvent<{payload?: string; resolve: () => void; reject: (error: Error) => void}>

      // signal that this event was handled.
      event.preventDefault()

      isTasklistBlockDirtyRef.current = false
      unsavedMarkdownRef.current = null
      setIsSavingTasklistBlock(true)

      const {payload, resolve, reject} = detail

      commitUpdateIssueBodyMutation({
        environment,
        input: {
          issueId: id,
          body: editedBody,
          tasklistBlocksOperation: payload,
          bodyVersion,
        },
        onCompleted: () => {
          resolve()
          setIsSavingTasklistBlock(false)
        },
        onError: (error: Error) => {
          reject(error)
          setIsSavingTasklistBlock(false)
        },
      })

      renderedHtmlSnapshotRef.current = null
    }

    // this is the new way of handling updates (with md at rest)
    const operationCallback = async (event: Event) => {
      const {detail} = event as CustomEvent<{
        payload: MDOperationPayload
        resolve: (handled: boolean) => void
        reject: (error: unknown) => void
      }>
      const {payload, resolve, reject} = detail

      try {
        const newBody = await performTasklistBlockOperation(editedBody, payload)

        let handled = false

        if (newBody != null) {
          handled = true
          setEditedBody(newBody)
          setMarkdown(newBody)
          unsavedMarkdownRef.current = newBody
          isTasklistBlockDirtyRef.current = true
        } else {
          setEditedBody(editedBody)
          setMarkdown(editedBody)
          unsavedMarkdownRef.current = editedBody
          isTasklistBlockDirtyRef.current = true
        }

        resolve(handled)
      } catch (err) {
        reject(err)
      }
    }

    container.addEventListener('tracking-block:update', updateCallback)
    container.addEventListener('tracking-block:operation', operationCallback)

    return () => {
      container.removeEventListener('tracking-block:update', updateCallback)
      container.removeEventListener('tracking-block:operation', operationCallback)
    }
    // note: isEditing in the deps is not a mistake, when the user enters/leaves preview mode we
    // need to reset the callback as the tasklist block might be a new dom element if we used
    // the html snapshot
  }, [editedBody, environment, id, setMarkdown, isEditing, bodyVersion])

  return {
    viewerRef,
    onStartEdit: updateRenderedHtmlSnapshot,
    snapshot: renderedHtml,
    isTasklistDirty: isTasklistBlockDirtyRef.current,
  }
}
