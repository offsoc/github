import {createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren} from 'react'
import type {FormField} from '../types'

type UpdateProps<ValueType = unknown, ValidationError = unknown> = Pick<
  FormField<ValueType, ValidationError>,
  'name' | 'value' | 'validationError' | 'touched'
>

type Update = <ValueType = unknown, ValidationError = unknown>(props: UpdateProps<ValueType, ValidationError>) => void

const defaultValues = {
  state: {},
  isTouched: false,
  update(_props: UpdateProps) {
    return
  },
  getBody() {
    return {}
  },
}

const GroupFormContext = createContext(defaultValues)

export function GroupFormProvider({children}: PropsWithChildren) {
  const [state, setState] = useState({})
  const update: Update = useCallback(
    ({name, value, touched, validationError}) => {
      setState(currentState => ({
        ...currentState,
        [name]: {
          value,
          touched,
          validationError,
        },
      }))
    },
    [setState],
  )
  const getBody = useCallback(() => {
    const body = {}
    for (const key in state) {
      // @ts-expect-error mapping loosely typed objects, should be safe
      body[key] = state[key].value
    }
    return body
  }, [state])

  const isTouched = useMemo(() => {
    for (const key in state) {
      //@ts-expect-error mapping loosely typed objects, should be safe
      if (state[key].touched) {
        return true
      }
    }
    return false
  }, [state])

  const value = useMemo(
    () => ({
      state,
      isTouched,
      update,
      getBody,
    }),
    [state, isTouched, update, getBody],
  )

  return <GroupFormContext.Provider value={value}>{children}</GroupFormContext.Provider>
}

export function useGroupFormContext() {
  const context = useContext(GroupFormContext)
  if (context === undefined) {
    throw new Error('useGroupFormContext must be within GroupFormProvider')
  }
  return context
}
