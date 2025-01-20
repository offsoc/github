import {Box, IssueLabelToken} from '@primer/react'
import type {IssueLabelTokenProps} from '@primer/react/lib-esm/Token/IssueLabelToken'
import {forwardRef} from 'react'

import type {Label} from '../../api/common-contracts'
import {SanitizedHtml} from '../dom/sanitized-html'

interface LabelTokenProps extends Omit<IssueLabelTokenProps, 'text' | 'fillColor' | 'label' | 'ref'> {
  label: Label
}

export const LabelToken = forwardRef<HTMLAnchorElement, LabelTokenProps>(({label, ...tokenProps}, ref) => (
  <IssueLabelToken
    text={<SanitizedHtml>{label.nameHtml}</SanitizedHtml>}
    fillColor={`#${label.color}`}
    ref={ref}
    {...tokenProps}
  />
))
LabelToken.displayName = 'LabelToken'

export const LabelDecorator = ({color}: {color: string}) => {
  return (
    <Box
      sx={{
        width: 16,
        height: 16,
        borderRadius: 8,
        flexShrink: 0,
        bg: `#${color}`,
        borderColor: `#${color}`,
      }}
    />
  )
}
