import type React from 'react'
import {PolicyIdentifier, type PolicyProps, type PolicyFormWrapper, type Index} from '../../types'
import {ActionCreatorPolicy} from './ActionCreatorPolicy'
import {NamePatternPolicy} from './NamePatternPolicy'

function policyComponent(identifier: PolicyIdentifier): React.ComponentType<PolicyFormWrapper & Index> {
  switch (identifier) {
    case PolicyIdentifier.Author:
      return ActionCreatorPolicy
    case PolicyIdentifier.Expression:
      return NamePatternPolicy
  }
}

export const Policy: React.FC<PolicyProps> = props => {
  const {identifier, form, setPolicyForm, idx} = props

  const PolicyComponent = policyComponent(identifier)

  return <PolicyComponent form={form} setPolicyForm={setPolicyForm} idx={idx} />
}
