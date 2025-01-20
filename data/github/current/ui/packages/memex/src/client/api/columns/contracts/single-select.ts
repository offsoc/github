import type {ColorName} from '@github-ui/use-named-color'

/** Serialized value for single select provided from backend */
export interface SingleSelectValue {
  id: string
}

export interface NewOption {
  name: string
  color: ColorName
  description: string
}

export type NewOptions = Array<NewOption>

/** Where ID is present, the corresponding option will be updated. Otherwise a new option will be created. */
export type UpdateOptions = Array<NewOption & {id?: string}>

export interface NewSingleOption extends NewOption {
  position?: number
}

export interface UpdateSingleOption extends Partial<NewSingleOption>, SingleSelectValue {}

/** Full option data from backend. */
export interface PersistedOption extends NewOption, SingleSelectValue {
  nameHtml: string
  descriptionHtml: string
}
