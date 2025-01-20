import type {Ref} from 'react'

import type {DatePickerTextInput} from './components/Input'

// #region TYPES
export type AnchorVariant = 'input' | 'button' | 'icon-only'
export type DateFormat = string

export type SelectionVariant = 'single' | 'multi' | 'range'
export type InternalSelection = Date | Date[] | InternalRangeSelection | null
export type StringSelection = string | string[] | {to: string; from: string} | null
export type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type IconPlacement = 'start' | 'end' | 'none'
export type RangeEnd = 'from' | 'to'

export type OpenGesture = 'anchor-click' | 'anchor-key-press'
export type CloseGesture = 'anchor-click' | 'click-outside' | 'escape'
export type SubmitGesture = 'submit-click' | 'submit-key-press'

export type ViewMode = '1-month' | '2-month'

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
export type Months = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

export type RenderAnchor = <P extends React.HTMLAttributes<HTMLElement>>(props: P) => JSX.Element

export type InternalRangeSelection = {
  from: Date
  to: Date | null
}

export type RangeSelection = InternalRangeSelection & {to: Date}
export type Selection = Date | Date[] | RangeSelection | null

export type ConfirmCloseAction = 'confirm' | 'discard'

export interface SelectionModifiers {
  multiple: boolean
  range: boolean
}

export type AnchorElement = HTMLInputElement & HTMLButtonElement & HTMLDivElement

export interface DatePickerContext {
  /**
   * All of the user provided settings mixed with defaults & overrides.
   */
  configuration: {
    /** `null` if the user will render their own anchor. */
    anchor: AnchorVariant | RenderAnchor | null
    anchorClassName?: string
    confirmation: boolean
    confirmUnsavedClose: boolean
    compressedHeader: boolean
    dateFormat: DateFormat
    disabled?: boolean
    disableWeekends: boolean
    iconPlacement: IconPlacement
    maxDate?: Date
    minDate?: Date
    placeholder: string
    showInputs: boolean
    showTodayButton: boolean
    showClearButton: boolean
    view: ViewMode
    weekStartsOn: DayOfWeek
    variant: 'single' | 'multi' | 'range'
  }

  anchorRef: React.RefObject<AnchorElement>
  activeRangeEnd: null | RangeEnd
  setActiveRangeEnd: (end: null | RangeEnd) => void
  close: (gesture: CloseGesture) => void
  /** Is the user currently confirming a pending close? */
  confirmingClose: boolean
  currentViewingDate: Date
  focusDate: Date
  goToMonth: (date: Date) => void
  hoverRange?: InternalRangeSelection | null
  inputRef: Ref<DatePickerTextInput>
  isDirty: boolean
  isOpen: boolean
  onClearSelection: () => void
  onConfirmClose: (action: ConfirmCloseAction) => void
  onDateHover: (date: Date) => void
  onDateInput: (updatedSelection: InternalSelection) => void
  onDateSelection: (
    date: Date,
    modifiers: SelectionModifiers,
    preserveFocus?: boolean,
    submitGesture?: SubmitGesture,
  ) => void
  open: (gesture: OpenGesture) => void
  saveValue: () => void
  selection: InternalSelection
  selectionActive?: boolean
  setFocusDate: (date: Date) => void
  setHoverRange: React.Dispatch<React.SetStateAction<InternalRangeSelection | null>>
  softSelection?: Partial<InternalRangeSelection> | null
}

// #endregion

// #region TYPE GUARDS
export function isSingleSelection(selection: InternalSelection | null): selection is Date | null {
  return selection === null || selection instanceof Date
}

export function isMultiSelection(
  selection: InternalSelection | StringSelection | null,
): selection is Date[] | string[] | null {
  return selection === null || Array.isArray(selection)
}

export function isRangeSelection(
  selection: InternalSelection | StringSelection | null,
): selection is InternalRangeSelection | null {
  return selection === null || !!(selection as InternalRangeSelection).from
}

export function isCompleteRangeSelection(
  selection: InternalSelection | StringSelection | null,
): selection is RangeSelection | null {
  return isRangeSelection(selection) && (selection === null || selection.to !== null)
}
// #endregion
