export enum EntityType {
  Enterprise = 'Enterprise',
  Repo = 'Repo',
  Organization = 'Organization',
}

export enum PolicyIdentifier {
  Author = 'Author',
  Expression = 'Expression',
}

export type PolicyProps = {
  identifier: PolicyIdentifier
  form: PolicyForm
  setPolicyForm: (form: PolicyForm) => void
  idx: number
}

export type Entity = {
  allowsAllActionsAndWorkflows: boolean
  actionsDisabledByOwner: boolean
  actionsEnabledForAllEntities: boolean
  actionsEnabledForSelectedEntities: boolean
  actionsDisabled: boolean
  dotcomConnectionRequired: boolean
  allowsGithubOwnedActions: boolean | null
  specifiedActions: boolean | null
  allowsVerifiedActions: boolean | null
  highestLevelAllowlist: Entity | null
  patterns: string[] | null
}

export type PolicyForm = {
  allowCreatedByGitHub: boolean
  allowVerifiedCreator: boolean
  specifiedActionsDisabled: boolean
  patterns: string
  noPolicyOrSelectedActions: ActionsAndWorkflowsAllowedSetting
}

export type PolicyFormWrapper = {
  form: PolicyForm
  setPolicyForm: (form: PolicyForm) => void
}

export type Index = {
  idx: number
}

export interface ActionsPoliciesProps {
  entity: Entity
  type: EntityType
}

export const NO_POLICY = 'none'
export const SELECT_ACTIONS = 'select'

export type ActionsAndWorkflowsAllowedSetting = typeof NO_POLICY | typeof SELECT_ACTIONS
