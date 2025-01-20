import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {CopilotIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {clsx} from 'clsx'
import type {ComponentProps} from 'react'
import {useRef} from 'react'
import styles from './AskCopilotButton.module.css'

export interface AskCopilotButtonProps
  extends Omit<ComponentProps<typeof IconButton>, 'icon' | 'aria-label' | 'aria-labelledby'> {
  referenceType: string
}

export function AskCopilotButton({children, referenceType, ...props}: AskCopilotButtonProps) {
  const contentRef = useRef<HTMLButtonElement>(null)

  const label = `Ask Copilot about this ${referenceType}`

  const [attrs, portalElement] = usePortalTooltip({
    'aria-label': label,
    contentRef,
    direction: 'sw',
    anchorSide: 'outside-bottom',
  })

  return (
    <>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        className={clsx(styles['square'], !!children && styles['muted'])}
        ref={contentRef}
        icon={CopilotIcon}
        size="small"
        aria-label={label}
        data-testid="copilot-ask-menu"
        {...attrs}
        {...props}
      />
      {portalElement}
    </>
  )
}
