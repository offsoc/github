import {Box, themeGet} from '@primer/react'
import styled from 'styled-components'

export const StyledKeyboardMovingCardPlaceholder = styled(Box)`
  background-color: ${themeGet('colors.accent.emphasis')};
  height: ${themeGet('space.1')};
  border: 0;
  border-radius: var(--borderRadius-medium);
  z-index: 12;
  outline: none;
`
