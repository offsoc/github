import {Portal, type PortalProps, sx, type SxProp, themeGet, type TooltipProps} from '@primer/react'
import {clsx} from 'clsx'
import {forwardRef, useSyncExternalStore} from 'react'
import styled from 'styled-components'

/**
 * This file is a copy of the file at: {@link https://github.com/primer/react/blob/main/src/Tooltip.tsx} with
 * some modifications to allow the tooltip to be controlled by the parent component.
 */

const TooltipBase = styled.span<SxProp>`
  &::after {
    position: absolute;
    z-index: 1000000;
    display: none;
    /* stylelint-disable-next-line primer/spacing */
    padding: 0.5em 0.75em;
    font: normal normal 11px/1.5 ${themeGet('fonts.normal')};
    -webkit-font-smoothing: subpixel-antialiased;
    color: ${themeGet('colors.fg.onEmphasis')};
    text-align: center;
    text-decoration: none;
    text-shadow: none;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: break-word;
    white-space: pre;
    pointer-events: none;
    content: attr(data-visible-text);
    background: ${themeGet('colors.neutral.emphasisPlus')};
    border-radius: ${themeGet('radii.2')};
    opacity: 0;
  }
  /* delay animation for tooltip */
  @keyframes tooltip-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  &.tooltipped-open,
  &:hover,
  &:active,
  &:focus {
    &::after {
      display: inline-block;
      text-decoration: none;
      animation-name: tooltip-appear;
      animation-duration: 0.1s;
      animation-fill-mode: forwards;
      animation-timing-function: ease-in;
      animation-delay: 0s;
    }
  }

  &.tooltipped-no-delay.tooltipped-open,
  &.tooltipped-no-delay:hover,
  &.tooltipped-no-delay:active,
  &.tooltipped-no-delay:focus {
    &::after {
      animation-delay: 0s;
    }
  }

  /* Tooltipped south */
  &.tooltipped-s,
  &.tooltipped-se,
  &.tooltipped-sw {
    &::after {
      top: 100%;
      right: 50%;
      /* stylelint-disable-next-line primer/spacing */
      margin-top: 6px;
    }
  }
  &.tooltipped-se {
    &::after {
      right: auto;
      left: 50%;
      margin-left: -${themeGet('space.3')};
    }
  }
  &.tooltipped-sw::after {
    margin-right: -${themeGet('space.3')};
  }
  /* Tooltips above the object */
  &.tooltipped-n,
  &.tooltipped-ne,
  &.tooltipped-nw {
    &::after {
      right: 50%;
      bottom: 100%;
      /* stylelint-disable-next-line primer/spacing */
      margin-bottom: 6px;
    }
  }
  &.tooltipped-ne {
    &::after {
      right: auto;
      left: 50%;
      margin-left: -${themeGet('space.3')};
    }
  }
  &.tooltipped-nw::after {
    margin-right: -${themeGet('space.3')};
  }
  /* Move the tooltip body to the center of the object. */
  &.tooltipped-s::after,
  &.tooltipped-n::after {
    transform: translateX(50%);
  }
  /* Tooltipped to the left */
  &.tooltipped-w {
    &::after {
      right: 100%;
      bottom: 50%;
      /* stylelint-disable-next-line primer/spacing */
      margin-right: 6px;
      transform: translateY(50%);
    }
  }
  /* tooltipped to the right */
  &.tooltipped-e {
    &::after {
      bottom: 50%;
      left: 100%;
      /* stylelint-disable-next-line primer/spacing */
      margin-left: 6px;
      transform: translateY(50%);
    }
  }
  &.tooltipped-align-right-2::after {
    right: 0;
    margin-right: 0;
  }
  &.tooltipped-align-left-2::after {
    left: 0;
    margin-left: 0;
  }
  ${sx};
`

export type ControlledTooltipProps = Omit<TooltipProps, 'children'> & {
  /**
   * Whether the tooltip is open or closed
   */
  open?: boolean
  /**
   * Props passed into the portal
   */
  portalProps?: PortalProps
}

const noop = () => () => undefined
const getServerSideState = () => false
const getClientSideState = () => true
/**
 * An extended `@primer/react` tooltip (based on version 35.21 and prior) which allows for external control
 * using an `open` prop
 */
export const ControlledTooltip = forwardRef<HTMLSpanElement, ControlledTooltipProps>(function ControlledPortalTooltip(
  {direction = 'n', className, text, noDelay, align, wrap, open = false, portalProps = {}, ...rest},
  ref,
) {
  const isClientRender = useSyncExternalStore(noop, getClientSideState, getServerSideState)
  const classes = clsx(
    className,
    `tooltipped-${direction}`,
    align && `tooltipped-align-${align}-2`,
    noDelay && 'tooltipped-no-delay',
    wrap && 'tooltipped-multiline',
    open && 'tooltipped-open',
  )
  if (!isClientRender) return null
  return (
    <Portal {...portalProps}>
      <TooltipBase
        ref={ref}
        role="tooltip"
        aria-label={text}
        data-visible-text={text || rest['aria-label']}
        {...rest}
        sx={{
          position: 'fixed',
          zIndex: 1,
          ...rest.sx,
        }}
        className={classes}
      />
    </Portal>
  )
})
