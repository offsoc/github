import {ActionBar as GitHubUiActionBar, type ActionBarProps as GitHubUiActionBarProps} from '@github-ui/action-bar'
import {testIdProps} from '@github-ui/test-id-props'
import type {Icon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import {useEffect} from 'react'

import {useListViewItems} from '../ListView/ItemsContext'
import type {StylableProps} from '../types'
import styles from './ActionBar.module.css'

export type ListItemActionBarProps = Omit<GitHubUiActionBarProps, 'label' | 'variant' | 'sx'> &
  StylableProps & {
    /**
     * Override the icon used in the button that opens the action menu. Defaults to KebabHorizontalIcon.
     */
    anchorIcon?: Icon
    label?: GitHubUiActionBarProps['label']
  }

export const ListItemActionBar = ({
  anchorIcon,
  style,
  sx,
  className,
  label = 'list item action bar',
  ...props
}: ListItemActionBarProps) => {
  const {setAnyItemsWithActionBar, setHasResizableActionsWithActionBar} = useListViewItems()
  useEffect(() => setAnyItemsWithActionBar(true), [setAnyItemsWithActionBar])
  useEffect(() => {
    if (props.actions) setHasResizableActionsWithActionBar(true)
  }, [props.actions, setHasResizableActionsWithActionBar])

  return (
    <Box
      className={clsx(styles.container, props.actions && styles.hasActions, className)}
      style={style}
      sx={sx}
      {...testIdProps('list-view-item-action-bar-container')}
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
