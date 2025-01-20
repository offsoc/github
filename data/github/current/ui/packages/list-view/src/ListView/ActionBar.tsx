import {ActionBar as GitHubUiActionBar, type ActionBarProps as GitHubUiActionBarProps} from '@github-ui/action-bar'
import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactElement} from 'react'

import densityStyles from '../density-gap.module.css'
import type {StylableProps} from '../types'
import styles from './ActionBar.module.css'
import type {ListViewDensityToggle} from './DensityToggle'

// Require actionsLabel if actions are provided, and vice versa.
type ListViewActionBar =
  | {
      /**
       * Description of the controls found in the action bar, e.g., "Issue actions", "Markdown formatting tools".
       * Will be used in a hidden label for accessibility purposes. Defaults to the title for the ListView.
       */
      actionsLabel: GitHubUiActionBarProps['label']
      /**
       * The controls to show in the action bar. These will move into a dropdown menu when the screen isn't big enough to
       * fit them side by side.
       */
      actions: GitHubUiActionBarProps['actions']
    }
  | {actionsLabel?: undefined; actions?: undefined}

export type ListViewActionBarProps = ListViewActionBar & {
  /**
   * Include a toggle to switch between Comfortable and Condensed view modes.
   */
  densityToggle?: ReactElement<typeof ListViewDensityToggle>
} & StylableProps &
  Omit<GitHubUiActionBarProps, 'actions' | 'label'>

export const ListViewActionBar = ({
  actions,
  style,
  sx,
  className,
  children,
  density,
  actionsLabel,
  densityToggle,
}: ListViewActionBarProps) => {
  const nonCollapsibleActions = (
    <>
      {children}
      {densityToggle}
    </>
  )

  if (actions && actions.length > 0) {
    return (
      <GitHubUiActionBar
        label={actionsLabel?.trim()}
        actions={actions}
        density={density}
        {...testIdProps('list-view-actions')}
        style={style}
        sx={sx}
        className={className}
      >
        {nonCollapsibleActions}
      </GitHubUiActionBar>
    )
  }

  return (
    <Box
      {...testIdProps('list-view-actions')}
      style={style}
      sx={sx}
      className={clsx(styles.container, density && densityStyles[density], className)}
    >
      {nonCollapsibleActions}
    </Box>
  )
}
