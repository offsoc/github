import {Checkbox, FormControl, TextInput, Textarea} from '@primer/react'
import type {ModelInputSchemaParameter} from '../../../../types'
import {useCallback, useEffect, useRef, useState} from 'react'

import styles from '../../../../models.module.css'

export function PlaygroundInput({
  parameter,
  value,
  onChange,
}: {
  parameter: ModelInputSchemaParameter
  value: string | number | string[] | boolean
  onChange: (key: string, value: string | number | boolean | string[]) => void
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [height, setHeight] = useState<string>('auto')

  const checkBounds = (val: number, min?: number, max?: number): number => {
    if (max !== undefined && val > max) {
      return max
    }
    if (min !== undefined && val < min) {
      return min
    }
    return val
  }

  const validateNumber = useCallback(
    (val: string | number | boolean | string[]): number | null => {
      const number =
        parameter.type === 'number'
          ? parseFloat(val as string)
          : parameter.type === 'integer'
            ? parseInt(val as string)
            : null

      if (number == null) {
        return null
      }
      return checkBounds(number, parameter.min, parameter.max)
    },
    [parameter.max, parameter.min, parameter.type],
  )

  const handleBlur = () => {
    const validatedNumber = validateNumber(value)
    validatedNumber !== null && onChange(parameter.key, validatedNumber)
  }

  const handleRangeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const validatedNumber = validateNumber(event.target.value)
      validatedNumber !== null && onChange(parameter.key, validatedNumber)
    },
    [onChange, parameter.key, validateNumber],
  )

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue: string | number | boolean | string[] = event.target.value

      if (event.target.type === 'checkbox') {
        if (event.target instanceof HTMLInputElement) {
          newValue = event.target.checked
        }
      }

      if (parameter.type === 'array') {
        newValue = event.target.value.split('\n')
      }

      onChange(parameter.key, newValue)
    },
    [onChange, parameter.key, parameter.type],
  )

  useEffect(() => {
    const current = textAreaRef.current
    if (!current) return
    current.style.height = 'auto'
    current.style.height = current.scrollHeight > 72 ? '72px' : `${current.scrollHeight}px`
    setHeight(current.style.height)
  }, [value])

  const renderInput = (param: ModelInputSchemaParameter): JSX.Element | null => {
    switch (param.type) {
      case 'string':
        return (
          <TextInput type="text" value={value as string} block={true} onChange={handleChange} name={parameter.key} />
        )
      case 'number':
      case 'integer':
        return (
          <div className="width-full d-flex gap-3 flex-items-center">
            <TextInput
              name={parameter.key}
              id={parameter.key}
              type="number"
              max={parameter.max}
              min={parameter.min}
              step={parameter.max === 1 ? 0.01 : 1}
              value={value as string}
              block={true}
              onChange={handleChange}
              onBlur={handleBlur}
              sx={{width: '30%'}}
            />
            {}
            {parameter.max !== undefined &&
              parameter.min !== undefined && ( // If min AND max is unknown, do not show a slider
                <>
                  <input
                    id={`${parameter.key}-range-input`}
                    name={`${parameter.key}-range-input`}
                    type="range"
                    value={value as number}
                    min={parameter.min}
                    max={parameter.max}
                    step={parameter.max === 1 ? 0.01 : 1}
                    onChange={handleRangeChange}
                    // @ts-expect-error this style is invalid
                    className={`flex-1 ${styles['range-input']}`}
                  />
                  <label htmlFor={`${parameter.key}-range-input`} className="sr-only">
                    {parameter.key}
                  </label>
                </>
              )}
          </div>
        )

      case 'array':
        return (
          <Textarea
            ref={textAreaRef}
            name={parameter.key}
            value={(value as string[]).join('\n')}
            block={true}
            rows={1}
            resize="vertical"
            onChange={handleChange}
            style={{height}}
          />
        )
      case 'boolean':
        return <Checkbox name={parameter.key} checked={value as boolean} onChange={handleChange} />
    }
  }

  return (
    <FormControl key={parameter.key} required={parameter.type === 'string' && parameter.required} id={parameter.key}>
      <FormControl.Label htmlFor={parameter.key}>
        {parameter.friendlyName ? parameter.friendlyName : parameter.key}
      </FormControl.Label>
      {parameter.description && <FormControl.Caption>{parameter.description}</FormControl.Caption>}
      {renderInput(parameter)}
    </FormControl>
  )
}
