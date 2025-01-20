import {CommentBox, type CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {CommentBoxButton} from '@github-ui/comment-box/CommentBoxButton'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {
  isAppendItemMDPayload,
  type MDOperationPayload,
  performTasklistBlockOperation,
} from '@github-ui/tasklist-block-operations'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import useIsMounted from '@github-ui/use-is-mounted'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, IconButton, Label, Link, RelativeTime, Text} from '@primer/react'
import {isValid} from 'date-fns'
import {useCallback, useEffect, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import type {User} from '../../api/common-contracts'
import {HierarchySidePanelItem} from '../../api/memex-items/hierarchy'
import {
  CommentAuthorAssociation,
  type IssueMetadataDescription,
  type ReactionEmotion,
  type Reactions,
} from '../../api/side-panel/contracts'
import {AddTasklistButtonClick} from '../../api/stats/contracts'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {sanitizeRenderedMarkdown} from '../../helpers/sanitize'
import {toTitleCase} from '../../helpers/util'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useApiRequest} from '../../hooks/use-api-request'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {type HistoryItem, useSidePanel} from '../../hooks/use-side-panel'
import {useSidePanelDirtyState} from '../../hooks/use-side-panel-dirty-state'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'
import {Resources} from '../../strings'
import {AddTasklistButton} from './add-tasklist-button'
import {SidePanelReactions} from './reactions'
import {useSidePanelMarkdownSubject} from './use-side-panel-markdown-subject'

const ActionsOverflowMenu: React.FC<{
  url: string
  onEdit?: () => void
}> = ({url, onEdit}) => (
  <ActionMenu>
    <ActionMenu.Anchor>
      <IconButton
        icon={KebabHorizontalIcon}
        variant="invisible"
        size="small"
        aria-label="Comment actions"
        sx={{color: 'fg.default'}}
        {...testIdProps('comment-overflow-menu-button')}
      />
    </ActionMenu.Anchor>

    <ActionMenu.Overlay align="end">
      <ActionList>
        <ActionList.Item onSelect={() => navigator.clipboard.writeText(url)}>Copy link</ActionList.Item>
        {onEdit && (
          <ActionList.Item onSelect={onEdit} {...testIdProps('overflow-menu-edit-button')}>
            Edit
          </ActionList.Item>
        )}
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
)

const Actions: React.FC<{
  url?: string
  onEdit?: () => void
}> = ({url, onEdit}) =>
  url ? (
    <ActionsOverflowMenu url={url} onEdit={onEdit} />
  ) : onEdit ? (
    <Button
      size="small"
      variant="invisible"
      sx={{
        color: 'fg.default',
      }}
      onClick={onEdit}
      aria-label="Edit comment"
      {...testIdProps('edit-comment-button')}
    >
      Edit
    </Button>
  ) : null

const Timestamp: React.FC<{createdAt: Date; editedAt?: Date}> = ({createdAt, editedAt}) => {
  const latestDate = editedAt ?? createdAt
  if (!isValid(latestDate)) {
    return null
  }
  return (
    <Text sx={{color: 'fg.muted'}} {...testIdProps('edit-timestamp')}>
      <RelativeTime date={latestDate} />
      {latestDate === editedAt && ' (edited)'}
    </Text>
  )
}

const Header: React.FC<{
  author: User
  authorAssociation?: CommentAuthorAssociation
  createdAt: Date
  editedAt?: Date
  url?: string
  onStartEdit?: () => void
}> = ({author, createdAt, editedAt, authorAssociation, url, onStartEdit}) => (
  <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2}} as="header">
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center'}}>
      {author.avatarUrl && (
        <GitHubAvatar
          loading="lazy"
          size={24}
          key={author.id}
          alt="" // alt text not needed since we have the username right next to it
          src={author.avatarUrl}
          {...testIdProps('author-avatar')}
          sx={{flexShrink: 0}}
        />
      )}

      <Text sx={{fontWeight: 600, fontStyle: 'normal'}} {...testIdProps('author-login')} as="address">
        {author.login}
      </Text>

      {url ? (
        <Link href={url} target="_blank" {...testIdProps('edit-timestamp-link')}>
          <Timestamp createdAt={createdAt} editedAt={editedAt} />
        </Link>
      ) : (
        <Timestamp createdAt={createdAt} editedAt={editedAt} />
      )}

      {authorAssociation && authorAssociation !== CommentAuthorAssociation.NONE && (
        <>
          <Text sx={{color: 'fg.muted'}}>&middot;</Text>
          <Label sx={{fontWeight: 600, alignSelf: 'center'}} {...testIdProps('author-association')}>
            {toTitleCase(authorAssociation)}
          </Label>
        </>
      )}
    </Box>

    <Actions url={url} onEdit={onStartEdit} />
  </Box>
)

const EditorButtons: React.FC<{
  onCancel: () => void
  onSave: () => void
  updateButtonDisabled: boolean
}> = ({onCancel, onSave, updateButtonDisabled}) => (
  <>
    <CommentBoxButton variant="invisible" sx={{color: 'fg.muted'}} onClick={onCancel} {...testIdProps('cancel-button')}>
      Cancel
    </CommentBoxButton>
    <CommentBoxButton
      variant="primary"
      onClick={onSave}
      {...testIdProps('save-button')}
      disabled={updateButtonDisabled}
    >
      Update comment
    </CommentBoxButton>
  </>
)

export const SidePanelComment: React.FC<{
  allowEmptyBody?: boolean
  author: User
  authorAssociation?: CommentAuthorAssociation
  createdAt: Date
  editedAt?: Date
  url?: string

  description: IssueMetadataDescription
  onEdit?: (body: string, tasklistBlockOperationTracker?: string) => Promise<void>
  onEditTasklistBlock?: (update?: string, editedBody?: string, tasklistBlockOperationTracker?: string) => Promise<void>

  reactions: Reactions
  onReact?: (reaction: ReactionEmotion, reacted: boolean, actor: string) => Promise<void>

  showAddTasklistButton?: boolean
}> = ({
  allowEmptyBody,
  author,
  authorAssociation,
  createdAt,
  editedAt,
  url,
  description,
  onEdit,
  onEditTasklistBlock,
  reactions,
  onReact,
  showAddTasklistButton,
}) => {
  const [, setDirty] = useSidePanelDirtyState()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingTasklistBlock, setIsSavingTasklistBlock] = useState(false)
  const [editedBody, setEditedBody] = useState<string>(description.body || '')
  const editorRef = useRef<CommentBoxHandle>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const viewPlaceholderRef = useRef<HTMLParagraphElement>(null)
  const tlbOperationTracker = useRef<Array<{name: string; value?: string}>>([])
  const isMounted = useIsMounted()
  const {openPaneHistoryItem, sidePanelState} = useSidePanel()
  const {items} = useMemexItems()
  const [addTasklistIsLoading, setAddTasklistIsLoading] = useState(false)
  const {postStats} = usePostStats()
  const {memex_disable_draft_issue_file_upload} = useEnabledFeatures()

  const editorSubject = useSidePanelMarkdownSubject()

  const draftFileUploadsDisabled =
    sidePanelState?.type === 'issue' && sidePanelState.item.isDraft() ? memex_disable_draft_issue_file_upload : false

  // tasklist block x react integration refs
  // tracks if the tasklist block element is edited but not saved before
  // starting the side-panel editing mode
  const isTasklistBlockDirtyRef = useRef(false)
  // ensures that the rendered html in use reflects the most recent state of the "interactive" rendered markdown
  const renderedHtmlSnapshotRef = useRef<null | string>(null)
  const unsavedMarkdownRef = useRef<null | string>(null)

  // The issue body is allowed to be empty, but issue comments are not.
  const canSaveComment = allowEmptyBody || editedBody.trim() !== ''

  const [renderedHtml, setRenderedHtml] = useState(description.bodyHtml ?? '')
  const resetRenderedHtml = useCallback(() => {
    if (isEditing || isSavingTasklistBlock || (isTasklistBlockDirtyRef.current && !unsavedMarkdownRef.current)) return

    // Don't reset the HTML if the user made another optimistic update or is currently dragging.
    if (viewerRef.current?.querySelector('.is-dirty, .js-tasklist-dragging')) return

    // If the user is not editing, reset the rendered HTML to the HTML from the response.
    if (viewerRef.current?.contains(document.activeElement)) return

    const bodyHtml =
      isTasklistBlockDirtyRef.current && renderedHtmlSnapshotRef.current
        ? renderedHtmlSnapshotRef.current
        : description.bodyHtml
    setRenderedHtml(bodyHtml ?? '')
  }, [description.bodyHtml, isEditing, isSavingTasklistBlock])

  const resetUnsavedTasklistMarkdown = useCallback(() => {
    if (isEditing || !unsavedMarkdownRef.current) return
    setEditedBody(unsavedMarkdownRef.current)
  }, [isEditing])

  useLayoutEffect(() => {
    // Keep the edited body in sync with the description body while not editing.
    if ((isEditing ? isSavingTasklistBlock : !isSavingTasklistBlock) && !isTasklistBlockDirtyRef.current) {
      setEditedBody(description.body || '')
    }
  }, [description.body, isEditing, isSavingTasklistBlock])

  useLayoutEffect(() => {
    resetRenderedHtml()
    resetUnsavedTasklistMarkdown()
  }, [resetRenderedHtml, resetUnsavedTasklistMarkdown])

  const updateRenderedHtmlSnapshot = useCallback(async () => {
    const previousTasklistBlockState = viewerRef.current?.querySelector('tracking-block:first-of-type')
    if (!previousTasklistBlockState) return

    // otherwise update the current Markdown DOM snapshot
    const closestMarkdownBody = previousTasklistBlockState?.closest('.markdown-body')
    renderedHtmlSnapshotRef.current = closestMarkdownBody?.innerHTML ?? ''
  }, [])

  useEffect(() => {
    const container = viewerRef.current || viewPlaceholderRef.current
    if (!container || !onEdit || !onEditTasklistBlock) return

    const updateCallback = async (event: Event) => {
      const {detail} = event as CustomEvent<
        string | {payload?: string; resolve: () => void; reject: (error: any) => void}
      >
      // Signal that this event was handled.
      event.preventDefault()

      isTasklistBlockDirtyRef.current = false
      unsavedMarkdownRef.current = null

      setIsSavingTasklistBlock(true)

      try {
        if (typeof detail === 'string') {
          await onEditTasklistBlock(detail)
        } else {
          const {payload, resolve, reject} = detail
          const stringifiedTracker = JSON.stringify(tlbOperationTracker.current)

          if (payload) {
            await onEditTasklistBlock(payload, editedBody, stringifiedTracker).then(resolve, reject)
          } else {
            await onEdit(editedBody, stringifiedTracker).then(resolve, reject)
          }
        }
      } finally {
        setIsSavingTasklistBlock(false)
        tlbOperationTracker.current = []
      }
    }

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

        const tlbOperationItem: {name: string; value?: string} = {name: payload.operation}
        if (isAppendItemMDPayload(payload)) {
          tlbOperationItem.value = payload.value
        }
        tlbOperationTracker.current.push(tlbOperationItem)

        if (newBody != null) {
          handled = true
          setEditedBody(newBody)
          unsavedMarkdownRef.current = newBody
          isTasklistBlockDirtyRef.current = true
        } else {
          setEditedBody(editedBody)
          unsavedMarkdownRef.current = editedBody
          isTasklistBlockDirtyRef.current = true
        }

        resolve(handled)
      } catch (err) {
        reject(err)
      }
    }

    const dirtyCallback = () => {
      setDirty(container.querySelector('.is-dirty') != null)
    }

    container.addEventListener('tracking-block:update', updateCallback)
    container.addEventListener('tracking-block:operation', operationCallback)
    container.addEventListener('tracking-block:dirty-change', dirtyCallback)

    return () => {
      container.removeEventListener('tracking-block:update', updateCallback)
      container.removeEventListener('tracking-block:operation', operationCallback)
      container.removeEventListener('tracking-block:dirty-change', dirtyCallback)
    }
  }, [
    onEdit,
    onEditTasklistBlock,
    isSaving,
    isEditing,
    description.bodyHtml,
    editedBody,
    setDirty,
    updateRenderedHtmlSnapshot,
  ])

  const onChangeBody = useCallback(
    (newBody: React.SetStateAction<string>): void => {
      setEditedBody(newBody)
      setDirty(true)
    },
    [setEditedBody, setDirty],
  )

  const {perform: saveBody} = useApiRequest({
    request: async (viewBody?: string) => {
      if (!onEdit) return

      if (!viewBody) setIsSaving(true)
      await onEdit(viewBody || editedBody)
      renderedHtmlSnapshotRef.current = null
      if (isMounted()) setIsSaving(false)
    },
    rollback: () => {
      setIsSaving(false)
      resetRenderedHtml()
    },
    showErrorToast: true,
  })

  const debouncedSave = useDebounce(saveBody, 1000)

  const onInteractWithBody = useCallback(
    (value: string) => {
      setEditedBody(value)
      // Debounce to avoid disabling after every single checkbox click
      debouncedSave(undefined)
    },
    [debouncedSave],
  )

  const onStartEdit = onEdit
    ? () => {
        flushSync(() => {
          updateRenderedHtmlSnapshot()
          setIsEditing(true)
        })

        editorRef.current?.focus()
      }
    : undefined

  const onCancelEdit = () => {
    setIsEditing(false)
    setEditedBody(description.body || '')
    setDirty(false)
  }

  const onSaveEdit = async () => {
    // The server will reject a request if the body is empty, so don't
    // allow the client to send such a request.
    // We disable the button in this case, but we also need to guard here,
    // for the scenario where this function is called as the primary action
    // of the markdown editor.
    if (canSaveComment) {
      await saveBody(undefined)
      if (isMounted()) {
        setIsEditing(false)
        setDirty(false)
        isTasklistBlockDirtyRef.current = false
      }
    }
  }

  const findRelatedMemexIssue = useCallback(
    (repoId: number, itemId: number): MemexItemModel | undefined =>
      items.find(i => i.contentRepositoryId === repoId && i.content.id === itemId),
    [items],
  )

  const getLinkItem = (target: HTMLLinkElement): HistoryItem => {
    // Limit functionality to tasklist blocks items only for first pass at breadcrumbs
    const tasklistBlock = target.closest('[data-issue]')
    if (!tasklistBlock) return {}

    const repositoryId = tasklistBlock.getAttribute('data-repository-id')
    const itemId = tasklistBlock.getAttribute('data-item-id')
    const repositoryName = tasklistBlock.getAttribute('data-repository-name')
    const displayNumber = tasklistBlock.getAttribute('data-display-number')
    const itemTitle = tasklistBlock.getAttribute('data-item-title')
    const itemKey = {
      repoId: parseInt(repositoryId ?? '0'),
      issueId: parseInt(itemId ?? '0'),
    }

    const maybeMemexItem = findRelatedMemexIssue(itemKey.repoId, itemKey.issueId)
    if (maybeMemexItem) return {item: maybeMemexItem}

    const a: HTMLElement | null = target.closest('a')
    const itemUrl = a?.getAttribute('href') ?? ''

    return {
      item: new HierarchySidePanelItem(
        {
          key: itemKey,
          title: not_typesafe_nonNullAssertion(itemTitle),
          url: itemUrl,
          state: 'open',
          repoName: repositoryName ?? '',
          number: parseInt(displayNumber ?? ''),
          assignees: [],
          labels: [],
        },
        {
          completed: 0,
          total: 0,
          percent: 0,
        },
      ),
    }
  }

  return isEditing ? (
    <>
      <CommentBox
        label="Edit comment"
        showLabel={false}
        ref={editorRef}
        value={editedBody}
        onChange={onChangeBody}
        onPrimaryAction={onSaveEdit}
        sx={{
          border: 'none',
        }}
        fileUploadsEnabled={!draftFileUploadsDisabled}
        subject={editorSubject}
        actions={<EditorButtons onSave={onSaveEdit} onCancel={onCancelEdit} updateButtonDisabled={!canSaveComment} />}
        {...testIdProps('markdown-editor')}
      />
      {draftFileUploadsDisabled && (
        <Text as="p" sx={{fontStyle: 'italic', fontSize: 0, color: 'fg.muted', px: 3}}>
          File uploads have been disabled for draft issues in this organization.
        </Text>
      )}
    </>
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        gap: 3,
      }}
      as="article"
    >
      <Header
        author={author}
        createdAt={createdAt}
        editedAt={editedAt}
        url={url}
        onStartEdit={onStartEdit}
        authorAssociation={authorAssociation}
      />

      {description.bodyHtml ? (
        <div {...testIdProps('comment-body')} ref={viewerRef}>
          <MarkdownViewer
            verifiedHTML={sanitizeRenderedMarkdown(renderedHtml, {skipImageSanitization: true})}
            onChange={onInteractWithBody}
            markdownValue={description.body || ''}
            disabled={isSaving || !onEdit}
            onLinkClick={event => {
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              if (event.metaKey || event.shiftKey || event.button === 1) return
              const historyItem = getLinkItem(event.target as HTMLLinkElement)

              if (historyItem.item) {
                event.preventDefault()
                openPaneHistoryItem(historyItem)
              }
            }}
          />
        </div>
      ) : (
        <Text
          className="js-comment"
          sx={{color: 'fg.muted', m: 0, fontStyle: 'italic'}}
          as="p"
          ref={viewPlaceholderRef}
          {...testIdProps('empty-body-placeholder')}
        >
          {Resources.noDescriptionProvided}
        </Text>
      )}

      <footer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {showAddTasklistButton && onStartEdit ? (
            <tasklist-block-add-tasklist
              onClick={() => {
                postStats({
                  name: AddTasklistButtonClick,
                })
              }}
            >
              <AddTasklistButton
                editedBody={editedBody}
                onChangeBody={async () => {
                  const body =
                    viewerRef.current?.querySelector('.js-comment, .markdown-body') || viewPlaceholderRef.current
                  if (!body) return

                  setAddTasklistIsLoading(true)

                  try {
                    await new Promise<void>((resolve, reject) => {
                      const ignored = body.dispatchEvent(
                        new CustomEvent('tracking-block:add-tasklist', {
                          bubbles: true,
                          cancelable: true,
                          detail: {resolve, reject},
                        }),
                      )

                      // If the event was not ignored, we know that the event was handled.
                      if (ignored) resolve()
                    })
                  } finally {
                    setAddTasklistIsLoading(false)
                  }
                }}
                isTextButton
                loading={addTasklistIsLoading}
                tasklistContent={''}
              />
            </tasklist-block-add-tasklist>
          ) : null}
          <SidePanelReactions reactions={reactions} onReact={onReact} />
        </Box>
      </footer>
    </Box>
  )
}
