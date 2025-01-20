import {ActionList, Box} from '@primer/react'

import type {RefSelectorFooterProps} from './RefSelector'

export function RefSelectorFooter({text, onClick, href, sx}: RefSelectorFooterProps) {
  const isLinkItem = !!href
  const innerContent = <Box sx={{...sx}}>{text}</Box>

  const commonProps = {
    sx: {minWidth: 0},
  }

  return isLinkItem ? (
    <ActionList.LinkItem role="link" href={href} onClick={() => onClick?.()} {...commonProps}>
      {innerContent}
    </ActionList.LinkItem>
  ) : (
    <ActionList.Item role="button" onSelect={() => onClick?.()} {...commonProps}>
      {innerContent}
    </ActionList.Item>
  )
}
