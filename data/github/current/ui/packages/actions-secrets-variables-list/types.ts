export enum ItemsScope {
  Organization = 'Organization',
  OrgHostSetup = 'Host setup',
  OrgDevEnv = 'Development environment',
  Repository = 'Repository',
  Environment = 'Environment',
  CodespaceUser = 'Codespace user',
}

export enum ListMode {
  secret = 'secret',
  variable = 'variable',
}

export interface RowData {
  // ID is the unique identifier for the row - same as name except for environment secrets on the repo page
  id: string
  // Name is the display name for the row
  name: string
  scope?: ItemsScope
  environment?: string
  environmentUrl?: string
  editUrl?: string
  deleteUrl?: string
  lastUpdated?: Date
  visibility?: string
  override?: boolean
  value?: string
}

export interface Item {
  name: string
  environment_name?: string
  environment_url?: string
  visibility_description?: string
  updated_at: Date
  scope: ItemsScope
  value?: string
}

export enum FormMode {
  add = 'add',
  update = 'update',
}

export interface CrudUrls {
  editUrls?: {[secretName: string]: string}
  deleteUrls?: {[secretName: string]: string}
}

export interface TableActionProps {
  url?: string
  mode: ListMode
  message: string
  useDialog?: boolean
  isEditableInScope: boolean
  publicKey?: string
  keyId?: string
  tableDataUpdater: (item: Item, url: string, mode: FormMode) => void
}

export interface Description {
  text: string
  contextUrl?: string
  contextLinkText?: string
}

export interface ActionsSecretsVariablesListProps {
  items: Item[]
  overrides?: Item[]
  scope: ItemsScope
  environmentUrls?: {[environmentName: string]: string}
  crudUrls?: CrudUrls
  tableActionProps: TableActionProps
  mode: ListMode
  description?: Description
  isPrivateRepoInFreeOrg: boolean
}

export interface FormDialogProps {
  mode: ListMode
  name?: string
  value?: string
  onClose: () => void
  tableDataUpdater: (item: Item, url: string, mode: FormMode) => void
  formMode: FormMode
  url?: string
  publicKey?: string
  rowId: string
  keyId?: string
}

export interface DeleteDialogProps {
  url: string
  rowId: string
  mode: ListMode
  additionalFormData?: {[key: string]: string}
  setClose: (open: boolean, rowId: string) => void
  tableDataUpdater: (itemName: string) => void
}

export interface DescriptionElementProps {
  description: Description
}

export interface ActionsSecretsVariablesBlankstateProps {
  scope: ItemsScope
  mode: ListMode
  description: Description
  tableAction: JSX.Element
  isEditableInScope: boolean
  isPrivateRepoInFreeOrg: boolean
}
