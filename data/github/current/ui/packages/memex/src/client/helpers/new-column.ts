import type {NewOption, NewSingleOption, UpdateOptions} from '../api/columns/contracts/single-select'

/**
 * In client state when editing settings every option has an ID including new ones, so we
 * can manipulate the list easily.
 */
export type SettingsOption = NewOption & {id: string}

/**
 * Filter the options to only include ones where the user has entered some text
 */
export function filterEmptyOptions(options: UpdateOptions) {
  return options.filter(o => o.name.length > 0)
}

export const emptySingleSelectOption: NewSingleOption = {color: 'GRAY', description: '', name: ''}
