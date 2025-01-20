import {testIdProps} from '@github-ui/test-id-props'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {ExtendedRepository} from '../../../api/common-contracts'
import {tokenIconSize} from '../../common/avatars-token'
import {RepositoryIcon} from './repository-icon'

interface RepositoryTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text'> {
  repository: ExtendedRepository
  withOwner?: boolean
}

export const RepositoryToken = forwardRef<HTMLElement, RepositoryTokenProps>(
  ({repository, withOwner, ...tokenProps}, ref) => (
    <Token
      leadingVisual={() => <RepositoryIcon repository={repository} size={tokenIconSize(tokenProps.size)} />}
      text={withOwner ? repository.nameWithOwner : repository.name}
      ref={ref}
      {...tokenProps}
      {...testIdProps(`repository-token`)}
    />
  ),
)
RepositoryToken.displayName = 'RepositoryToken'
