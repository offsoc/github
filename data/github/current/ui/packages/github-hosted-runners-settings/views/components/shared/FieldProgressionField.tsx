import {Box, Button, FormControl, Text} from '@primer/react'
import {cloneElement, type ReactElement} from 'react'
import type {Platform} from '../../../types/platform'
import type {MachineSpec} from '../../../types/machine-spec'

// Custom editor components are expected to implement this interface
export interface FieldProgressionFieldEditComponentProps<T> {
  value: T | null
  setValue: (value: T | null) => void
  onSave?: () => void
}

interface FieldProgressionFieldEditComponent extends ReactElement {
  props: FieldProgressionFieldEditComponentProps<MachineSpec | Platform | string>
}

export type FieldProgressionFieldProps = {
  name: string
  displayValue: string | null
  isActive?: boolean
  index?: number
  onEditClick?: () => void
  onSave?: () => void
  error?: boolean
  editComponent: FieldProgressionFieldEditComponent
}

export default function FieldProgressionField({
  name,
  displayValue,
  isActive,
  index,
  onEditClick,
  onSave,
  editComponent,
  error,
}: FieldProgressionFieldProps) {
  // FieldProgression will pass an index prop to its editComponent
  if (index === undefined) {
    throw new Error('FieldProgressionField must be rendered as a child of a FieldProgression component')
  }

  const hasValue = displayValue !== null
  const validationId = `field-progression-field-validation-${index}`

  const activeField = cloneElement(editComponent, {onSave})
  const inactiveField = (
    <Box
      sx={{
        pl: 3,
        pr: 3,
      }}
    >
      {hasValue ? (
        <span>{displayValue}</span>
      ) : (
        <Text sx={{color: 'fg.muted'}}>{`No ${name.toLowerCase()} selected`}</Text>
      )}
    </Box>
  )

  return (
    <>
      <Box
        data-testid={`field-progression-field-${index}`}
        className="d-flex flex-items-center"
        aria-describedby={validationId}
        area-invalid={error}
        sx={{
          borderColor: error ? 'danger.fg' : 'border.default',
          borderRadius: 2,
          borderStyle: 'solid',
          borderWidth: 1,
          marginBottom: 2,
          width: '100%',
        }}
      >
        <FormControl sx={{width: '100%'}}>
          <FormControl.Label
            sx={{
              p: 3,
              pb: 0,
            }}
          >
            {name}
          </FormControl.Label>
          <Box as="div" sx={{pb: 3, width: '100%'}}>
            {isActive ? activeField : inactiveField}
          </Box>
        </FormControl>
        {!isActive && hasValue && (
          <Button
            sx={{
              margin: 3,
            }}
            variant="invisible"
            onClick={onEditClick}
          >
            Edit
          </Button>
        )}
      </Box>

      {error && (
        <FormControl.Validation
          variant="error"
          sx={{pb: 3}}
          id={validationId}
        >{`${name} is required.`}</FormControl.Validation>
      )}
    </>
  )
}
