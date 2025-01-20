import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, ButtonGroup, IconButton} from '@primer/react'
import {clsx} from 'clsx'
import {useRef, useState} from 'react'
import {DiffLinesAskCopilotButton} from '../shared/DiffLinesAskCopilotButton'
import styles from './DiffLinesMenu.module.css'
import {DiffLinesExplainMenuItem} from '../shared/DiffLinesExplainMenuItem'
import {DiffLinesAttachMenuItem} from '../shared/DiffLinesAttachMenuItem'

export interface DiffLinesMenuProps {
  fileDiffReference: FileDiffReference
  style?: React.CSSProperties
  onOpenChange?: (open: boolean) => void
}

export const DiffLinesMenu = ({fileDiffReference, onOpenChange}: DiffLinesMenuProps) => {
  const [open, _setOpen] = useState(false)
  const setOpen = (newOpen: boolean) => {
    _setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [buttonProps, portalElement] = usePortalTooltip({
    'aria-label': 'Copilot menu',
    contentRef: buttonRef,
    direction: 'sw',
    anchorSide: 'outside-bottom',
  })

  const closeMenu = () => setOpen(false)

  return (
    <ButtonGroup className={styles['diff-button-container']}>
      <DiffLinesAskCopilotButton fileDiffReference={fileDiffReference} afterSelect={closeMenu} />
      <ActionMenu open={open} onOpenChange={setOpen} anchorRef={buttonRef}>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={TriangleDownIcon}
            aria-label="Copilot menu"
            ref={buttonRef}
            onSelect={() => setOpen(true)}
            size="small"
            className={clsx(styles['square'], styles['diff-button'])}
            data-testid="more-copilot-button"
            {...buttonProps}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay align="end">
          <ActionList>
            <DiffLinesExplainMenuItem fileDiffReference={fileDiffReference} afterSelect={closeMenu} />
            <ActionList.Divider />
            <DiffLinesAttachMenuItem fileDiffReference={fileDiffReference} afterSelect={closeMenu} />
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {portalElement}
    </ButtonGroup>
  )
}
