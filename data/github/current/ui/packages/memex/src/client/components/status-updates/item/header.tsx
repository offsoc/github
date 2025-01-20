import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'
import {KebabHorizontalIcon, LinkIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, IconButton, Label, Link, RelativeTime, Text, useConfirm} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {ReactNode} from 'react'
import {useCallback, useRef} from 'react'

import type {MemexStatus} from '../../../api/memex/contracts'
import {StatusUpdateDestroy} from '../../../api/stats/contracts'
import {getInitialState} from '../../../helpers/initial-state'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useStatusUpdates} from '../../../state-providers/status-updates/status-updates-context'
import {StatusUpdatesResources} from '../../../strings'

type ItemOptionsProps = {
  handleOnEditClick: () => void
  status: MemexStatus
}

const CreatorLink = ({creator, children}: {creator: MemexStatus['creator']; children: ReactNode}) => {
  return (
    <Link
      href={`/${creator.login}`}
      data-hovercard-url={userHovercardPath({owner: creator.login})}
      sx={{
        color: 'fg.default',
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  )
}

const ItemOptions = ({status, handleOnEditClick}: ItemOptionsProps) => {
  const {deleteStatusUpdate} = useStatusUpdates()
  const {hasWritePermissions} = ViewerPrivileges()
  const contentRef = useRef<HTMLButtonElement>(null)
  const confirm = useConfirm()
  const {postStats} = usePostStats()
  const {loggedInUser} = getInitialState()

  const onDeleteStatus = useCallback(async () => {
    if (!hasWritePermissions) {
      return
    }

    if (
      await confirm({
        title: StatusUpdatesResources.confirmDeleteTitle,
        content: StatusUpdatesResources.confirmDeleteBody,
        confirmButtonType: 'danger',
        confirmButtonContent: 'Delete',
      })
    ) {
      deleteStatusUpdate(status.id)
      postStats({
        name: StatusUpdateDestroy,
        context: JSON.stringify({
          id: status.id,
        }),
      })
    }
  }, [confirm, deleteStatusUpdate, hasWritePermissions, postStats, status.id])

  const onCopyLink = useCallback(() => {
    try {
      const {origin, pathname} = window.location
      const url = `${origin}${pathname}?pane=info&statusUpdateId=${status.id}`
      navigator.clipboard.writeText(url)
    } catch (error) {
      // ignore error when user did not grant clipboard access
    }
  }, [status.id])

  return (
    <Box
      sx={{
        gap: 1,
        pl: [0, 3, 3],
        pr: 2,
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}
    >
      <ActionMenu anchorRef={contentRef}>
        <ActionMenu.Anchor>
          <IconButton variant="invisible" aria-label="Status update options" icon={KebabHorizontalIcon} size="medium" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item onSelect={onCopyLink}>
              <ActionList.LeadingVisual>
                <LinkIcon />
              </ActionList.LeadingVisual>
              Copy link
            </ActionList.Item>
            {hasWritePermissions &&
              (!loggedInUser?.isSpammy || (loggedInUser?.isSpammy && status.creator.login === loggedInUser?.login)) && (
                <>
                  <ActionList.Item onSelect={handleOnEditClick}>
                    <ActionList.LeadingVisual>
                      <PencilIcon />
                    </ActionList.LeadingVisual>
                    Edit
                  </ActionList.Item>
                  <ActionList.Item variant="danger" onSelect={onDeleteStatus}>
                    <ActionList.LeadingVisual>
                      <TrashIcon />
                    </ActionList.LeadingVisual>
                    Delete
                  </ActionList.Item>
                </>
              )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}

const statusUpdateItemHeaderStyle: BetterSystemStyleObject = {
  backgroundColor: 'canvas.subtle',
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  borderBottom: '1px solid',
  borderBottomColor: 'border.muted',
  color: 'fg.muted',
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  fontSize: 1,
  gap: 0,
  py: 1,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  overflow: 'hidden',
  height: '41px',
}

export const StatusUpdateItemHeader = ({status, handleOnEditClick}: ItemOptionsProps) => {
  const {creator, updatedAt} = status
  const {loggedInUser} = getInitialState()

  return (
    <Box sx={statusUpdateItemHeaderStyle}>
      <Box
        sx={{
          display: 'flex',
          px: 2,
          flexGrow: 1,
          flexShrink: 1,
          flexDirection: 'row',
          gap: 2,
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Box sx={{display: 'block'}}>
          <CreatorLink creator={creator}>
            <GitHubAvatar src={creator.avatarUrl} size={24} sx={{mr: 1}} alt={`@${creator.login}`} />
          </CreatorLink>
        </Box>
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
          <CreatorLink creator={creator}>{creator.login}</CreatorLink>
          {status.userHidden && loggedInUser?.login !== creator.login && <Label variant="danger">Spammy</Label>}
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
              updated
            </Text>
            <Link href={`?pane=info&statusUpdateId=${status.id}`} sx={{color: 'fg.muted'}}>
              <RelativeTime sx={{fontSize: 'inherit'}} datetime={updatedAt} />
            </Link>
          </Box>
        </Box>
      </Box>
      <ItemOptions status={status} handleOnEditClick={handleOnEditClick} />
    </Box>
  )
}
