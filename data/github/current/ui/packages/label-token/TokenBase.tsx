// Once https://github.com/github/primer/issues/1142 is fixed this can be removed
import {sx, type SxProp, themeGet} from '@primer/react'
import React from 'react'
import styled from 'styled-components'
import {variant} from 'styled-system'

// TODO: remove invalid "extralarge" size name in next breaking change
/** @deprecated 'extralarge' to be removed to align with size naming ADR https://github.com/github/primer/blob/main/adrs/2022-02-09-size-naming-guidelines.md **/
type ExtraLarge = 'extralarge'
type TokenSizeKeys = 'small' | 'medium' | 'large' | 'xlarge' | ExtraLarge

const xlargeSize = '32px'

const tokenSizes: Record<TokenSizeKeys, string> = {
  small: '16px',
  medium: '20px',
  large: '24px',
  extralarge: xlargeSize,
  xlarge: xlargeSize,
}

export const defaultTokenSize: TokenSizeKeys = 'medium'

export interface TokenBaseProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement | HTMLButtonElement | HTMLAnchorElement>, 'size' | 'id'> {
  as?: 'button' | 'a' | 'span'
  /**
   * The function that gets called when a user clicks the remove button, or keys "Backspace" or "Delete" when focused on the token
   */
  onRemove?: () => void
  /**
   * Whether the remove button should be rendered in the token
   */
  hideRemoveButton?: boolean
  /**
   * Whether the token is selected
   */
  isSelected?: boolean
  /**
   * The text label inside the token
   */
  text: string | React.ReactElement
  /**
   * A unique identifier that can be associated with the token
   */
  id?: number | string
  /**
   * Which size the token will be rendered at
   */
  size?: TokenSizeKeys
  /**
   * Override the default token interaction styles
   */
  interactive?: boolean
}

type TokenElements = HTMLSpanElement | HTMLButtonElement | HTMLAnchorElement

export const isTokenInteractive = ({
  as = 'span',
  onClick,
  onFocus,
  tabIndex = -1,
  interactive,
}: Pick<TokenBaseProps, 'as' | 'onClick' | 'onFocus' | 'tabIndex' | 'interactive'>) =>
  interactive ?? Boolean(onFocus || onClick || tabIndex > -1 || ['a', 'button'].includes(as))

const xlargeVariantStyles = {
  fontSize: 1,
  height: tokenSizes.xlarge,
  lineHeight: tokenSizes.xlarge,
  paddingLeft: 3,
  paddingRight: 3,
  paddingTop: 0,
  paddingBottom: 0,
}

const variants = variant<
  {
    fontSize: number
    height: string
    lineHeight: string
    paddingLeft: number
    paddingRight: number
    paddingTop: number
    paddingBottom: number
  },
  TokenSizeKeys
>({
  prop: 'size',
  variants: {
    small: {
      fontSize: 0,
      height: tokenSizes.small,
      // without setting lineHeight to match height, the "x" appears vertically mis-aligned
      lineHeight: tokenSizes.small,
      paddingLeft: 1,
      paddingRight: 1,
      // need to explicitly set padding top and bottom to "0" to override default `<button>` element styles
      // without setting these, the "x" appears vertically mis-aligned
      paddingTop: 0,
      paddingBottom: 0,
    },
    medium: {
      fontSize: 0,
      height: tokenSizes.medium,
      lineHeight: tokenSizes.medium,
      paddingLeft: 2,
      paddingRight: 2,
      paddingTop: 0,
      paddingBottom: 0,
    },
    large: {
      fontSize: 0,
      height: tokenSizes.large,
      lineHeight: tokenSizes.large,
      paddingLeft: 2,
      paddingRight: 2,
      paddingTop: 0,
      paddingBottom: 0,
    },
    extralarge: xlargeVariantStyles,
    xlarge: xlargeVariantStyles,
  },
})

const StyledTokenBase = styled.span<SxProp>`
  align-items: center;
  /* stylelint-disable-next-line primer/borders */
  border-radius: 999px;
  cursor: ${props => (isTokenInteractive(props) ? 'pointer' : 'auto')};
  display: inline-flex;
  font-weight: ${themeGet('fontWeights.bold')};
  font-family: inherit;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
  ${variants}
  ${sx}
`

// eslint-disable-next-line react/display-name
const TokenBase = React.forwardRef<TokenElements, TokenBaseProps & SxProp>(
  ({text, onRemove, id, ...rest}, forwardedRef) => {
    return (
      <StyledTokenBase
        aria-label={onRemove ? `${text}, press backspace or delete to remove` : undefined}
        id={id?.toString()}
        {...rest}
        ref={forwardedRef}
      />
    )
  },
)

TokenBase.defaultProps = {
  as: 'span',
  size: defaultTokenSize,
}

export default TokenBase
