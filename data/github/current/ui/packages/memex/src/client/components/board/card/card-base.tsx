import {Box, themeGet} from '@primer/react'
import styled from 'styled-components'

export const CardBase = styled(Box)`
  &:hover {
    border-color: ${themeGet('colors.border.default')};
  }

  /* stylelint-disable-next-line selector-max-specificity */
  body:not(.is-keyboard-moving-card) &:focus-within :not(.js-disable-context-menu).js-context-menu-trigger,
  body:not(.is-keyboard-moving-card) &:focus :not(.js-disable-context-menu).js-context-menu-trigger,
  &:hover :not(.js-disable-context-menu).js-context-menu-trigger {
    opacity: unset;
  }

  /* stylelint-disable-next-line selector-no-qualifying-type, selector-max-specificity */
  body:not(.is-keyboard-moving-card) &:focus,
  body:not(.is-keyboard-moving-card) &.suspended-focus,
  /*
   * Base styles overwrite box-shadow, so we need to add a more specific selector here
   * which overwrites these base styles: [role="button"]:focus:not(:focus-visible):not(.focus-visible)
   */
  body:not(.is-keyboard-moving-card) &.board-view-column-card:focus,
  /* show focus ring around selected focused card when keyboard moving card */
  body.is-keyboard-moving-card &.selected:not(.show-sash):focus {
    outline: none;
    border-color: ${themeGet('colors.accent.emphasis')};

    box-shadow: 0 0 0 1px ${themeGet('colors.accent.emphasis')};
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  body.is-keyboard-moving-card & {
    outline: none;
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  &.selected:not(:focus, .suspended-focus),
  body.is-keyboard-moving-card &.selected {
    outline: none;
    border-color: ${themeGet('colors.accent.emphasis')};
  }
`
