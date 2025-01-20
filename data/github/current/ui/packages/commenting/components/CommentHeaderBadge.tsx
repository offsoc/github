import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {Label, type LabelProps} from '@primer/react'
import React from 'react'

type Props = LabelProps & {
  label: string
  ariaLabel: string
  testId: string
  viewerDidAuthor?: boolean
  leadingElement?: React.ReactNode
}

export const CommentHeaderBadge: React.FC<Props> = ({
  label,
  ariaLabel,
  testId,
  viewerDidAuthor,
  variant,
  leadingElement,
}: Props) => {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [buttonContentProps, buttonTooltipElement] = usePortalTooltip({
    contentRef,
    'aria-label': ariaLabel,
  })
  return (
    <Label
      variant={variant || 'secondary'}
      data-testid={testId}
      aria-label={ariaLabel}
      ref={contentRef}
      sx={viewerDidAuthor ? {borderColor: 'accent.muted'} : {}}
      {...buttonContentProps}
    >
      {leadingElement}
      {label}
      {buttonTooltipElement}
    </Label>
  )
}
