import {useCallback, useEffect, useMemo, useState, type RefObject} from 'react'
import {FormControl, TextInput} from '@primer/react'
import {BorderBox} from '../BorderBox'
import type {RuleSchema, ValidationError} from '../../types/rules-types'
import {rangeBounds} from '../../helpers/range'

type MaxHelper = {
  field: RuleSchema['parameterSchema']['fields'][0]
  value: number
  onValueChange?: (value: number) => void
  readOnly?: boolean
  label: string
  errors: ValidationError[]
  description?: string
  fieldRef?: RefObject<HTMLInputElement>
}

export function MaxHelper({field, value, onValueChange, readOnly, label, description, fieldRef, errors}: MaxHelper) {
  if (field.type !== 'integer') {
    throw new Error('Field type must be integer')
  }

  const errorMessages: {empty: string; notInteger: string} = useMemo(
    () => ({
      empty: `${label} cannot be empty`,
      notInteger: `${label} must be a whole number`,
    }),
    [label],
  )

  const [maxError, setMaxError] = useState('')

  useEffect(() => {
    const message = errors[0]?.message
    if (message?.includes('to be present')) {
      setMaxError(errorMessages['empty'])
      return
    }
    if (message?.includes('Expected integer')) {
      setMaxError(errorMessages['notInteger'])
      return
    }
    setMaxError(errors[0]?.message || '')
    // We only care about the first message changing
    // Otherwise, useEffect attempts to compare the whole errorObject, which is different each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors[0]?.message])

  const validate = useCallback(
    (targetValue?: string) => {
      setMaxError('')
      if (!targetValue || targetValue.trim() === '') {
        setMaxError(errorMessages['empty'])
        return
      }
      const parsedValue = parseFloat(targetValue)
      if (isNaN(parsedValue) || !Number.isInteger(parsedValue)) {
        setMaxError(errorMessages['notInteger'])
        return
      }
    },
    [errorMessages],
  )

  return (
    <BorderBox className={`p-3`}>
      {!readOnly ? (
        <FormControl>
          <FormControl.Label>{label}</FormControl.Label>
          {description && <FormControl.Caption>{description}</FormControl.Caption>}
          <TextInput
            className="width-full"
            type="number"
            ref={fieldRef}
            min={rangeBounds(field.allowed_range)?.min}
            max={rangeBounds(field.allowed_range)?.max}
            value={value}
            onBlur={e => {
              validate(e.target.value)
            }}
            onChange={e => {
              validate(e.target.value)
              onValueChange?.(parseFloat(e.target.value))
            }}
          />
          {maxError && <FormControl.Validation variant="error">{maxError}</FormControl.Validation>}
        </FormControl>
      ) : (
        <div>
          <span className="text-bold">{label}: </span>
          <span>{value}</span>
        </div>
      )}
    </BorderBox>
  )
}
