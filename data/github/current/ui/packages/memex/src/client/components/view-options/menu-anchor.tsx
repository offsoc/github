import {testIdProps} from '@github-ui/test-id-props'
import {GearIcon, TriangleDownIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, useImperativeHandle, useRef} from 'react'

import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useViews} from '../../hooks/use-views'
import {useUserNotices} from '../../state-providers/user-notices/user-notices-provider'
import {PotentiallyDirty} from '../potentially-dirty'

type MenuAnchorProps = Omit<React.HTMLAttributes<HTMLElement>, 'aria-labelledby'> & {
  viewName: string
  open: boolean
}

export const menuAnchorStyle: BetterSystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 0,
  py: 0,
  height: 18,
  width: 18,
}

export const DirtyConfigIcon = ({isViewStateDirty}: {isViewStateDirty: boolean}) => {
  return (
    <DirtyViewIndicator isViewStateDirty={isViewStateDirty}>
      <GearIcon />
    </DirtyViewIndicator>
  )
}
export const DirtyViewIndicator = ({
  isViewStateDirty,
  children,
  onClick,
}: React.PropsWithChildren<{
  onClick?: React.MouseEventHandler<HTMLElement> | undefined
  isViewStateDirty: boolean
}>) => {
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty
      isDirty={isViewStateDirty}
      hideDirtyState={!hasWritePermissions}
      onClick={onClick}
      {...(isViewStateDirty ? testIdProps('view-options-dirty') : undefined)}
    >
      {children}
    </PotentiallyDirty>
  )
}
export const MenuAnchor = forwardRef<HTMLButtonElement, MenuAnchorProps>(function MenuAnchor(props, forwardedRef) {
  const {isViewStateDirty} = useViews()
  const {userNotices} = useUserNotices()

  const contentRef = useRef<HTMLAnchorElement>(null)
  useImperativeHandle<HTMLSpanElement | null, HTMLSpanElement | null>(forwardedRef, () => contentRef.current)

  return (
    <DirtyViewIndicator isViewStateDirty={isViewStateDirty} onClick={props.onClick}>
      <IconButton
        // User notices can be anchored to the view menu button. If one is present, prevent the tooltip from overlapping.
        tooltipDirection={userNotices.memex_issue_types_rename_prompt ? 'nw' : 'sw'}
        {...props}
        ref={contentRef}
        icon={TriangleDownIcon}
        sx={menuAnchorStyle}
        aria-label={`View options for ${props.viewName}`}
        {...testIdProps('view-options-menu-toggle')}
      />
    </DirtyViewIndicator>
  )
})
