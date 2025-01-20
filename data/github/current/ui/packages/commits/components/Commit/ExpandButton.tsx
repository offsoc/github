import {SidebarCollapseIcon, SidebarExpandIcon} from '@primer/octicons-react'
import {IconButton, Tooltip, type TooltipProps} from '@primer/react'
import {clsx} from 'clsx'
import React from 'react'

interface ExpandButtonProps {
  expanded?: boolean
  onToggleExpanded: React.MouseEventHandler<HTMLButtonElement>
  testid: string
  alignment: 'left' | 'right'
  ariaLabel: string
  ariaControls: string
  dataHotkey?: string
  className?: string
  tooltipDirection?: TooltipProps['direction']
}

// TODO - copied from React Shared, need to move it out to its own package
export const ExpandButton = React.forwardRef(
  (
    {
      expanded,
      testid,
      ariaLabel,
      ariaControls,
      onToggleExpanded,
      alignment,
      dataHotkey,
      className,
      tooltipDirection,
    }: ExpandButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => (
    <Tooltip aria-label={ariaLabel} id={`expand-button-${testid}`} direction={tooltipDirection}>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        ref={ref}
        data-testid={expanded ? `collapse-${testid}` : `expand-${testid}`}
        aria-labelledby={`expand-button-${testid}`}
        aria-expanded={expanded}
        aria-controls={ariaControls}
        icon={
          expanded
            ? alignment === 'left'
              ? SidebarExpandIcon
              : SidebarCollapseIcon
            : alignment === 'left'
              ? SidebarCollapseIcon
              : SidebarExpandIcon
        }
        data-hotkey={dataHotkey}
        onClick={e => {
          onToggleExpanded(e)
        }}
        variant="invisible"
        className={clsx(className, 'fgColor-muted')}
      />
    </Tooltip>
  ),
)

ExpandButton.displayName = 'ExpandButton'
