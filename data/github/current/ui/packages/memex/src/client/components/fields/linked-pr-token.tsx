import {testIdProps} from '@github-ui/test-id-props'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {LinkedPullRequest} from '../../api/common-contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {tokenIconSize} from '../common/avatars-token'
import {ItemState} from '../item-state'

export interface LinkedPullRequestTokenProps
  extends Omit<TokenProps, 'as' | 'href' | 'leadingVisual' | 'text' | 'ref'> {
  linkedPullRequest: LinkedPullRequest
}

export const LinkedPullRequestToken = forwardRef<HTMLAnchorElement, LinkedPullRequestTokenProps>(
  ({linkedPullRequest, sx, ...tokenProps}, ref) => {
    return (
      <Token
        ref={ref}
        as="a"
        href={linkedPullRequest.url}
        target="_blank"
        rel="noreferrer"
        data-hovercard-url={`${linkedPullRequest.url}/hovercard`}
        leadingVisual={() => (
          <ItemState
            isDraft={linkedPullRequest.isDraft}
            state={linkedPullRequest.state}
            type={ItemType.PullRequest}
            size={tokenIconSize(tokenProps.size)}
          />
        )}
        sx={{'&, &:hover': {bg: 'canvas.default'}, ...sx}}
        text={`#${linkedPullRequest.number}`}
        {...testIdProps(`linked-pr-token`)}
        {...tokenProps}
      />
    )
  },
)
LinkedPullRequestToken.displayName = 'LinkedPullRequestToken'
