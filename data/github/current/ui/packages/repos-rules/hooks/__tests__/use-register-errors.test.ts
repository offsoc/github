import {renderHook} from '@testing-library/react'
import {createRuleSchema as createBaseRuleSchema} from '../../test-utils/mock-data'
import type {ParameterSchema, RuleSchema, ValidationError} from '../../types/rules-types'
import {useRegisterErrors, type ErrorFilterFunction} from '../use-register-errors'

const baseField = {
  name: 'test',
  display_name: 'test',
  description: 'test',
  required: false,
}

function createField(uiControl?: string): ParameterSchema['fields'][0] {
  if (uiControl) {
    return {
      ...baseField,
      type: 'object',
      ui_control: uiControl,
    }
  }
  return {
    ...baseField,
    type: 'string',
  }
}

function createRuleSchema({uiControl}: {uiControl?: string} = {}): RuleSchema {
  return createBaseRuleSchema({
    parameterSchema: {
      name: 'pull_request',
      fields: [createField(uiControl)],
    },
  })
}

const errors: ValidationError[] = [
  {
    message: 'error',
    field: 'test',
    error_code: 'error',
  },
]

describe('useRegisterErrors', () => {
  test('should register default errors', async () => {
    const schema = createRuleSchema()
    const {result} = renderHook(() => useRegisterErrors({errors, fields: schema.parameterSchema.fields}))

    // error is registered because it doesn't have a custom ui control
    expect(result.current.removeNonUIControlErrors).toEqual(errors)
    expect(result.current.unregistered).toEqual([])
  })

  test('should not register errors without applicable filters', async () => {
    const schema = createRuleSchema({uiControl: 'custom'})
    const {result} = renderHook(() => useRegisterErrors({errors, fields: schema.parameterSchema.fields}))

    expect(result.current.removeNonUIControlErrors).toEqual([])
    // unregistered custom ui control error
    expect(result.current.unregistered).toEqual(errors)
  })

  test('should register errors with additional filters', async () => {
    const schema = createRuleSchema()
    const filter: Record<string, ErrorFilterFunction> = {
      customFilter: {
        args: 'error',
        func: (error: ValidationError) => {
          if (error.error_code === 'error') {
            return true
          }
          return false
        },
      },
    }

    const {result} = renderHook(() =>
      useRegisterErrors({errors, fields: schema.parameterSchema.fields, filters: filter}),
    )

    expect(result.current.customFilter).toEqual(errors)
    // Undefined because all errors are registered before getting to run this
    expect(result.current.removeNonUIControlErrors).toEqual(undefined)
    expect(result.current.unregistered).toEqual([])
  })

  test('should not register default errors', async () => {
    const schema = createRuleSchema()

    const {result} = renderHook(() =>
      useRegisterErrors({errors, fields: schema.parameterSchema.fields, useDefaultFilters: false}),
    )

    // No filters are run because the default filter is disabled, so all errors are unregistered and this is undefined
    expect(result.current.removeNonUIControlErrors).toEqual(undefined)
    // Even though it is't a custom ui control, the error is unregistered because the default filter is disabled
    expect(result.current.unregistered).toEqual(errors)
  })
})
