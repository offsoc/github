import {PolicySettings} from './components/PolicySettings'
import type {ActionsPoliciesProps} from './types'

export function ActionsPolicies({entity, type}: ActionsPoliciesProps) {
  return <PolicySettings entity={entity} type={type} />
}
