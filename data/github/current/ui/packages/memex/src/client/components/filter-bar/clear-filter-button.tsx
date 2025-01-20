import {testIdProps} from '@github-ui/test-id-props'
import {XCircleFillIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'

import {Resources} from '../../strings'

type ClearFilterButtonProps = {
  /**
   * An optional handler for click events on the button. If undefined,
   * the button will not be rendered.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>

  /**
   * An optional handler for keydown events on the button
   */
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
}

export const ClearFilterButton = ({onClick, onKeyDown}: ClearFilterButtonProps) => {
  if (!onClick) return null
  return (
    <IconButton
      tooltipDirection="sw"
      variant="invisible"
      onClick={onClick}
      onKeyDown={onKeyDown}
      icon={XCircleFillIcon}
      size="small"
      aria-label={Resources.clearFilter}
      {...testIdProps('clear-filter-query')}
    />
  )
}
