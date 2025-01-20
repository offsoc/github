import {forwardRef, type RefObject} from 'react'

import type {
  AnchorElement,
  AnchorVariant,
  CloseGesture,
  DateFormat,
  DayOfWeek,
  IconPlacement,
  OpenGesture,
  RangeSelection,
  RenderAnchor,
  Selection,
  SubmitGesture,
} from '../types'
import {DatePickerAnchor} from './Anchor'
import {DatePickerConfirmCloseDialog} from './ConfirmCloseDialog'
import {type DatePickerAnchoredOverlayProps, DatePickerOverlay} from './Overlay'
import {DatePickerProvider} from './Provider'

interface BaseDatePickerConfig {
  /**
   * The anchor is the inline element that the user will interact with to trigger the
   * datepicker.
   *
   * Built-in anchors include:
   *
   * - `'button'`: A button that users can click to open the picker.
   * - `'input'`: A text input box that users can type dates into if they prefer.
   * - `'icon-only'`: A button that is styled as a calendar icon for integration into other
   *   components.
   *
   * To use a custom anchor, either provide a render function here or provide a `ref` to an
   * externally rendered anchor. If a render function is provided, the current selection string
   * will be provided as the `children` prop.
   * @default "button"
   */
  anchor?: AnchorVariant | RenderAnchor | RefObject<HTMLElement>
  /**
   * Optional style overrides for the anchor. Ignored if a custom anchor is used.
   */
  anchorClassName?: string
  /**
   * Control whether the datepicker is disabled or not.
   * @default false
   */
  disabled?: boolean
  /**
   * Control whether the user needs to press a button to apply their changes. If `false`,
   * the datepicker will apply changes and close as soon as a selection is made.
   * @default false
   */
  confirmation?: boolean
  /**
   * Control whether the user should confirm their changes if they exit the picker without saving.
   * If `true`, the picker will be put into `confirmation` mode, regardless of the value of the
   * `confirmation` prop.
   * @default false
   */
  confirmUnsavedClose?: boolean
  /**
   * Show a smaller header with month/year dropdowns.
   * @default false
   */
  compressedHeader?: boolean
  /**
   * Control how the selection will be displayed in the anchor.
   * @default short
   */
  dateFormat?: DateFormat
  /**
   * If `true`, users will not be able to select weekends (Saturday or Sunday).
   * @default false
   */
  disableWeekends?: boolean
  /**
   * Control where the calendar icon will display on the anchor.
   * @default start
   */
  iconPlacement?: IconPlacement
  /**
   * The maximum date the user can select. This is inclusive - the user can select the
   * `maxDate` but not any date after.
   */
  maxDate?: Date | null
  /**
   * The minimum date the user can select. This is inclusive - the user can select the
   * `minDate` but not any date before.
   */
  minDate?: Date | null
  /**
   * Control whether inputs are shown inside the picker. Inputs are not
   * shown when `confirmation` mode is disabled or when `variant` is `'multi'`.
   * @default true
   */
  showInputs?: boolean
  /**
   * Control whether to show a 'today' button in the picker. This button will cause today's
   * date to appear and be focused. If today's date is outside the allowed range (defined by
   * `minDate` and `maxDate`, the button will not be displayed.
   * @default true
   */
  showTodayButton?: boolean

  /**
   * Control whether to show a 'clear' button in the picker. This button will set the
   * date to `null`.
   * @default false
   */
  showClearButton?: boolean

  /**
   * Control the size of the datepicker. Will always be `'1-month'`
   * on screens too small to display 2 months side-by-side.
   * @default 1-month
   */
  view?: '1-month' | '2-month'
  /**
   * Determine the day of the week that is shown in the first column when displaying a month.
   * @default Sunday
   */
  weekStartsOn?: DayOfWeek
  /**
   * Placeholder string when there is no selection.
   * @default Choose date...
   */
  placeholder?: string
}

export type SingleDatePickerConfig = BaseDatePickerConfig

export interface MultiDatePickerConfig extends BaseDatePickerConfig {
  /**
   * The maximum number of dates that can be selected.
   */
  maxSelections?: number
}

export interface RangeDatePickerConfig extends BaseDatePickerConfig {
  /**
   * The maximum number of days that the range can cover.
   *
   * If `disableWeekends` is `true`, the range size will not include weekends. That is, a range from Friday to Monday
   * would be considered 2 days long.
   */
  maxRangeSize?: number
  /**
   * The minimum number of days that the range can cover.
   *
   * @see `maxRangeSize` for weekend details
   */
  minRangeSize?: number
}

// interface cannot `extend C` but type can have `C &`, so this has to be a type
type BaseDatePickerProps<S extends Selection, C extends BaseDatePickerConfig> = C & {
  /**
   * Called when the selection changes. For `confirmation` datepicker, `onChange` will only
   * be called one time, when the user clicks to confirm.
   */
  onChange?: (selection: S) => void
  /**
   * Determines whether the overlay portion of the component should be shown or not. If
   * not defined, the date picker will manage its own internal closed/open state.
   */
  open?: boolean
  /**
   * A callback which is called whenever the overlay is currently open and a "close" or "submit" gesture is detected.
   */
  onClose?: (gesture: CloseGesture | SubmitGesture) => void
  /**
   * A callback which is called whenever the overlay is currently closed and an "open gesture" is detected.
   */
  onOpen?: (gesture: OpenGesture) => void
  /**
   * Current value of the picker.
   */
  value: S
  /**
   * Props to be spread on the internal `AnchoredOverlay` component. `DatePicker` props will take
   * precedence in the event of a conflict.
   */
  anchoredOverlayProps?: DatePickerAnchoredOverlayProps
  /**
   * Configuration object, if you'd like to reuse a single configuration object among multiple pickers.
   * These can also be supplied as top-level props. If any top-level props conflict with the
   * `configuration` object props, the top-level props will apply instead.
   *
   * @note Due to limitations in the type system, the `variant` prop is always required at the top-level
   * if the variant is not `single`.
   */
  configuration?: Partial<C>
}

export type SingleDatePickerProps = BaseDatePickerProps<Date | null, SingleDatePickerConfig> & {
  variant?: 'single'
}

export type MultiDatePickerProps = BaseDatePickerProps<Date[] | null, MultiDatePickerConfig> & {
  variant: 'multi'
}

export type RangeDatePickerProps = BaseDatePickerProps<RangeSelection | null, RangeDatePickerConfig> & {
  variant: 'range'
}

export type DatePickerProps = SingleDatePickerProps | MultiDatePickerProps | RangeDatePickerProps

/**
 * A form input for accepting date values (including multiple dates and date ranges). Provides
 * a consistent and user-friendly experience across all browsers.
 */
export const DatePicker = forwardRef<AnchorElement, DatePickerProps>(
  ({anchoredOverlayProps, configuration, ...topLevelConfiguration}, forwardedAnchorRef) => {
    // Even though we KNOW that in the context of this function it's impossible for the types of configuration and
    // topLevelConfiguration to mismatch because of the definition of DatePickerProps, the compiler is not smart enough to
    // maintain that association once you start working with them because it thinks the variants can be different.
    const contextProps = {...configuration, ...topLevelConfiguration}
    return (
      <DatePickerProvider {...contextProps} forwardedAnchorRef={forwardedAnchorRef}>
        <DatePickerConfirmCloseDialog />
        <DatePickerAnchor />
        <DatePickerOverlay {...anchoredOverlayProps} />
      </DatePickerProvider>
    )
  },
)
DatePicker.displayName = 'DatePicker'
