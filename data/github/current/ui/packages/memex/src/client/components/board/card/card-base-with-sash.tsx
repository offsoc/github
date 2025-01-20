import {themeGet} from '@primer/react'
import styled from 'styled-components'

import {CardBase} from './card-base'

/**
 * This component adds "sash" styles to the `CardBase` component.
 *
 * A "sash" is basically a thick blue horizontal bar displayed on top or bottom of a card.
 * It is displayed either when another card is being dragged or moved by keyboard and the current card is a possible
 * drop target.
 *
 * The sashes are built using pseudo-elements (:after & :before).
 * They are absolutely positioned relative to the card and their visibility and position
 * are controlled via the card's classes.
 */
export const CardBaseWithSash = styled(CardBase)`
  position: relative;

  &::after,
  &::before {
    content: '';
    display: none;
    position: absolute;
    width: 100%;
    background-color: ${themeGet('colors.accent.emphasis')};
    height: ${themeGet('space.1')};
    border: 0;
    border-radius: var(--borderRadius-medium);
    z-index: 12;
  }

  &.show-sash-card.show-sash-after {
    &::after {
      /* stylelint-disable-next-line primer/spacing */
      bottom: -7px;
      display: block;
    }
  }

  &.show-sash-card.show-sash-before {
    &::before {
      /* stylelint-disable-next-line primer/spacing */
      top: -7px;
      display: block;
    }
  }

  &.show-sash-card.show-sash-before:first-child {
    &::before {
      top: 0;
    }
  }
`
