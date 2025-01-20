import {BlockUserFromOrgDialog} from '@github-ui/commenting/BlockUserFromOrgDialog'
import {type SelectionContext, selectQuoteFromComment} from '@github-ui/commenting/quotes'
import {ReportContentDialog} from '@github-ui/commenting/ReportContentDialog'
import {UnblockUserFromOrgDialog} from '@github-ui/commenting/UnblockUserFromOrgDialog'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {BlockedIcon, KebabHorizontalIcon, LinkIcon, PencilIcon, QuoteIcon, ReportIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton} from '@primer/react'
import {useMemo, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../constants/labels'
import type {IssueBodyHeaderActions$key} from './__generated__/IssueBodyHeaderActions.graphql'
import type {IssueBodyHeaderActions_comment$key} from './__generated__/IssueBodyHeaderActions_comment.graphql'

export type IssueBodyHeaderActionsProps = {
  url?: string
  issueBodyRef?: React.RefObject<HTMLDivElement>
  onReplySelect?: (quotedText?: string) => void
  startIssueBodyEdit: () => void
  viewerCanUpdate: boolean
  viewerCanReport?: boolean
  viewerCanReportToMaintainer?: boolean
  viewerCanBlockFromOrg?: boolean
  viewerCanUnblockFromOrg?: boolean
  issueId?: string
  owner?: string
  ownerId?: string
  ownerUrl?: string
  pendingBlock?: boolean
  pendingUnblock?: boolean
}

type IssueBodyHeaderActionsInternalProps = IssueBodyHeaderActionsProps & {
  author: IssueBodyHeaderActions$key
  comment: IssueBodyHeaderActions_comment$key
}

export function IssueBodyHeaderActions({
  url,
  issueBodyRef,
  onReplySelect,
  startIssueBodyEdit,
  viewerCanUpdate,
  viewerCanReport,
  viewerCanReportToMaintainer,
  viewerCanBlockFromOrg,
  viewerCanUnblockFromOrg,
  issueId,
  owner,
  ownerId,
  ownerUrl,
  author,
  pendingBlock,
  pendingUnblock,
  comment,
}: IssueBodyHeaderActionsInternalProps) {
  const [menuOpened, setMenuOpened] = useState(false)
  const [selection, setSelection] = useState<SelectionContext | null>(null)
  const [isBlockUserFromOrgOpen, setIsBlockUserFromOrgOpen] = useState(false)
  const [isUnblockUserFromOrgOpen, setIsUnblockUserFromOrgOpen] = useState(false)

  const actorData = useFragment(
    graphql`
      fragment IssueBodyHeaderActions on Actor {
        login
        id
      }
    `,
    author,
  )

  const commentData = useFragment(
    graphql`
      fragment IssueBodyHeaderActions_comment on Comment {
        body
      }
    `,
    comment,
  )

  const reportUrl = useMemo(() => {
    if (!actorData || !url) return undefined
    const host = ssrSafeWindow?.location.origin
    if (!host) return undefined

    const query = `content_url=${encodeURIComponent(url)}&report=${actorData.login}+(user)`
    const reportTargetUrl = `${host}/contact/report-content?${query}`

    return reportTargetUrl
  }, [actorData, url])

  const copyToClipboard = () => {
    if (!url) {
      return
    }
    navigator.clipboard.writeText(url)
  }

  const [isReportContentDialogOpen, setIsReportContentDialogOpen] = useState(false)

  const showReportSection = viewerCanReport || viewerCanReportToMaintainer

  const userCanBlock = canBlock(!!viewerCanBlockFromOrg, !!pendingBlock, !!pendingUnblock)
  const userCanUnblock = canUnblock(!!viewerCanUnblockFromOrg, !!pendingBlock, !!pendingUnblock)

  return (
    <>
      {isReportContentDialogOpen && owner && ownerUrl && issueId && (
        <ReportContentDialog
          owner={owner}
          ownerUrl={ownerUrl}
          reportUrl={reportUrl}
          contentId={issueId}
          onClose={() => setIsReportContentDialogOpen(false)}
          contentType={'issue'}
        />
      )}
      {isBlockUserFromOrgOpen && owner && ownerId && url && issueId && (
        <BlockUserFromOrgDialog
          onClose={() => setIsBlockUserFromOrgOpen(false)}
          organization={{login: owner, id: ownerId}}
          contentId={issueId}
          contentAuthor={{login: actorData.login, id: actorData.id}}
          contentUrl={url}
        />
      )}
      {isUnblockUserFromOrgOpen && owner && ownerId && url && issueId && (
        <UnblockUserFromOrgDialog
          onClose={() => setIsUnblockUserFromOrgOpen(false)}
          organization={{login: owner, id: ownerId}}
          contentAuthor={{login: actorData.login, id: actorData.id}}
          contentId={issueId}
        />
      )}
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
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            size="small"
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label={LABELS.issueBodyHeaderActions}
            sx={{color: 'fg.muted'}}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item onSelect={() => copyToClipboard()}>
              <ActionList.LeadingVisual>
                <LinkIcon />
              </ActionList.LeadingVisual>
              Copy link
            </ActionList.Item>
            <ActionList.Item
              onSelect={() => {
                const newValue = selectQuoteFromComment(issueBodyRef?.current, selection, commentData.body)
                onReplySelect?.(newValue)
              }}
            >
              <ActionList.LeadingVisual>
                <QuoteIcon />
              </ActionList.LeadingVisual>
              Quote reply
            </ActionList.Item>
            {viewerCanUpdate && (
              <>
                <ActionList.Divider />
                <ActionList.Item
                  onSelect={() => {
                    startIssueBodyEdit()
                  }}
                  role={'button'}
                >
                  <ActionList.LeadingVisual>
                    <PencilIcon />
                  </ActionList.LeadingVisual>
                  Edit
                </ActionList.Item>
              </>
            )}
            {userCanBlock && (
              <>
                <ActionList.Divider />
                <ActionList.Item
                  onSelect={() => {
                    setIsBlockUserFromOrgOpen(true)
                  }}
                >
                  <ActionList.LeadingVisual>
                    <BlockedIcon />
                  </ActionList.LeadingVisual>
                  Block user
                </ActionList.Item>
              </>
            )}
            {userCanUnblock && (
              <>
                <ActionList.Divider />
                <ActionList.Item
                  onSelect={() => {
                    setIsUnblockUserFromOrgOpen(true)
                  }}
                >
                  <ActionList.LeadingVisual>
                    <BlockedIcon />
                  </ActionList.LeadingVisual>
                  Unblock user
                </ActionList.Item>
              </>
            )}
            {showReportSection && (
              <>
                <ActionList.Divider />
                {viewerCanReportToMaintainer ? (
                  <ActionList.Item
                    onSelect={() => {
                      setIsReportContentDialogOpen(true)
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
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}

function canBlock(viewerCanBlockFromOrg: boolean, pendingBlock: boolean, pendingUnblock: boolean) {
  if (pendingBlock) {
    // The user has just blocked from this issue
    return false
  }
  if (pendingUnblock) {
    // The user has just unblocked from this issue
    return true
  }
  return viewerCanBlockFromOrg
}

function canUnblock(viewerCanUnblockFromOrg: boolean, pendingBlock: boolean, pendingUnblock: boolean) {
  if (pendingUnblock) {
    // The user has just unblocked from this issue
    return false
  }
  if (pendingBlock) {
    // The user has just blocked from this issue
    return true
  }
  return viewerCanUnblockFromOrg
}
