import {ActionBar as GitHubUiActionBar, type ActionBarProps as GitHubUiActionBarProps} from '@github-ui/action-bar'
import {testIdProps} from '@github-ui/test-id-props'
import type {Icon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {useEffect, useRef} from 'react'

import {useNestedListViewItems} from '../context/ItemsContext'
import styles from './ActionBar.module.css'
import {useSuppressActions} from './hooks/use-suppress-actions'

export type NestedListItemActionBarProps = Omit<GitHubUiActionBarProps, 'label' | 'variant'> & {
  /**
   * Override the icon used in the button that opens the action menu. Defaults to KebabHorizontalIcon.
   */
  anchorIcon?: Icon
  label?: GitHubUiActionBarProps['label']
  sx?: BetterSystemStyleObject
  className?: string
}

export function NestedListItemActionBar({
  anchorIcon,
  sx,
  label = 'list item action bar',
  className,
  ...props
}: NestedListItemActionBarProps) {
  const actionBarContainerRef = useRef<HTMLDivElement>(null)
  const {setAnyItemsWithActionBar, setHasResizableActionsWithActionBar} = useNestedListViewItems()
  useEffect(() => setAnyItemsWithActionBar(true), [setAnyItemsWithActionBar])
  useEffect(() => {
    if (props.actions) setHasResizableActionsWithActionBar(true)
  }, [props.actions, setHasResizableActionsWithActionBar])

  useSuppressActions(actionBarContainerRef)

  return (
    <Box
      ref={actionBarContainerRef}
      aria-hidden="true"
      className={clsx(styles.container, !props.actions && styles.withoutActions, className)}
      sx={sx}
      {...testIdProps('nested-list-view-item-action-bar-container')}
    >
      <GitHubUiActionBar
        {...props}
        label={label}
        variant="menu"
        overflowMenuToggleProps={anchorIcon ? {icon: anchorIcon} : undefined}
      />
    </Box>
  )
}
