export type Group = {
  id: number
  group_path: string
  direct_count: number
  total_count: number
  repos: Repository[]
  directSettings?: Settings
  inheritedSettings?: Settings
  orchestration?: SettingsOrchestration
}

type Settings = {
  forkDestinations: Record<ForkDestination, boolean>
  accessPermissions: {
    teams: Team[]
    allowAdditionalCollaborators: boolean
  }
}

export type Repository = {
  id: number
  name: string
}

export type SettingsOrchestration = {
  state: string
  id: number
  succeeded: number
  failed: number
  total: number
  channel?: string
  completed?: Date
}

export type Team = {
  id: number
  role: string
  name: string
}

export type GroupTree = {
  id: number
  nodes?: {
    [key: string]: GroupTree
  }
  total_count: number
  repos?: Repository[]
}

export type Organization = {
  name: string
}

export type AppPayload = {
  maxDepth: number
  isStafftools: boolean
  organization: Organization
  readOnly: boolean
  basePath: string
  baseAvatarUrl: string
}

export interface RoutePayload {
  groups: Group[]
}
export interface FormPayload {
  isRoot: boolean
}
export interface ListPayload extends RoutePayload {}

export interface NewPayload extends RoutePayload, FormPayload {
  parentGroup: Group
}

export interface ShowPayload extends RoutePayload, FormPayload {
  group: Group
}

export interface ReviewPayload extends RoutePayload {}

export type FieldComponentProps<ValueType = unknown> = {
  initialValue?: ValueType
  inherited?: boolean
}

export const enum ForkDestination {
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
  USERS = 'USERS',
}

export type AccessPermission = {
  id: number
  name: string
  role: string
}

export type FormField<ValueType = unknown, ValidationError = unknown> = {
  value: ValueType
  validationError?: ValidationError
  touched: boolean
  name: string
  validate(): Promise<ValidationError | undefined>
  update(newValue: ValueType): Promise<void>
  reset(): void
  isValid(): boolean
  setFieldError(newValidationError: ValidationError): void
}

export enum PAGE {
  'List',
  'New',
  'Show',
  'Review',
}
