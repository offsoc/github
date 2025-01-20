import {type ActionsPoliciesProps, EntityType} from '../types'

export function getActionsPoliciesProps(): ActionsPoliciesProps {
  return {
    entity: {
      allowsAllActionsAndWorkflows: true,
      actionsDisabledByOwner: false,
      actionsEnabledForAllEntities: true,
      actionsEnabledForSelectedEntities: true,
      actionsDisabled: false,
      allowsGithubOwnedActions: null,
      highestLevelAllowlist: null,
      specifiedActions: null,
      dotcomConnectionRequired: false,
      allowsVerifiedActions: null,
      patterns: [],
    },
    type: EntityType.Enterprise,
  }
}
