import {testIdProps} from '@github-ui/test-id-props'
import {ValidationErrorPopover} from '@github-ui/validation-error-popover'
import {ActionList, type ActionListItemProps, ActionMenu, Box, Text, TextInput} from '@primer/react'
import {useEffect, useMemo} from 'react'

import {getDisplayUnits, type IterationDuration, type IterationDurationUnits} from '../../../helpers/iterations'
import {usePrefixedId} from '../../../hooks/common/use-prefixed-id'
import {Resources} from '../../../strings'

interface IterationDurationInputProps {
  /** The current value of the input. */
  value: IterationDuration
  /** Called when the value changes. */
  onChange: (value: IterationDuration) => void
  /** Called when validity changes (to enable and disable submitting). */
  onValidChange?: (isValid: boolean) => void
}

type UnitItemInput = ActionListItemProps & {key: IterationDurationUnits}
const allUnits = ['days', 'weeks'] as const
function buildUnitItemsMap(quantity: number): Map<IterationDurationUnits, UnitItemInput> {
  return new Map(
    allUnits.map(u => [
      u,
      {
        children: getDisplayUnits(quantity, u),
        key: u,
        ...testIdProps(`duration-${u}-menu-item`),
      },
    ]),
  )
}

const MIN_QTY = 1
const MAX_QTY = 99

interface QuantityValidity {
  isValid: boolean
  message?: string
}

/** Validate a duration quantity value. Returns an error message or `null` if the value is valid. */
// It would be more clear to return a {isValid, message} object here, but that's much
// more difficult to manage when it comes to avoiding extra re-renders.
function validateQuantity(quantity: number): QuantityValidity {
  if (Number.isNaN(quantity)) return {isValid: false} // input is empty
  if (quantity < MIN_QTY) return {isValid: false, message: Resources.iterationDurationQtyLow(MIN_QTY)}
  if (quantity > MAX_QTY) return {isValid: false, message: Resources.iterationDurationQtyHigh(MAX_QTY)}
  return {isValid: true}
}

/** Ignore non-numeric digits, like scientific notation and decimals */
function ignoreNonDigitNumberChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  switch (event.key) {
    case 'e':
    case '-':
    case '.':
    case '+':
      event.preventDefault()
      break
  }
}

/**
 * Component to input quantity and units for an iteration's duration. Handles validation -
 * listen to the `onValidChange` event and disallow submitting unless valid.
 */
export function IterationDurationInput({value, onChange, onValidChange}: IterationDurationInputProps) {
  const qtyValidity = useMemo(() => validateQuantity(value.quantity), [value.quantity])

  // This has the unfortunate effect of calling onValidChange every time it changes. Fortunately it's only called with a
  // boolean so calling again with the same value should be OK. If it becomes a problem we can revisit or just memoize the handler.
  useEffect(() => onValidChange?.(qtyValidity.isValid), [onValidChange, qtyValidity.isValid])

  const onQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = e.target.valueAsNumber
    // We don't have to update validity here because it will update by effect when the parent updates value.quantity
    onChange({...value, quantity})
  }

  const onUnitsChange = (item?: ActionListItemProps) => {
    if (item) onChange({...value, units: (item as UnitItemInput).key})
  }

  const groupLabelId = usePrefixedId('iteration-duration')
  const qtyValidationMessageId = usePrefixedId('duration-quantity-validation-message')

  const unitItems = useMemo(() => {
    const map = buildUnitItemsMap(value.quantity)
    return Array.from(map.values())
  }, [value.quantity])

  return (
    <Box
      sx={{flexGrow: 1, alignItems: 'center', display: 'flex'}}
      role="group"
      aria-label={Resources.iterationDurationLabel}
      aria-labelledby={groupLabelId}
    >
      <Box sx={{position: 'relative'}}>
        <TextInput
          type="number"
          min={MIN_QTY}
          max={MAX_QTY}
          step={1}
          required
          value={Number.isNaN(value.quantity) ? '' : value.quantity}
          onChange={onQtyChange}
          onKeyDown={ignoreNonDigitNumberChars}
          aria-invalid={!qtyValidity.isValid}
          aria-describedby={qtyValidity.message && qtyValidationMessageId}
          aria-label="Duration quantity"
          sx={{
            '&.error': {
              borderColor: 'danger.emphasis',
              boxShadow: 'none',
            },
            mr: 2,
            '& > input': {
              textAlign: 'center',
              pr: 0.5,
              pl: 0.5,
              width: '5ch',
            },
          }}
          className={qtyValidity.isValid ? '' : 'error'}
          {...testIdProps('duration-quantity-input')}
          id="duration-quantity-input"
        />

        <ValidationErrorPopover
          message={qtyValidity.message}
          id={qtyValidationMessageId}
          testId="duration-quantity-validation-message"
        />
      </Box>

      <ActionMenu>
        <ActionMenu.Button
          sx={{
            flex: 1,
            gridTemplateColumns: 'min-content 1fr min-content',
            '[data-component=text]': {textAlign: 'left'},
            '[data-component=buttonContent]': {flex: 0},
          }}
          aria-label="Units"
          {...testIdProps('duration-units-button')}
        >
          <Text sx={{flex: 1, textAlign: 'left'}} {...testIdProps('duration-units-value')}>
            {value.units}
          </Text>
        </ActionMenu.Button>
        <ActionMenu.Overlay>
          <ActionList selectionVariant="single">
            {unitItems.map(unitItem => (
              <ActionList.Item
                {...unitItem}
                key={unitItem.key}
                selected={unitItem.key === value.units}
                onSelect={() => onUnitsChange(unitItem)}
              />
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}
