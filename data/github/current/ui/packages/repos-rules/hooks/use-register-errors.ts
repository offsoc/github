import {useMemo} from 'react'
import type {RuleSchema, ValidationError} from '../types/rules-types'

type FilterByError = {
  args: 'error'
  /**
   * A function that returns whether or not an error is applicable
   * @param {ValidationError} error The error to check
   * @returns {boolean} Whether or not the error is applicable
   */
  func: (error: ValidationError) => boolean
}

type FilterByErrorAndField = {
  args: 'errorAndField'
  /**
   * A function that returns whether or not an error is applicable
   * @param {ValidationError} error The error to check
   * @param {RuleSchema['parameterSchema']['fields'][0]} [field] The field that the error may be associated with
   * @returns {boolean} Whether or not the error is applicable
   */
  func: (error: ValidationError, field?: RuleSchema['parameterSchema']['fields'][0]) => boolean
}

// Specify whether or not the filter function requires a field argumenmt in addition to the error argument
export type ErrorFilterFunction = FilterByError | FilterByErrorAndField

// This default filter is used to ensure that non-custom ui control errors are passed down to the rule row inline form control validation
function removeNonUIControlErrors(error: ValidationError, field?: RuleSchema['parameterSchema']['fields'][0]): boolean {
  if (!field) {
    return false
  }
  if (!field.ui_control && (field.type === 'string' || field.type === 'integer')) {
    return true
  }
  return false
}

/**
 * This hook is used to register expected validation errors
 * Registering errors allows for custom error handling
 * The caller can decide what to do with the errors, whether that's nothing or displaying them in a custom way.
 * @param {ValidationError[]} props.errors The errors to register
 * @param {RuleSchema['parameterSchema']['fields']} props.fields The fields of the rule, as defined by the parameter schema
 * @param {Record<string, ErrorFilterFunction>} props.filters
 *   An object with unique keys, each mapping to a function that returns whether or not a provided is applicable to that filter function.
 *   This registration is necessary to handle errors in custom UI form controls.
 *   Errors that are not registered (not applicable to any filters) will be shown in the error component for the rule (which shows below the rule checkbox).
 *   Filters are executed in the order they are provided, registering the error with the first filter that returns true.
 * @param {boolean} [props.useDefaultFilters=true]
 *   Whether or not to use the default filters that are always run after the custom filters.
 *   The default filters will register any error associated with a standard UI control (string or integer) that is not associated with a custom UI control.
 * @returns {Object} An object containing the registered errors mapped to the key they are associated with as well as the remaining unregistered errors
 * @property {ValidationError[]} [key] - An array of ValidationError for a specific key.
 * @property {ValidationError[]} unregistered - An array of ValidationError that are unregistered.
 */
export const useRegisterErrors = ({
  errors,
  fields,
  filters,
  useDefaultFilters = true,
}: {
  errors: ValidationError[]
  fields: RuleSchema['parameterSchema']['fields']
  // Filters to register known errors
  filters?: Record<string, ErrorFilterFunction>
  // Default filters that are run after the custom filters
  useDefaultFilters?: boolean
}): {
  [key: string]: ValidationError[]
  unregistered: ValidationError[]
} => {
  return useMemo(() => {
    if (useDefaultFilters) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      filters = {
        ...filters,
        removeNonUIControlErrors: {
          args: 'errorAndField',
          func: removeNonUIControlErrors,
        },
      }
    }

    // If there are no filters than all errors are unregistered
    if (typeof filters === 'undefined') {
      return {
        unregistered: errors,
      }
    }

    const [registered, unregistered] = Object.keys(filters).reduce(
      ([reg, unreg], filterType) => {
        // There are no more unregistered errors, so we can return the registered errors
        if (unreg.length === 0) {
          return [reg, unreg]
        }
        const [passing, failing] = unreg.reduce(
          ([pass, fail], error) => {
            const field = fields.find(f => f.name === error.field)
            return filters && typeof filters[filterType] !== 'undefined'
              ? (
                  filters[filterType]['args'] === 'errorAndField' // the previous condition checks to ensure the function is not undefined
                    ? filters[filterType]['func'](error, field)
                    : filters[filterType]['func'](error)
                )
                ? [[...pass, error], fail]
                : [pass, [...fail, error]]
              : ([pass, fail] as [ValidationError[], ValidationError[]]) // if we don't have a filter (although we should), return original pass and fail args
          },
          [[], []] as [ValidationError[], ValidationError[]],
        )
        // Passing errors are registered, so add them to the registered object based on their filtered type
        // failing errors are the remaining errors that haven't passed any filters
        return [{...reg, [`${filterType}`]: passing}, [...failing]]
      },
      [{}, errors] as [Record<string, ValidationError[]>, ValidationError[]],
    )
    return {
      ...registered,
      unregistered,
    }
  }, [errors, fields, filters])
}
