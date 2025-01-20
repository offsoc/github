import {MarkdownEditHistoryViewer} from '@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer'
import {Box, Label, Link, RelativeTime, Text} from '@primer/react'
import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'

import type {IssueBodyHeader$key} from './__generated__/IssueBodyHeader.graphql'
import type {IssueBodyHeaderSecondaryFragment$key} from './__generated__/IssueBodyHeaderSecondaryFragment.graphql'
import {IssueBodyHeaderActions, type IssueBodyHeaderActionsProps} from './IssueBodyHeaderActions'
import {IssueBodyHeaderAuthor} from './IssueBodyHeaderAuthor'

export type IssueBodyHeaderProps = {
  additionalActions?: React.ReactNode
  comment: IssueBodyHeader$key
  url?: string
  isPullRequest?: boolean
  actionProps?: IssueBodyHeaderActionsProps
  secondaryKey?: IssueBodyHeaderSecondaryFragment$key
}

const IssueBodyHeaderSecondaryFragment = graphql`
  fragment IssueBodyHeaderSecondaryFragment on Comment {
    ...MarkdownEditHistoryViewer_comment
  }
`

export function IssueBodyHeader({
  additionalActions,
  comment,
  url,
  isPullRequest,
  actionProps,
  secondaryKey,
}: IssueBodyHeaderProps) {
  const data = useFragment(
    graphql`
      fragment IssueBodyHeader on Comment {
        ...IssueBodyHeaderActions_comment
        createdAt
        viewerDidAuthor
        author {
          ...IssueBodyHeaderAuthor
          ...IssueBodyHeaderActions
        }
      }
    `,
    comment,
  )

  const createdAt = new Date(data.createdAt)
  const secondaryData = useFragment(IssueBodyHeaderSecondaryFragment, secondaryKey) ?? undefined

  return (
    <Box
      sx={{
        backgroundColor: data.viewerDidAuthor ? 'accent.subtle' : 'canvas.subtle',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        borderBottom: '1px solid',
        borderBottomColor: data.viewerDidAuthor ? 'accent.muted' : 'border.muted',
        color: 'fg.muted',
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        fontSize: 1,
        gap: 0,
        py: 2,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          minHeight: 'var(--control-small-size, 28px)',
          display: 'flex',
          justifyContent: 'space-between',
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            px: 3,
            flexGrow: 1,
            flexShrink: 1,
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <IssueBodyHeaderAuthor author={data.author || null} />
          <Box
            as="h3"
            sx={{
              display: 'flex',
              flexDirection: ['column', 'column', 'row', 'row'],
              flexWrap: 'wrap',
              columnGap: 1,
              overflow: 'hidden',
              fontSize: 'unset',
              fontWeight: 'unset',
              margin: 'unset',
            }}
          >
            <IssueBodyHeaderAuthor showLogin author={data.author || null} />
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                fontSize: [0, 1, 1, 1],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Text sx={{fontSize: 'inherit', whiteSpace: 'nowrap', display: ['none', 'inline', 'inline', 'inline']}}>
                {isPullRequest ? 'created' : 'opened'}
              </Text>
              {url ? (
                <Link href={url} sx={{color: 'fg.muted'}} data-testid="issue-body-header-link">
                  <RelativeTime sx={{fontSize: 'inherit'}} date={createdAt}>
                    on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                  </RelativeTime>
                </Link>
              ) : (
                <RelativeTime sx={{fontSize: 'inherit'}} date={createdAt}>
                  on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              )}
              {/** As Pull Request Issue Body Descriptions show Author label to the right of created at date, we need to render this additional label */}
              {isPullRequest && <Label sx={{ml: 2}}>Author</Label>}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            gap: 1,
            pl: [0, 3, 3],
            pr: 2,
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <MarkdownEditHistoryViewer editHistory={secondaryData} />
          {additionalActions}
          {actionProps && data.author && (
            <IssueBodyHeaderActions
              url={actionProps.url}
              comment={data}
              issueBodyRef={actionProps.issueBodyRef}
              onReplySelect={actionProps.onReplySelect}
              startIssueBodyEdit={actionProps.startIssueBodyEdit}
              viewerCanUpdate={actionProps.viewerCanUpdate}
              viewerCanReport={actionProps.viewerCanReport}
              viewerCanReportToMaintainer={actionProps.viewerCanReportToMaintainer}
              viewerCanBlockFromOrg={actionProps.viewerCanBlockFromOrg}
              viewerCanUnblockFromOrg={actionProps.viewerCanUnblockFromOrg}
              issueId={actionProps.issueId}
              owner={actionProps.owner}
              ownerId={actionProps.ownerId}
              ownerUrl={actionProps.ownerUrl}
              author={data.author}
              pendingBlock={actionProps.pendingBlock}
              pendingUnblock={actionProps.pendingUnblock}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
