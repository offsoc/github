import type {DefaultValuesById} from '../types'

type SafeGetDefaultValueType = {
  id?: string | null
  value?: string | null
} & DefaultValuesById

export const safeGetDefaultValue = ({id, value, defaultValuesById}: SafeGetDefaultValueType) => {
  // ID and value are undefined/nullable to be compliant with the graphQL return payload, as these fields
  // on the elements (textarea for example) are optional.
  const defaultEnforcedValue = defaultValuesById && id ? defaultValuesById[id] : undefined
  return defaultEnforcedValue ?? value ?? ''
}
