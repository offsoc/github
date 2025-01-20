import type {ListResults} from '@github-ui/repos-list-shared'

export type PropertyValue = string | string[]
export const BOOLEAN_PROPERTY_ALLOWED_VALUES = ['true', 'false']
export type PropertyValuesRecord = Record<string, PropertyValue>

export type OrgEditPermissions = 'all' | 'definitions' | 'values'
export type PropertyValidationErrors = Record<string, string>
export type ValueType = 'string' | 'single_select' | 'multi_select' | 'true_false'
export type ValuesEditableBy = 'org_and_repo_actors' | 'org_actors'

export interface PropertyDefinition {
  propertyName: string
  valueType: ValueType
  required: boolean
  defaultValue: PropertyValue | null
  description: string | null
  allowedValues: string[] | null
  valuesEditableBy: ValuesEditableBy
  regex: string | null
}

export type SourceType = 'org' | 'business'

export interface PropertyDefinitionWithSourceType extends PropertyDefinition {
  sourceType: SourceType
}

export interface CustomPropertiesDefinitionsPagePayload extends ListResults<Repository> {
  definitions: PropertyDefinitionWithSourceType[]
}

export interface OrgCustomPropertiesDefinitionsPagePayload extends CustomPropertiesDefinitionsPagePayload {
  permissions: OrgEditPermissions
  business?: BusinessInfo
}

export interface BusinessInfo {
  name: string
  slug: string
}

export interface RepoPropertiesPagePayload {
  definitions: PropertyDefinition[]
  values: PropertyValuesRecord
  canEditProperties: boolean
}

export interface RepoSettingsPropertiesPagePayload {
  definitions: PropertyDefinition[]
  currentRepo: Repository
  editableProperties: string[]
}

export interface CustomPropertyDetailsPagePayload {
  definition?: PropertyDefinitionWithSourceType
  propertyNames: string[]
  business?: BusinessInfo
}

export interface PropertyConsumerUsage {
  value: string
  consumerType: 'ruleset'
}

export interface CheckPropertyUsagesResponse {
  repositoriesCount: number
  propertyConsumerUsages: PropertyConsumerUsage[]
}

export interface Repository {
  id: number
  name: string
  visibility: 'public' | 'private' | 'internal'
  description: string | null
  properties?: PropertyValuesRecord
}

export interface PropertyNameValidationResult {
  message: string
  orgConflicts?: PropertyNameOrgConflicts
}

export interface PropertyNameOrgConflicts {
  usages: OrgConflictUsage[]
  totalUsageCount: number
}

export interface OrgConflictUsage {
  name: string
  avatarUrl: string
  propertyType: ValueType
}
