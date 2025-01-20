import {DatePicker, type RangeSelection} from '@github-ui/date-picker'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {TrashIcon} from '@primer/octicons-react'
import {Box, IconButton, Link, Text} from '@primer/react'
import {addDays, parseISO, subYears} from 'date-fns'
import isEqual from 'lodash-es/isEqual'
import {type ChangeEvent, useMemo, useRef} from 'react'

import type {IterationInterval} from '../../../../api/columns/contracts/iteration'
import {AutosizeTextInput} from '../../../../components/common/autosize-text-input'
import {BorderlessTextInput} from '../../../../components/common/borderless-text-input'
import {IterationRowLabel} from '../../../../components/fields/iteration/iteration-label'
import {replaceShortCodesWithEmojis} from '../../../../helpers/emojis'
import {
  intervalAsRangeSelection,
  intervalDatesDescription,
  intervalDurationDescription,
  type IterationLabelType,
  rangeSelectionAsInterval,
} from '../../../../helpers/iterations'
import {useEmojiAutocomplete} from '../../../../hooks/common/use-emoji-autocomplete'
import {DiffValue} from './iteration-diff-value'

export const BaseIterationRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  padding: 3,
} as const

/** Trash can icon to click to delete a row. */
function DeleteButton({onClick}: {onClick: () => void}) {
  return (
    <IconButton
      icon={TrashIcon}
      sx={{
        border: 'none',
        boxShadow: 'none',
        minWidth: '16px',
        p: 0,
        ml: 'auto',
        bg: 'transparent',
        color: 'fg.muted',
        ':hover': {
          bg: 'transparent',
          boxShadow: 'none',
        },
      }}
      aria-label="Remove item"
      onClick={onClick}
      {...testIdProps('delete-iteration')}
    />
  )
}

interface TitleInputProps {
  value: string
  onChange?: (newValue: string) => void
}

/** Editable title for iterations. */
function TitleInput({value, onChange}: TitleInputProps) {
  const [inputValue, setInputValue] = useSyncedState(value)
  const reset = () => setInputValue(value)
  const ref = useRef<HTMLInputElement | null>(null)

  const apply = () => {
    const trimmed = replaceShortCodesWithEmojis(inputValue.trim())
    if (!trimmed) {
      reset()
    } else if (trimmed !== value) {
      onChange?.(trimmed)
    }
  }

  const titleInputComposingProps = useIgnoreKeyboardActionsWhileComposing(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Enter') apply()
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      else if (event.key === 'Escape') reset()
      else return

      event.preventDefault()
      // Timeout to let state update first and avoid blur event triggering save
      // eslint-disable-next-line github/no-blur
      setTimeout(() => ref.current?.blur(), 10)
    },
  )

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <Box
      onClick={() => ref.current?.focus()}
      sx={{
        px: 1,
        ml: -1,
        display: 'inline-block',
        borderRadius: '2',
        cursor: 'text',
        '&:focus-within': {
          boxShadow: 'primer.shadow.focus',
        },
        '&:hover:not(:focus-within)': {
          boxShadow: theme => `0 0 0 3px ${theme.colors.border.default}`,
        },
      }}
    >
      <InlineAutocomplete {...autocompleteProps}>
        <AutosizeTextInput
          as={BorderlessTextInput}
          autoComplete="off"
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onBlur={apply}
          aria-label="Edit iteration name"
          ref={ref}
          {...titleInputComposingProps}
          {...testIdProps('iteration-title')}
        />
      </InlineAutocomplete>
    </Box>
  )
}

interface IntervalDatePickerProps {
  value: IterationInterval
  onChange: (newValue: IterationInterval) => void
  minDate: Date
}

/** Range-based datepicker for updating iteration / break intervals. */
function IntervalDatePicker({value, onChange, minDate}: IntervalDatePickerProps) {
  const onRangeChange = (selection?: RangeSelection | null) => {
    if (selection) onChange(rangeSelectionAsInterval(selection as {to: Date; from: Date}))
  }
  const rangeSelection = useMemo(() => intervalAsRangeSelection(value), [value])

  return (
    <DatePicker
      variant="range"
      value={rangeSelection}
      onChange={onRangeChange}
      view="2-month"
      minDate={minDate}
      confirmation
      confirmUnsavedClose
      anchor={p => (
        <Link
          muted
          {...p}
          sx={{color: 'inherit'}}
          as="button"
          aria-label="Edit date range"
          {...testIdProps('iteration-or-break-dates')}
        >
          {intervalDatesDescription(value)}
        </Link>
      )}
    />
  )
}

interface IterationRowSkeletonProps {
  /** The local title of the item. Leave empty to hide the title. */
  localTitle?: string
  /** The server title of the item (title since last save). Leave empty to hide the title. */
  originalTitle?: string
  /** Called when the item title changes. */
  onTitleChange?: (newName: string) => void

  /** The local date range of the item, with any unsaved changes. */
  localInterval: IterationInterval
  /** The server-side date range of the item, before any unsaved changes. */
  originalInterval?: IterationInterval
  /** The interval before this one (with any unsaved changes). */
  localPreviousInterval?: IterationInterval
  /** Called when the user edits the interval. */
  onIntervalChange: (newInterval: IterationInterval) => void

  labelType: IterationLabelType
  onRemove: () => void

  children?: React.ReactNode
}

/**
 * Shared functionality & layout for all iteration row types (breaks and iterations).
 */
export function IterationRowSkeleton({
  localTitle: localTitle = '',
  originalTitle: originalTitle = '',
  localInterval,
  localPreviousInterval,
  originalInterval,
  labelType,
  onRemove,
  onTitleChange,
  onIntervalChange,
  children,
}: IterationRowSkeletonProps) {
  const isDirty = localTitle !== originalTitle || !isEqual(localInterval, originalInterval)

  const minAllowedDate = useMemo(
    () =>
      localPreviousInterval
        ? addDays(parseISO(localPreviousInterval.startDate), localPreviousInterval.duration)
        : subYears(new Date(), 1),
    [localPreviousInterval],
  )

  return (
    <Box
      as="li"
      sx={{
        listStyle: 'none',
        '&:not(:last-child)': {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border.muted',
        },
      }}
    >
      {children}
      <Box
        sx={{
          ...BaseIterationRowStyle,
          backgroundColor: labelType === 'break' ? 'canvas.subtle' : 'canvas.default',
          boxShadow: (theme: FixMeTheme) => (isDirty ? `2px 0 0 ${theme.colors.accent.fg} inset` : undefined),
        }}
      >
        <IterationRowLabel labelType={labelType} sx={{pt: localTitle ? '2px' : undefined}} />

        <Box sx={{flexDirection: 'column', display: 'flex', alignItems: 'flex-start', gap: 1}}>
          {(localTitle || originalTitle) && (
            <Box sx={{flexDirection: 'row', display: 'flex', justifyContent: 'space-between'}}>
              <DiffValue
                sx={{fontWeight: 600, fontSize: 2}}
                originalValue={originalTitle}
                updatedValue={localTitle}
                testId="iteration-title-diff"
                renderUpdatedValue={_ => <TitleInput value={localTitle} onChange={onTitleChange} />}
              />
            </Box>
          )}

          <Box sx={{flexDirection: 'row', display: 'flex', justifyContent: 'space-between'}}>
            <DiffValue
              originalValue={intervalDatesDescription(originalInterval)}
              updatedValue={intervalDatesDescription(localInterval)}
              testId="iteration-dates-diff"
              renderOriginalValue={() => (
                <>
                  <Text sx={{fontWeight: 600}}>{intervalDurationDescription(originalInterval)}</Text>
                  &nbsp;&nbsp;
                  <span>{intervalDatesDescription(originalInterval)}</span>
                </>
              )}
              renderUpdatedValue={() => (
                <>
                  <Text sx={{fontWeight: 600}}>{intervalDurationDescription(localInterval)}</Text>&nbsp;&nbsp;
                  <IntervalDatePicker value={localInterval} onChange={onIntervalChange} minDate={minAllowedDate} />
                </>
              )}
            />
          </Box>
        </Box>

        <DeleteButton onClick={onRemove} />
      </Box>
    </Box>
  )
}
