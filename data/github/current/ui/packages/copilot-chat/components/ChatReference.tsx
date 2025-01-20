import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {
  BookIcon,
  CodeIcon,
  FileCodeIcon,
  FileDiffIcon,
  FileIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  KebabHorizontalIcon,
  LinkIcon,
  PaperclipIcon,
  RepoIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Octicon} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo, useRef} from 'react'

import {isDocset, referenceID, referenceName, referenceURL} from '../utils/copilot-chat-helpers'
import type {CopilotChatReference} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {ActionMenuOverlay, COPILOT_CHAT_MESSAGES_MENU_PORTAL_ROOT} from './PortalContainerUtils'

export interface ChatReferenceProps {
  n?: number | null
  reference: CopilotChatReference
}

export const DOC_LANGUAGES = ['Markdown', 'MDX']

export function OutputReference({n, reference}: ChatReferenceProps) {
  const state = useChatState() as ReturnType<typeof useChatState> | undefined // if we're run in tests without context, this will be undefined
  const manager = useChatManager()
  const actionButtonRef = useRef<HTMLButtonElement | null>(null)

  const mode = state?.mode ?? 'assistive'
  const clickHandler = useCallback(
    (e: React.SyntheticEvent) => {
      // If the user is clicking on the action menu, don't let the event bubble up and select the reference.
      if (e.target instanceof Node && actionButtonRef.current?.contains(e.target)) {
        e.stopPropagation()
        e.preventDefault()
        return
      }

      // In assistive, we just let the link navigate
      if (mode !== 'immersive') return

      // Don't do anything special if the user has clicked a repo or docset
      if (['repository', 'docset'].includes(reference.type)) return

      e.preventDefault()
      manager.selectReference(reference)
    },
    [manager, mode, reference],
  )

  const {currentReferences} = state ?? {currentReferences: []}
  const selectedRefIDs = useMemo(() => currentReferences.map(r => referenceID(r)), [currentReferences])
  const thisRefID = useMemo(() => referenceID(reference), [reference])
  const isInCurrentReferences = useMemo(() => selectedRefIDs.includes(thisRefID), [selectedRefIDs, thisRefID])
  const handleAddReference = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      if (isInCurrentReferences) return
      manager.addReference(reference, 'refMenu')
    },
    [manager, reference, isInCurrentReferences],
  )

  return (
    <ActionList.LinkItem
      onClick={clickHandler}
      href={referenceURL(reference)}
      rel="noopener"
      sx={{wordBreak: 'break-word'}}
      className="reference-action"
    >
      <ActionList.LeadingVisual>
        <Octicon icon={iconForReference(reference, isDocset(state?.currentTopic))} />
      </ActionList.LeadingVisual>

      {typeof n === 'number' ? <span>{n} - </span> : null}
      {referenceName(reference)}

      <ActionList.TrailingVisual>
        <ActionMenu anchorRef={actionButtonRef}>
          <ActionMenu.Anchor>
            <IconButtonWithTooltip
              icon={KebabHorizontalIcon}
              sx={{height: 20}}
              variant="invisible"
              size="small"
              aria-label="More reference options"
              label="More reference options"
              tooltipDirection="nw"
              className="reference-action"
            />
          </ActionMenu.Anchor>

          <ActionMenuOverlay portalContainerName={COPILOT_CHAT_MESSAGES_MENU_PORTAL_ROOT}>
            <ActionList>
              {mode === 'immersive' ? (
                <ActionList.LinkItem
                  href={referenceURL(reference)}
                  onClick={e => {
                    // `clickHandler` will try to open this link in a dialog if the event gets to it
                    e.stopPropagation()
                  }}
                  rel="noopener"
                  target="_blank"
                >
                  <ActionList.LeadingVisual>
                    <LinkIcon />
                  </ActionList.LeadingVisual>
                  Open
                </ActionList.LinkItem>
              ) : (
                <ActionList.Item
                  onSelect={e => {
                    // `clickHandler` will try to open this link in a dialog if the event gets to it
                    e.stopPropagation()
                    manager.selectReference(reference)
                  }}
                >
                  <ActionList.LeadingVisual>
                    <LinkIcon />
                  </ActionList.LeadingVisual>
                  Preview
                </ActionList.Item>
              )}
              <ActionList.Item onSelect={handleAddReference} disabled={isInCurrentReferences}>
                <ActionList.LeadingVisual>
                  <PaperclipIcon />
                </ActionList.LeadingVisual>
                Attach to chat
              </ActionList.Item>
            </ActionList>
          </ActionMenuOverlay>
        </ActionMenu>
      </ActionList.TrailingVisual>
    </ActionList.LinkItem>
  )
}

function iconForReference(reference: CopilotChatReference, isDocsetChat: boolean) {
  switch (reference.type) {
    case 'file':
      return FileCodeIcon
    case 'file-diff':
      return FileDiffIcon
    case 'snippet':
      return isDocsetChat && reference.languageName && DOC_LANGUAGES.includes(reference.languageName)
        ? BookIcon
        : CodeIcon
    case 'repository':
      return RepoIcon
    case 'symbol':
      return FileIcon
    case 'docset':
      return BookIcon
    case 'commit':
      return GitCommitIcon
    case 'pull-request':
      return GitPullRequestIcon
    default:
      return FileIcon
  }
}
