import {isMacOS} from '@github-ui/get-os'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {IconButton, type IconButtonProps, Tooltip, type TooltipProps} from '@primer/react'
import {forwardRef, useCallback} from 'react'

type IconButtonWithTooltipProps = Omit<IconButtonProps, 'aria-label' | 'aria-labelledby'> & {
  /**
   * The accessible button label and tooltip content. This will be the `aria-label` of the
   * button, so it must be succinct and descriptive.
   */
  label: string
  /**
   * String describing the keyboard shortcut to activate this button. This will NOT actually
   * bind the keyboard shortcut; it is only a description. Use the special modifier `Mod` for operating-system
   * independent `Command`/`Control`.
   *
   * Examples of valid shortcuts include:
   *  - `"A"` (use capital letters)
   *  - `"Shift+Space"` (capitalize modifier keys)
   *  - `"Control+Alt+."` (don't abbreviate "Ctrl" or "Cmd")
   *  - `"Mod+Shift+&#39;"` (use the special sequence "Mod" for dynamically
   *    showing "Command" on Mac and "Control" on Windows/Unix)
   *  - `"Alt+Shift+P Mod+F"` (use a space separated list if multiple apply)
   */
  shortcut?: string
  tooltipDirection?: TooltipProps['direction']
  /**
   * Set to true to hide the tooltip.
   */
  hideTooltip?: boolean
  // We don't have a way to override the tooltip content because the `Tooltip` component
  // doesn't suport setting it as the aria-describedby target. So there would be no way
  // for screen readers to access the content.
}

const formatShortcutForDisplay = (shortcut: string) =>
  ` ${shortcut
    .split(' ')
    .map(
      s =>
        `<${s
          .replaceAll('Mod', isMacOS() ? 'Cmd' : 'Ctrl')
          .replaceAll('Command', 'Cmd')
          .replaceAll('Control', 'Ctrl')
          .toLowerCase()}>`,
    )
    .join(' / ')}`

const formatShortcutForAttribute = (shortcut: string) =>
  shortcut.replaceAll('{CMD_CTRL}', isMacOS() ? 'Command' : 'Control')

/**
 * An `IconButton` where the label is accessible to mouse/keyboard users through a tooltip.
 * This is a temporary workaround until Primer adds a tooltip to the `IconButton` component by
 * default (see https://github.com/primer/react/issues/2008).
 */
export const IconButtonWithTooltip = forwardRef<HTMLButtonElement, IconButtonWithTooltipProps>(
  ({label, hideTooltip, icon: Icon, shortcut, sx, tooltipDirection, ...props}, ref) => {
    // The button gets an accessible label from aria-label, so the tooltip is only for the visible label.
    // We don't want the button to have two labels read, so we give the tooltip the presentation role. It's
    // definitely weird to have a presentation role in combination with aria-label, but the Tooltip component
    // requires aria-label as its text so we don't have a choice there. It does seem to work well though.
    const TooltippedIcon = useCallback(() => {
      let tooltipSx: BetterSystemStyleObject = {display: 'flex'}
      if (tooltipDirection?.includes('w')) {
        tooltipSx = {...tooltipSx, pl: 2, ml: -2}
      }
      if (tooltipDirection?.includes('e')) {
        tooltipSx = {...tooltipSx, pr: 2, mr: -2}
      }
      if (tooltipDirection?.includes('s')) {
        tooltipSx = {...tooltipSx, pb: 2, mb: -2}
      }
      if (tooltipDirection?.includes('n') || !tooltipDirection) {
        tooltipSx = {...tooltipSx, pt: 2, mt: -2}
      }
      return !hideTooltip ? (
        <Tooltip
          aria-label={`${label}${shortcut ? formatShortcutForDisplay(shortcut) : ''}`}
          // Apply a known classname so the parent can control the visibility (can only be done through CSS)
          className="icon-button-with-tooltip__tooltip"
          direction={tooltipDirection}
          sx={tooltipSx}
        >
          <Icon />
        </Tooltip>
      ) : (
        <Icon />
      )
    }, [hideTooltip, label, shortcut, tooltipDirection, Icon])

    // The IconButton takes a props-less component as the icon. We can 'trick' it by giving it an argument-less
    // function that returns a component (which is the same thing as a props-less component under the hood).
    return (
      // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip -- We will come back to refactor this. Just adding the disable here to keep zero impact on the current behavior.
      <IconButton
        unsafeDisableTooltip={true}
        ref={ref}
        // The IconButton takes a props-less component as the icon. We can 'trick' it by giving it an argument-less
        // function that returns a component (which is the same thing as a props-less component under the hood).
        icon={TooltippedIcon}
        aria-keyshortcuts={shortcut ? formatShortcutForAttribute(shortcut) : undefined}
        sx={{
          ...sx,
          // Make the tooltip appear when the button is focused or hovered
          // The hover part would work automatically if the tooltip was a wrapper around the button, but
          // then the role=presentation on the tooltip would make the whole button invisible to screen readers
          // Adapted from https://github.com/primer/react/blob/8ce0eb92d23e2d46760e8b77900e10e7c04da43e/src/Tooltip.tsx#L57-L70
          '&:focus-visible, &:hover': {
            '& .icon-button-with-tooltip__tooltip': {
              '&::after, &::before': {
                display: 'inline-block',
                textDecoration: 'none',
                animationName: 'tooltip-appear',
                animationDuration: '0.1s',
                animationFillMode: 'forwards',
                animationTimingFunction: 'ease-in',
              },
            },
          },

          // override delay for focus
          '&:hover .icon-button-with-tooltip__tooltip': {
            '&::after, &::before': {
              animationDelay: '0.4s',
            },
          },
        }}
        {...props}
        aria-label={label}
      />
    )
  },
)

IconButtonWithTooltip.displayName = 'IconButtonWithTooltip'
