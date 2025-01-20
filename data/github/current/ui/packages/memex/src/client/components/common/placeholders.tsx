import {themeGet} from '@primer/react'
import styled, {css, keyframes} from 'styled-components'
import {space, type SpaceProps} from 'styled-system'

const colorStep1 = themeGet('colors.neutral.subtle')
const colorStep2 = themeGet('colors.neutral.muted')

const shimmer = keyframes`
  from {
    background-position: -200px 0;
  }

  to {
    background-position: 200px 0;
  }
`

const animation = css`
  background-image: linear-gradient(
    to right,
    ${colorStep1} 0%,
    ${colorStep2} 40%,
    ${colorStep1} 50%,
    ${colorStep1} 100%
  );
  background-color: ${themeGet('colors.border.muted')};
  background-size: 200px 50px;
  animation: ${shimmer} 1.5s linear infinite;
`

type PlaceholderSizeProps = {
  minWidth: number
  maxWidth: number
}

export const TextPlaceholder = styled.div<PlaceholderSizeProps & SpaceProps>`
  display: inline-block;
  width: ${props => props.minWidth + Math.floor(Math.random() * (props.maxWidth - props.minWidth))}px;
  height: 4px;
  border-radius: var(--borderRadius-medium);
  ${animation}
  ${space}
`

export const PillPlaceholder = styled.div<PlaceholderSizeProps & SpaceProps>`
  --width: ${props => props.minWidth + Math.floor(Math.random() * (props.maxWidth - props.minWidth))}px;
  display: inline-block;
  width: var(--width);
  height: 14px;
  /* stylelint-disable-next-line primer/borders */
  border-radius: 100px;
  ${animation}
  ${space}
`

export const AvatarPlaceholder = styled.div<SpaceProps>`
  display: inline-block;
  width: 20px;
  height: 20px;
  /* stylelint-disable-next-line primer/borders */
  border-radius: 20px;
  ${animation}
  ${space}
`
