import {CheckIcon} from '@primer/octicons-react'
import {ActionList, Label, Octicon} from '@primer/react'
import React from 'react'

import {HighlightedText} from './HighlightedText'

interface RefItemProps {
  href?: string
  isCurrent?: boolean
  isDefault?: boolean
  gitRef: string
  filterText: string
  ariaPosInSet?: number
  ariaSetSize?: number
  onSelect?: (gitRef: string) => void
  onClick?: (gitRef: string) => void
}

export const RefItem = React.memo(function RefItemInner({
  isCurrent,
  isDefault,
  href,
  gitRef,
  filterText,
  ariaPosInSet,
  ariaSetSize,
  onSelect,
  onClick,
}: RefItemProps) {
  const isLinkItem = !!href
  const innerRefItem = (
    <RefItemContent gitRef={gitRef} isDefault={isDefault} isCurrent={isCurrent} filterText={filterText} />
  )

  const commonProps = {
    'aria-checked': isCurrent,
    'aria-posinset': ariaPosInSet,
    'aria-setsize': ariaSetSize,
    sx: {minWidth: 0},
    onSelect: () => onSelect?.(gitRef),
    onClick: () => onClick?.(gitRef),
  }

  return isLinkItem ? (
    <ActionList.LinkItem href={href} role="menuitemradio" {...commonProps}>
      {innerRefItem}
    </ActionList.LinkItem>
  ) : (
    <ActionList.Item {...commonProps}>{innerRefItem}</ActionList.Item>
  )
})

interface RefItemContentProps extends RefItemProps {
  showLeadingVisual?: boolean
}

export const RefItemContent = React.memo(function RefItemInner({
  isCurrent,
  isDefault,
  gitRef,
  filterText,
  showLeadingVisual = true,
}: RefItemContentProps) {
  return (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', minWidth: 0, alignItems: 'flex-end'}}>
        {showLeadingVisual && (
          <Octicon icon={CheckIcon} aria-hidden sx={{pr: 1, visibility: isCurrent ? undefined : 'hidden'}} />
        )}
        <HighlightedText key={gitRef} hideOverflow search={filterText} text={gitRef} />
      </div>
      {isDefault && <Label>default</Label>}
    </div>
  )
})
