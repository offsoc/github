import type React from 'react'
import {useCallback, useRef, useState} from 'react'
import type {ZodTypeAny} from 'zod'

export type FormField = {
  name: string
  label: string
  schema?: ZodTypeAny
  value: string | string[]
} & (
  | {
      error: undefined
      validationStatus: undefined
    }
  | {
      error: string
      validationStatus: 'error'
    }
)

export function useForm() {
  const fields = useRef<Record<string, FormField>>({})

  const [formState, setFormState] = useState({dirty: false, touched: false, hasErrors: false})

  const updateField = useCallback(
    (
      name: string,
      fieldLike:
        | Pick<FormField, 'value'>
        | Pick<FormField, 'schema'>
        | {error: undefined; validationStatus: undefined}
        | {error: string; validationStatus: 'error'},
    ) => {
      const field = fields.current[name]

      if (field === undefined) {
        return
      }

      fields.current = {
        ...fields.current,

        [name]: {
          ...field,
          ...fieldLike,
        },
      }
    },
    [],
  )

  const register = useCallback(
    (
      name: keyof typeof fields.current,
      registerOpts: {isCheckboxGroup?: boolean; label: string; schema: ZodTypeAny},
    ) => {
      const onChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        let value: FormField['value']

        if (registerOpts.isCheckboxGroup) {
          const maybeField = fields.current[name]

          if (maybeField === undefined || typeof maybeField.value === 'string') {
            /**
             * In practice, this is a fairly impossible case,
             * but it's here just to make the TypeScript compiler happy.
             */
            return
          }

          /**
           * If working with a checkbox group, we assume the underlying fields are of the right type
           * (e.g. input type="checkbox"), so applying explicit casting to the event.
           */
          const isCheckboxChecked = (event as React.ChangeEvent<HTMLInputElement>).target.checked

          if (isCheckboxChecked) {
            /**
             * If the user checked the checkbox, we add the value to the array of values for this
             * checkbox group.
             */
            value = maybeField.value.concat(event.target.value)
          } else {
            /**
             * If the user unchecked the checkbox, we remove the value from the array of values for this
             * checkbox group. We remove the value by slicing the array in two parts, the first one containing
             * the elements before the one we want to remove, and the second one containing the elements
             * after the one we want to remove.
             */
            const elementIndex = maybeField.value.indexOf(event.target.value)

            value = [...maybeField.value.slice(0, elementIndex), ...maybeField.value.slice(elementIndex + 1)]
          }
        } else {
          value = event.target.value
        }

        updateField(name, {value})

        setFormState(prev => ({...prev, dirty: true, touched: true}))
      }

      const maybeField = fields.current[name]

      /**
       * Register the field.
       */
      fields.current = {
        ...fields.current,

        [name]: {
          error: undefined,
          label: registerOpts.label,
          name,
          schema: registerOpts.schema,
          validationStatus: undefined,
          value: registerOpts.isCheckboxGroup ? [] : '',

          /**
           * Perhaps register was called after the field was already rendered. In that case,
           * we make sure we do not lose the current value & state.
           */
          ...maybeField,
        },
      }

      return registerOpts.isCheckboxGroup ? {name, onChange} : {name, onChange, value: maybeField?.value ?? ''}
    },
    [updateField],
  )

  const handleSubmit = useCallback(
    (onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void) => {
      return (event: React.FormEvent<HTMLFormElement>) => {
        for (const [name, field] of Object.entries<FormField>(fields.current)) {
          if (field.schema === undefined) {
            continue
          }

          const validation = field.schema.safeParse(field.value)

          let error: string | undefined = undefined

          if (!validation.success) {
            const issue = validation.error.issues.at(0)!

            error = 'Please, verify this field is correct.'

            if (issue.code === 'too_small' && issue.minimum === 1) {
              error = 'This field is required.'
            }

            if (issue.code === 'invalid_string' && issue.validation === 'email') {
              error = 'Introduce a valid email.'
            }
          }

          if (error !== undefined) {
            updateField(name, {error, validationStatus: 'error'})
          } else {
            updateField(name, {error: undefined, validationStatus: undefined})
          }
        }

        const formWithErrors = Object.values<FormField>(fields.current).some(
          field => field.validationStatus === 'error',
        )

        setFormState(prev => ({...prev, touched: true, hasErrors: formWithErrors}))

        if (formWithErrors) {
          event.preventDefault()

          return
        }

        if (onSubmit !== undefined) {
          onSubmit(event)
        }
      }
    },
    [updateField],
  )

  return {
    fields: fields.current,
    formState,
    handleSubmit,
    register,
  }
}
