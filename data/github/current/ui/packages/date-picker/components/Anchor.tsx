import {testIdProps} from '@github-ui/test-id-props'
import {CalendarIcon} from '@primer/octicons-react'
import {Button, IconButton, Octicon} from '@primer/react'
import {forwardRef, useMemo} from 'react'

import {useOnAnchorAction} from '../hooks/index'
import type {AnchorElement, AnchorVariant, RenderAnchor} from '../types'
import {formatSelection} from '../utils/index'
import styles from './Anchor.module.css'
import {DatePickerTextInput} from './Input'
import {useDatePickerContext} from './Provider'

interface ExternalDatePickerAnchorProps {
  render: RenderAnchor
  children: React.ReactNode
}

export const ExternalDatePickerAnchor = forwardRef<HTMLElement, ExternalDatePickerAnchorProps>(
  ({render, children}, ref) => {
    const onAction = useOnAnchorAction()
    const {
      configuration: {disabled},
    } = useDatePickerContext()

    return render({
      ref,
      'aria-haspopup': 'true',
      tabIndex: 0,
      onClick: onAction,
      onKeyDown: onAction,
      children,
      disabled,
      'aria-disabled': disabled,
    })
  },
)

ExternalDatePickerAnchor.displayName = 'ExternalDatePickerAnchor'

const StyledCalendarIcon = () => <Octicon icon={CalendarIcon} className={styles.calendarIcon} />

const DefaultDatePickerAnchor = forwardRef<AnchorElement, {anchorVariant: AnchorVariant; children: string}>(
  ({anchorVariant, children}, ref) => {
    const {
      configuration: {iconPlacement, anchorClassName, disabled},
    } = useDatePickerContext()

    const onAction = useOnAnchorAction()

    return anchorVariant === 'input' ? (
      <DatePickerTextInput anchorRef={ref} fullWidth className={anchorClassName} disabled={disabled} />
    ) : anchorVariant === 'icon-only' ? (
      <IconButton
        onClick={onAction}
        onKeyDown={onAction}
        type="button"
        className={anchorClassName}
        {...testIdProps('anchor-button')}
        icon={CalendarIcon}
        ref={ref}
        disabled={disabled}
        aria-label={`Open date picker (currently selected: ${children})`}
      />
    ) : (
      <Button
        aria-label={`Open date picker (currently selected: ${children})`}
        onClick={onAction}
        onKeyDown={onAction}
        type="button"
        className={anchorClassName}
        {...testIdProps('anchor-button')}
        ref={ref}
        disabled={disabled}
        leadingVisual={iconPlacement === 'start' ? StyledCalendarIcon : undefined}
        trailingVisual={iconPlacement === 'end' ? StyledCalendarIcon : undefined}
      >
        {children}
      </Button>
    )
  },
)

DefaultDatePickerAnchor.displayName = 'DefaultDatePickerAnchor'

export const DatePickerAnchor = () => {
  const {
    configuration: {anchor, placeholder, variant, dateFormat},
    anchorRef,
    selection,
  } = useDatePickerContext()

  const formattedSelection = useMemo(
    () =>
      formatSelection({
        selection,
        dateFormat,
        placeholder,
        rawFormat: false,
        variant,
      }),
    [placeholder, variant, dateFormat, selection],
  )

  if (anchor === null) return null

  if (typeof anchor === 'function')
    return (
      <ExternalDatePickerAnchor render={anchor} ref={anchorRef}>
        {formattedSelection}
      </ExternalDatePickerAnchor>
    )

  return (
    <DefaultDatePickerAnchor anchorVariant={anchor} ref={anchorRef}>
      {formattedSelection}
    </DefaultDatePickerAnchor>
  )
}
