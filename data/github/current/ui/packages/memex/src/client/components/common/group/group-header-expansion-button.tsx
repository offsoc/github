import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {IconButton, type IconButtonProps} from '@primer/react'

export function GroupHeaderExpansionButton({
  onCollapseToggle,
  isCollapsed,
  expandCollapseLabel,
  ...rest
}: {
  onCollapseToggle: () => void
  isCollapsed: boolean
  expandCollapseLabel: string
} & Partial<Omit<IconButtonProps, 'aria-labelledby'>>) {
  return (
    <IconButton
      variant="invisible"
      size="small"
      onClick={onCollapseToggle}
      sx={{
        color: 'fg.muted',
        '&:hover, > svg:hover, > span:hover': {
          color: 'accent.fg',
          textDecoration: 'none',
        },
      }}
      icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
      {...rest}
      aria-label={expandCollapseLabel}
    />
  )
}
