import {CreateIssueDialogEntry} from '@github-ui/issue-create/CreateIssueDialogEntry'
import {DisplayMode} from '@github-ui/issue-create/DisplayMode'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {
  BlockedIcon,
  EyeClosedIcon,
  EyeIcon,
  FoldIcon,
  IssueOpenedIcon,
  KebabHorizontalIcon,
  LinkIcon,
  PencilIcon,
  QuoteIcon,
  ReportIcon,
  TrashIcon,
  UnfoldIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, IconButton, Octicon, type SxProp} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'
import type {FragmentRefs} from 'relay-runtime'

import {TEST_IDS} from '../constants/test-ids'
import {type SelectionContext, selectQuoteFromComment} from '../utils/quotes'
import type {CommentAuthorAssociation as GraphQlCommentAuthorAssociation} from './issue-comment/__generated__/IssueCommentHeader.graphql'
import {BlockUserFromOrgDialog} from './issue-comment/BlockUserFromOrgDialog'
import {type HIDE_OPTIONS, HideCommentActionItems} from './issue-comment/HideCommentActions'
import {ReportContentDialog} from './issue-comment/ReportContentDialog'
import {UnblockUserFromOrgDialog} from './issue-comment/UnblockUserFromOrgDialog'

export interface CommentData {
  authorAssociation: GraphQlCommentAuthorAssociation
  body: string
  id: string
  createdAt: string
  isHidden: boolean
  referenceText: string
  minimizedReason: string | null | undefined
  pendingMinimizeReason?: string | null | undefined
  pendingBlock?: boolean | null
  pendingUnblock?: boolean | null
  repository: {
    id: string
    isPrivate: boolean
    name: string
    owner: {
      id: string
      login: string
      url: string
    }
  }
  url: string
  createdViaEmail?: boolean
  viewerCanDelete: boolean
  viewerCanMinimize: boolean
  viewerCanSeeMinimizeButton: boolean
  viewerCanSeeUnminimizeButton: boolean
  viewerCanUpdate: boolean
  viewerCanReport: boolean
  viewerCanReportToMaintainer: boolean
  viewerCanBlockFromOrg: boolean
  viewerCanUnblockFromOrg: boolean
  author:
    | {
        id: string
        login: string
      }
    | null
    | undefined
  authorToRepoOwnerSponsorship?: {
    createdAt: string
    isActive: boolean
  } | null
  ' $fragmentSpreads': FragmentRefs<'MarkdownEditHistoryViewer_comment'>
  __id?: string
}

export type CommentActionsProps = {
  comment: CommentData
  commentAuthorLogin: string
  editComment: () => void
  onReplySelect: (quotedText?: string) => void
  isMinimized: boolean
  navigate: (url: string) => void
  onMinimize?: (value: boolean) => void
  hideComment: (reason: HIDE_OPTIONS) => void
  unhideComment: () => void
  deleteComment: () => void
  commentRef?: React.RefObject<HTMLDivElement>
  editHistoryComponent?: React.ReactNode
} & SxProp

export function CommentActions({
  comment,
  commentAuthorLogin,
  editComment,
  editHistoryComponent,
  onReplySelect,
  isMinimized = false,
  navigate,
  onMinimize: onMinimized,
  hideComment,
  unhideComment,
  deleteComment,
  commentRef,
}: CommentActionsProps) {
  const [menuOpened, setMenuOpened] = useState(false)
  const [selection, setSelection] = useState<SelectionContext | null>(null)
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false)
  const [isReportContentOpen, setIsReportContentOpen] = useState(false)
  const [isBlockUserFromOrgOpen, setIsBlockUserFromOrgOpen] = useState(false)
  const [isUnblockUserFromOrgOpen, setIsUnblockUserFromOrgOpen] = useState(false)

  const formatBodyAsReference = useCallback(
    (str: string) => {
      return `${str.replace(/^(?!>)/gm, '> ')} \n\n _Originally posted by @${commentAuthorLogin} in [${
        comment.referenceText
      }](${comment.url})_`
    },
    [comment.referenceText, commentAuthorLogin, comment.url],
  )

  const copyToClipboard = () => {
    navigator.clipboard.writeText(comment.url)
  }

  const commentHidden = !!comment.pendingMinimizeReason || comment.isHidden

  const minimizeButton = useMemo(() => {
    return !commentHidden || isMinimized || !comment.viewerCanSeeMinimizeButton ? null : (
      <Button
        sx={{color: 'fg.muted', p: 1}}
        aria-label={'hide comment'}
        variant={'invisible'}
        onClick={() => onMinimized?.(true)}
      >
        <Octicon icon={FoldIcon} />
      </Button>
    )
  }, [commentHidden, isMinimized, onMinimized, comment.viewerCanSeeMinimizeButton])

  const unminimizeButton = useMemo(() => {
    return !commentHidden || !isMinimized || !comment.viewerCanSeeUnminimizeButton ? null : (
      <Button
        sx={{color: 'fg.muted', p: 1}}
        aria-label={'show comment'}
        variant={'invisible'}
        onClick={() => onMinimized?.(false)}
      >
        <Octicon icon={UnfoldIcon} />
      </Button>
    )
  }, [commentHidden, isMinimized, onMinimized, comment.viewerCanSeeUnminimizeButton])

  const reportUrl = useMemo(() => {
    if (!comment.author) return undefined
    const host = ssrSafeWindow?.location.origin
    if (!host) return undefined
    const query = `content_url=${encodeURIComponent(comment.url)}&report=${commentAuthorLogin}+(user)`
    const url = `${host}/contact/report-content?${query}`

    return url
  }, [commentAuthorLogin, comment.author, comment.url])

  const showReportSection = (comment.viewerCanReport || comment.viewerCanReportToMaintainer) && comment.author

  const userCanBlock = canBlock(
    comment.viewerCanBlockFromOrg,
    !!comment.pendingBlock,
    !!comment.pendingUnblock,
    !!comment.author,
  )

  const userCanUnblock = canUnblock(
    comment.viewerCanUnblockFromOrg,
    !!comment.pendingBlock,
    !!comment.pendingUnblock,
    !!comment.author,
  )

  return (
    <>
      {isNewIssueOpen && (
        <CreateIssueDialogEntry
          isCreateDialogOpen={isNewIssueOpen}
          setIsCreateDialogOpen={setIsNewIssueOpen}
          navigate={navigate}
          optionConfig={{
            defaultDisplayMode: DisplayMode.IssueCreation,
            issueCreateArguments: {
              initialValues: {
                body: formatBodyAsReference(comment.body),
              },
              repository: {
                name: comment.repository.name,
                owner: comment.repository.owner.login,
              },
            },
          }}
        />
      )}
      {isReportContentOpen && (
        <ReportContentDialog
          owner={comment.repository.owner.login}
          ownerUrl={comment.repository.owner.url}
          reportUrl={reportUrl}
          contentId={comment.id}
          onClose={() => setIsReportContentOpen(false)}
          contentType={'comment'}
        />
      )}
      {isBlockUserFromOrgOpen && comment.author && (
        <BlockUserFromOrgDialog
          onClose={() => setIsBlockUserFromOrgOpen(false)}
          organization={comment.repository.owner}
          contentId={comment.id}
          contentAuthor={comment.author}
          contentUrl={comment.url}
        />
      )}
      {isUnblockUserFromOrgOpen && comment.author && (
        <UnblockUserFromOrgDialog
          onClose={() => setIsUnblockUserFromOrgOpen(false)}
          organization={comment.repository.owner}
          contentAuthor={comment.author}
          contentId={comment.id}
        />
      )}
      {minimizeButton}
      {unminimizeButton}
      {editHistoryComponent}
      <ActionMenu
        open={menuOpened}
        onOpenChange={(value: boolean) => {
          if (value) {
            const current = window.getSelection()
            if (current && current.anchorNode) {
              setSelection({
                anchorNode: current.anchorNode,
                range: current.getRangeAt(0),
              })
            } else {
              setSelection(null)
            }
          }
          setMenuOpened(value)
        }}
      >
        <ActionMenu.Anchor data-testid={TEST_IDS.commentHeaderHamburger}>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            size="small"
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label="Comment actions"
            sx={{color: 'fg.muted'}}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList data-testid={TEST_IDS.commentHeaderHamburgerOpen}>
            <ActionList.Item onSelect={() => copyToClipboard()}>
              <ActionList.LeadingVisual>
                <LinkIcon />
              </ActionList.LeadingVisual>
              Copy link
            </ActionList.Item>
            <ActionList.Item
              onSelect={() => {
                const newValue = selectQuoteFromComment(commentRef?.current, selection, comment.body)
                onReplySelect(newValue)
              }}
            >
              <ActionList.LeadingVisual>
                <QuoteIcon />
              </ActionList.LeadingVisual>
              Quote reply
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item
              data-testid={TEST_IDS.commentMenuRefComment}
              sx={{width: 'max-content'}}
              onSelect={() => setIsNewIssueOpen(true)}
            >
              <ActionList.LeadingVisual>
                <IssueOpenedIcon />
              </ActionList.LeadingVisual>
              Reference in a new issue
            </ActionList.Item>

            {(comment.viewerCanUpdate || comment.viewerCanMinimize || comment.viewerCanDelete) && (
              <ActionList.Divider />
            )}
            {comment.viewerCanUpdate && (
              <ActionList.Item onSelect={() => editComment()}>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                Edit
              </ActionList.Item>
            )}
            {comment.viewerCanMinimize && !commentHidden && (
              <ActionMenu>
                <ActionMenu.Anchor>
                  <ActionList.Item>
                    <ActionList.LeadingVisual>
                      <EyeClosedIcon />
                    </ActionList.LeadingVisual>
                    Hide
                  </ActionList.Item>
                </ActionMenu.Anchor>

                <ActionMenu.Overlay>
                  <ActionList>
                    <HideCommentActionItems onSelect={hideComment} setMenuOpen={setMenuOpened} />
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            )}
            {comment.viewerCanMinimize && commentHidden && (
              <ActionList.Item onSelect={unhideComment}>
                <ActionList.LeadingVisual>
                  <EyeIcon />
                </ActionList.LeadingVisual>{' '}
                Unhide
              </ActionList.Item>
            )}
            {comment.viewerCanDelete && (
              <ActionList.Item variant="danger" onSelect={deleteComment}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete
              </ActionList.Item>
            )}
            {showReportSection && (
              <>
                <ActionList.Divider />
                {comment.viewerCanReportToMaintainer ? (
                  <ActionList.Item
                    onSelect={() => {
                      setIsReportContentOpen(true)
                    }}
                  >
                    <ActionList.LeadingVisual>
                      <ReportIcon />
                    </ActionList.LeadingVisual>
                    Report content
                  </ActionList.Item>
                ) : (
                  <ActionList.LinkItem href={reportUrl} target="_blank">
                    <ActionList.LeadingVisual>
                      <ReportIcon />
                    </ActionList.LeadingVisual>
                    Report content
                  </ActionList.LinkItem>
                )}
              </>
            )}
            {/* TODO view in stafftools */}
            {(userCanBlock || userCanUnblock) && !showReportSection && <ActionList.Divider />}
            {userCanBlock && (
              <ActionList.Item onSelect={() => setIsBlockUserFromOrgOpen(true)}>
                <ActionList.LeadingVisual>
                  <BlockedIcon />
                </ActionList.LeadingVisual>
                Block user
              </ActionList.Item>
            )}
            {userCanUnblock && (
              <ActionList.Item onSelect={() => setIsUnblockUserFromOrgOpen(true)}>
                <ActionList.LeadingVisual>
                  <BlockedIcon />
                </ActionList.LeadingVisual>
                Unblock user
              </ActionList.Item>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}

function canBlock(viewerCanBlockFromOrg: boolean, pendingBlock: boolean, pendingUnblock: boolean, hasAuthor: boolean) {
  if (!hasAuthor) {
    // Basic requirement for blocking is that there is an author
    return false
  }
  if (pendingBlock) {
    // The user has just blocked from this comment
    return false
  }
  if (pendingUnblock) {
    // The user has just unblocked from this comment
    return true
  }
  return viewerCanBlockFromOrg
}

function canUnblock(
  viewerCanUnblockFromOrg: boolean,
  pendingBlock: boolean,
  pendingUnblock: boolean,
  hasAuthor: boolean,
) {
  if (!hasAuthor) {
    // Basic requirement for unblocking is that there is an author
    return false
  }
  if (pendingUnblock) {
    // The user has just unblocked from this comment
    return false
  }
  if (pendingBlock) {
    // The user has just blocked from this comment
    return true
  }
  return viewerCanUnblockFromOrg
}
