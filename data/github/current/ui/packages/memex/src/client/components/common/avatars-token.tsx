import {Token, type TokenProps} from '@primer/react'
import type {TokenSizeKeys} from '@primer/react/lib-esm/Token/TokenBase'
import {forwardRef} from 'react'

import MemexAvatarStack, {type MemexAvatarStackItem} from '../memex-avatar-stack'

export interface AvatarsTokenProps extends Omit<TokenProps, 'leadingVisual' | 'ref'> {
  avatars: Array<MemexAvatarStackItem>
}

export const tokenIconSize = (size: TokenSizeKeys = 'medium') =>
  size === 'small' ? 10 : size === 'medium' ? 14 : size === 'large' ? 16 : 24

/**
 * PRC offers an `AvatarToken` component, but it can only show one avatar. This can show up to three in a stack,
 * truncating with a '+X' icon beyond that.
 */
export const AvatarsToken = forwardRef<HTMLElement, AvatarsTokenProps>(({avatars, ...tokenProps}, ref) => (
  <Token
    leadingVisual={() => (
      <MemexAvatarStack
        backgroundSx={{
          backgroundColor: `canvas.default`,
          boxShadow: theme => `0 0 0 2px ${theme.colors.canvas.default} !important`,
        }}
        items={avatars}
        size={tokenIconSize(tokenProps.size) - 1}
        maxVisible={3}
      />
    )}
    ref={ref}
    {...tokenProps}
  />
))
AvatarsToken.displayName = 'AvatarsToken'
