import {
  CheckCircleFillIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleIcon,
  DotFillIcon,
  type Icon,
  QuestionIcon,
  XCircleFillIcon,
  XCircleIcon,
  XIcon,
} from '@primer/octicons-react'
import {Button, type ButtonProps, IconButton, Octicon, Tooltip} from '@primer/react'
import {useId, useRef, useState} from 'react'
import {clsx} from 'clsx'

import type {CombinedStatusResult} from './index'
import {CheckStatusDialog} from './CheckStatusDialog'

interface ChecksStatusBadgeProps {
  statusRollup: string
  combinedStatus?: CombinedStatusResult
  variant?: 'circled' | 'filled' | 'default'
  onWillOpenPopup?: () => void
  disablePopover?: boolean
  buttonSx?: ButtonProps['sx']
  size?: ButtonProps['size']
  descriptionText?: string
}

interface IconProps {
  icon: Icon
  iconColor: string
}

const ICON_STYLE = {
  success: {
    circled: CheckCircleIcon,
    filled: CheckCircleFillIcon,
    default: CheckIcon,
    color: 'var(--bgColor-success-emphasis, var(--color-success-emphasis))',
  },
  pending: {
    circled: CircleIcon,
    filled: DotFillIcon,
    default: DotFillIcon,
    color: 'var(--bgColor-attention-emphasis, var(--color-scale-yellow-4))',
  },
  failure: {
    circled: XCircleIcon,
    filled: XCircleFillIcon,
    default: XIcon,
    color: 'var(--bgColor-danger-emphasis, var(--color-scale-red-4))',
  },
  error: {
    circled: QuestionIcon,
    filled: QuestionIcon,
    default: QuestionIcon,
    color: 'var(--fgColor-muted, var(--color-canvas-subtle))',
  },
}

interface IconOnlyStatusProps extends IconProps {
  className?: string
  descriptionText?: string
  tooltipText?: string
}

function IconOnlyStatus({className, descriptionText, icon, iconColor, tooltipText}: IconOnlyStatusProps) {
  const tooltipId = useId()

  let iconElement = (
    <Octicon
      aria-labelledby={tooltipText ? tooltipId : undefined}
      icon={icon}
      aria-label={tooltipText ? undefined : descriptionText ? descriptionText : 'See all checks'}
      sx={{color: iconColor}}
    />
  )

  if (tooltipText) {
    iconElement = (
      <Tooltip id={tooltipId} aria-label={tooltipText} direction="e">
        {iconElement}
      </Tooltip>
    )
  }

  return (
    <span className={clsx(className, 'd-flex flex-items-center gap-1')} data-testid="checks-status-badge-icon-only">
      {iconElement}
      {descriptionText && <span> {descriptionText}</span>}
    </span>
  )
}

export function ChecksStatusBadge(props: ChecksStatusBadgeProps) {
  const {
    statusRollup,
    combinedStatus,
    variant = 'default',
    disablePopover,
    buttonSx,
    size = 'medium',
    descriptionText = '',
    onWillOpenPopup: fetchData,
  } = props
  const [isOpen, setIsOpen] = useState(false)
  const tooltipId = useId()
  const checkButtonRef = useRef<HTMLButtonElement>(null)
  const iconStyle = ICON_STYLE[statusRollup as keyof typeof ICON_STYLE]
  const {icon, iconColor} = {
    icon: iconStyle?.[variant] || ICON_STYLE.error[variant],
    iconColor: iconStyle?.color || ICON_STYLE.error.color,
  }

  if (statusRollup === 'error') {
    return (
      <IconOnlyStatus
        className={!disablePopover ? 'p-1' : undefined}
        descriptionText="?/?"
        icon={icon}
        iconColor={iconColor}
        tooltipText="There was an error retrieving checks status"
      />
    )
  }

  if (disablePopover) {
    return <IconOnlyStatus descriptionText={descriptionText} icon={icon} iconColor={iconColor} />
  }

  return (
    <>
      {descriptionText ? (
        <Button
          data-testid="checks-status-badge-button"
          leadingVisual={icon}
          variant="invisible"
          size={size}
          aria-label={combinedStatus?.checksStatusSummary ?? `Status checks: ${statusRollup}`}
          sx={{
            p: 1,
            color: 'fg.default',
            fontWeight: 'normal',
            svg: {color: iconColor},
            ...buttonSx,
          }}
          ref={checkButtonRef}
          onClick={() => {
            fetchData?.()
            setIsOpen(true)
          }}
        >
          {descriptionText}
        </Button>
      ) : (
        <Tooltip
          id={tooltipId}
          aria-label={combinedStatus?.checksStatusSummary ?? statusRollup}
          direction="se"
          sx={{mr: 2}}
        >
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            data-testid="checks-status-badge-icon"
            icon={icon}
            variant="invisible"
            size={size}
            aria-labelledby={tooltipId}
            sx={{
              py: 0,
              px: 0,
              svg: {color: iconColor},
              ':hover:not([disabled])': {bg: 'pageHeaderBg'},
              ...buttonSx,
            }}
            ref={checkButtonRef}
            onClick={() => {
              fetchData?.()
              setIsOpen(true)
            }}
          />
        </Tooltip>
      )}
      {isOpen && (
        <CheckStatusDialog
          combinedStatus={combinedStatus}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false)
            setTimeout(() => {
              checkButtonRef.current?.focus()
            }, 0)
          }}
        />
      )}
    </>
  )
}
