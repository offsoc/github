import {AnchoredOverlay, type AnchoredOverlayProps} from '@primer/react'

import {DatePickerPanel} from './Panel'
import {useDatePickerContext} from './Provider'

export type DatePickerAnchoredOverlayProps = Partial<Omit<AnchoredOverlayProps, 'renderAnchor' | 'anchorRef'>>

export const DatePickerOverlay = (externalProps: DatePickerAnchoredOverlayProps) => {
  const {isOpen, close, open, anchorRef} = useDatePickerContext()

  return (
    <AnchoredOverlay
      focusTrapSettings={{restoreFocusOnCleanUp: true}}
      focusZoneSettings={{disabled: true}}
      open={isOpen}
      onClose={close}
      onOpen={open}
      renderAnchor={null}
      anchorRef={anchorRef}
      overlayProps={{
        'aria-label': 'Date Picker',
        role: 'dialog',
        'aria-modal': 'true',
      }}
      {...externalProps}
    >
      <DatePickerPanel />
    </AnchoredOverlay>
  )
}
