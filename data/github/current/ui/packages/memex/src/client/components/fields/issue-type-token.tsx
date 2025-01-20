import {testIdProps} from '@github-ui/test-id-props'
import {useNamedColor} from '@github-ui/use-named-color'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef} from 'react'

import type {IssueType} from '../../api/common-contracts'

interface IssueTypeTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text'> {
  issueType: IssueType
}

export const IssueTypeToken = forwardRef<HTMLElement, IssueTypeTokenProps>(({issueType, ...tokenProps}, ref) => {
  const {bg, fg, border} = useNamedColor(issueType.color || 'GRAY')
  return (
    <Token
      text={issueType.name}
      ref={ref}
      sx={{backgroundColor: bg, color: fg, borderColor: border}}
      {...tokenProps}
      {...testIdProps(`issue-type-token`)}
    />
  )
})
IssueTypeToken.displayName = 'IssueTypeToken'
