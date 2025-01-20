import {IterationsIcon} from '@primer/octicons-react'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {Iteration} from '../../../api/columns/contracts/iteration'
import {tokenIconSize} from '../../common/avatars-token'
import {SanitizedHtml} from '../../dom/sanitized-html'

interface IterationTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text'> {
  iteration: Iteration
}

export const IterationToken = forwardRef<HTMLElement, IterationTokenProps>(({iteration, ...tokenProps}, ref) => (
  <Token
    leadingVisual={() => <IterationsIcon size={tokenIconSize(tokenProps.size)} />}
    text={<SanitizedHtml>{iteration.titleHtml}</SanitizedHtml>}
    ref={ref}
    {...tokenProps}
  />
))
IterationToken.displayName = 'IterationToken'
