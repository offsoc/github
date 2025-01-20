import {InfoIcon} from '@primer/octicons-react'
import {Box, Button, Heading, Octicon, Text} from '@primer/react'
import {useCallback, useRef} from 'react'

import {boxShadowBorder} from '../../helpers/box-shadow-border'
import {getColumnWarning} from '../../helpers/get-column-warning'
import {useThemedMediaUrl} from '../../helpers/media-urls'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {useUserNotices} from '../../state-providers/user-notices/user-notices-provider'
import {useViewOptionsMenuRef} from '../../state-providers/view-options/use-view-options-menu-ref'
import {UserNoticeResources} from '../../strings'
import {MemexIssueTypeRenameDialog} from './memex-issue-type-rename-dialog'
import {UserNoticePopover} from './user-notice-popover'

const imageSx = {
  borderRadius: '6px',
  width: '276px',
  height: '183px',
  boxShadow: (theme: FixMeTheme) => boxShadowBorder({size: '1px', color: theme.colors.border.default}),
}

export const MemexIssueTypeRenamePopover = ({
  anchorRef,
}: {
  anchorRef: React.MutableRefObject<HTMLDivElement | null>
}) => {
  const {hasAdminPermissions} = ViewerPrivileges()
  const popoverImage = useThemedMediaUrl('issueTypes', 'popover')

  const {allColumns} = useAllColumns()
  const {userNotices, dismissUserNotice, setUserNoticeVariant, userNoticeVariants} = useUserNotices()
  const getStartedButtonRef = useRef<HTMLButtonElement | null>(null)
  const {anchorRef: triggerRef} = useViewOptionsMenuRef()

  const userDefinedTypeColumn = allColumns.find(
    column => column.name.toLowerCase().trim() === 'type' && column.userDefined === true,
  )

  const columnWarning = userDefinedTypeColumn && getColumnWarning(userDefinedTypeColumn)
  const onDismiss = useCallback(
    (tookAction = false) => {
      dismissUserNotice('memex_issue_types_rename_prompt', tookAction)
      triggerRef.current?.focus()
    },
    [dismissUserNotice, triggerRef],
  )

  const onGetStarted = useCallback(() => {
    setUserNoticeVariant('memex_issue_types_rename_prompt', 'modal')
  }, [setUserNoticeVariant])

  const onRenameDialogCancel = useCallback(() => {
    setUserNoticeVariant('memex_issue_types_rename_prompt', 'unset')
    setTimeout(() => getStartedButtonRef?.current?.focus(), 250)
  }, [setUserNoticeVariant])

  // memex_issue_types_rename_prompt notice should not be returned in JSON island if these conditions are false,
  // however, this check is included for added safety.
  if (!userDefinedTypeColumn || !hasAdminPermissions) return null
  if (!userNotices.memex_issue_types_rename_prompt) return null
  if (columnWarning !== 'rename-custom-type-column') return null

  const isRenameDialogOpen = userNoticeVariants.memex_issue_types_rename_prompt === 'modal'

  return (
    <>
      {isRenameDialogOpen ? (
        <MemexIssueTypeRenameDialog
          column={userDefinedTypeColumn}
          onCancel={onRenameDialogCancel}
          onConfirm={() => onDismiss(true)}
        />
      ) : (
        <UserNoticePopover anchorRef={anchorRef} imageToLoad={popoverImage}>
          <Heading as="h2" sx={{fontSize: 1, fontWeight: 'bold'}}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Octicon size={14} icon={InfoIcon} sx={{color: 'accent.fg', mr: 2}} />
              {UserNoticeResources.IssueTypeRenamePopover.title}
            </Box>
          </Heading>
          <Text sx={{mt: 2}} as="p">
            {UserNoticeResources.IssueTypeRenamePopover.description(userDefinedTypeColumn.name)}
          </Text>
          <Box as="img" src={popoverImage} sx={imageSx} alt={UserNoticeResources.IssueTypeRenamePopover.altText} />
          <Box sx={{fontSize: 1, mt: 3, display: 'flex', justifyContent: 'flex-start', gap: 2}}>
            <Button ref={getStartedButtonRef} onClick={onGetStarted}>
              {UserNoticeResources.IssueTypeRenamePopover.actionPrimary}
            </Button>
            <Button variant="invisible" onClick={() => onDismiss()}>
              {UserNoticeResources.IssueTypeRenamePopover.actionSecondary}
            </Button>
          </Box>
        </UserNoticePopover>
      )}
    </>
  )
}
