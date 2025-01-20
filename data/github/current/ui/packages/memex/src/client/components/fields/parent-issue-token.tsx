import {testIdProps} from '@github-ui/test-id-props'
import {Box, Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {ParentIssue} from '../../api/common-contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {useOpenParentIssue} from '../../features/sub-issues/use-open-parent-issue'
import {tokenIconSize} from '../common/avatars-token'
import {ItemState} from '../item-state'

export interface ParentIssueTokenProps extends Omit<TokenProps, 'href' | 'leadingVisual' | 'text' | 'ref'> {
  parentIssue: ParentIssue | undefined
}

export const ParentIssueToken = forwardRef<HTMLElement, ParentIssueTokenProps>(
  ({parentIssue, sx, as = 'a', ...tokenProps}, ref) => {
    const {openParentIssue} = useOpenParentIssue()

    if (!parentIssue) return null

    return (
      <Box sx={{alignItems: 'center', overflow: 'hidden', flex: '1', height: '20px', display: 'flex'}}>
        <Token
          onClick={() => openParentIssue(parentIssue)}
          ref={ref}
          as={as}
          target="_blank"
          rel="noreferrer"
          data-hovercard-url={`${parentIssue.url}/hovercard`}
          data-hovercard-type="issue"
          leadingVisual={() => (
            <ItemState
              isDraft={false}
              state={parentIssue.state}
              stateReason={parentIssue.stateReason}
              type={ItemType.Issue}
              size={tokenIconSize(tokenProps.size)}
            />
          )}
          sx={{'&, &:hover': {bg: 'canvas.default'}, ...sx}}
          text={`${parentIssue.title} #${parentIssue.number}`}
          {...testIdProps(`parent-issue-token`)}
          {...tokenProps}
        />
      </Box>
    )
  },
)
ParentIssueToken.displayName = 'ParentIssueToken'
