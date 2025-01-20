import {useCallback} from 'react'
import {commitLocalUpdate, useRelayEnvironment} from 'react-relay'

/**
 * A hook to update the relay store with a local state object. Use in conjunction with a custom client extension
 * GraphQL field to store local state in relay.
 *
 * @param objectId Relay ID of the object to update
 * @param fieldName GraphQL field name of the state to update
 * @param currentValue Current value of the state
 * @param defaultValue Default value of the state. The hook will return this value if current value is undefined, because
 * that indicates that the state has not been set in the relay store yet.
 */
export default function useRelayState<T>({
  objectId,
  fieldName,
  currentValue,
  defaultValue,
}: {
  objectId: string
  fieldName: string
  currentValue: T
  defaultValue: T
}): [state: T, setState: (state: T) => void] {
  const environment = useRelayEnvironment()

  // undefined means the value is not set in the relay store, so fall back to the default value
  const state = currentValue === undefined ? defaultValue : currentValue
  const setState = useCallback(
    (newState: T) => {
      commitLocalUpdate(environment, store => {
        const record = store.get<{[fieldName: string]: T}>(objectId)
        record?.setValue(newState, fieldName)
      })
    },
    [environment, objectId, fieldName],
  )

  return [state, setState]
}
