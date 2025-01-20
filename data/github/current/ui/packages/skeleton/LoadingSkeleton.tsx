import {Box, sx, type SxProp, themeGet} from '@primer/react'
import type React from 'react'
import styled, {css, keyframes} from 'styled-components'

export type LoadingSkeletonProps = {
  animationStyle?: 'wave' | 'pulse'
  as?: string | React.ComponentType | undefined
  height?: string
  variant?: 'rectangular' | 'elliptical' | 'rounded' | 'pill' | 'text'
  width?: 'random' | string
} & SxProp

const waveAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`
const waveMixin = css`
  animation: ${waveAnimation} 1.5s infinite linear;
`

const pulseAnimation = keyframes`
  0% {
    opacity: .3;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: .3;
  }
`

const pulseMixin = css`
  animation: ${pulseAnimation} 2s infinite linear;
`

export const LoadingSkeleton = styled(Box)<LoadingSkeletonProps>`
  /* stylelint-disable declaration-block-no-duplicate-properties, color-named */
  position: relative;
  overflow: hidden;
  mask-image: radial-gradient(white, black);
  ${({animationStyle}) => animationStyle === 'pulse' && pulseMixin};
  &::after {
    ${({animationStyle}) => animationStyle !== 'pulse' && waveMixin};
    background: linear-gradient(90deg, transparent, ${themeGet('colors.neutral.subtle')}, transparent);
    content: '';
    position: absolute;
    transform: translateX(-100%); /* Avoid flash during server-side hydration */
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
  background-color: ${themeGet('colors.neutral.subtle')};
  border-radius: ${({theme, variant}) => {
    switch (variant) {
      case 'rounded':
        return themeGet('radii.1')(theme)
      case 'pill':
        return '100px'
      case 'elliptical':
        return '50%'
      default:
        return '0'
    }
  }};
  display: block;
  height: 1.2em;
  ${({variant}) =>
    variant === 'elliptical' && {
      borderRadius: '50%',
    }}
  width: ${({width}) => {
    switch (width) {
      case 'random':
        return `${Math.floor(Math.random() * 40 + 40)}%`
      case 'xl':
        return '32px'
      case 'lg':
        return '24px'
      case 'md':
        return '20px'
      case 'sm':
        return '16px'
      default:
        return width
    }
  }};
  height: ${({height}) => {
    switch (height) {
      case 'xl':
        return '32px'
      case 'lg':
        return '24px'
      case 'md':
        return '20px'
      case 'sm':
        return '16px'
      default:
        return height
    }
  }};
  ${sx}
`
