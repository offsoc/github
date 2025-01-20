import {SidebarCollapseIcon, SidebarExpandIcon} from '@primer/octicons-react'
import {IconButton, Tooltip, type ButtonProps, type TooltipProps} from '@primer/react'
import React from 'react'

interface ExpandButtonProps extends Pick<ButtonProps, 'variant'> {
  expanded?: boolean
  onToggleExpanded: React.MouseEventHandler<HTMLButtonElement>
  testid: string
  alignment: 'left' | 'right'
  ariaLabel: string
  ariaControls: string
  sx?: Record<string, unknown>
  dataHotkey?: string
  className?: string
  tooltipDirection?: TooltipProps['direction']
}

export const ExpandButton = React.forwardRef(
  (
    {
      expanded,
      testid,
      ariaLabel,
      ariaControls,
      onToggleExpanded,
      sx,
      alignment,
      dataHotkey,
      className,
      tooltipDirection,
      variant,
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
        sx={{color: 'fg.muted', ...sx}}
        data-hotkey={dataHotkey}
        onClick={e => {
          onToggleExpanded(e)
        }}
        variant={variant ?? 'invisible'}
        className={className}
      />
    </Tooltip>
  ),
)

ExpandButton.displayName = 'ExpandButton'
