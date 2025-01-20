import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import type {NewSingleOption, PersistedOption, UpdateOptions} from '../../../client/api/columns/contracts/single-select'
import {createColumn} from '../../../mocks/data/columns'

let nextOptionId = 100

/**
 * Merge the existing column settings options with changes representing
 * the update to these settings.
 *
 * This handles populating ids for new options, setting the `nameHtml` value
 * and inserting new options at the location specified by the `position` field in the
 * new option to add meta data.
 *
 * @param persistedOptions the existing options in the column settings for a field
 * @param newOption the new option to merge with the current list of options
 * @returns the new list of options
 */
export const addOptionAtPosition = (
  persistedOptions: Array<PersistedOption> = [],
  {position, ...initialOptionData}: NewSingleOption,
) => {
  const newOptions = [...persistedOptions]

  const newOption: PersistedOption = {
    id: (nextOptionId++).toString(),
    ...initialOptionData,
    nameHtml: initialOptionData.name,
    descriptionHtml: initialOptionData.description,
  }

  if (position != null) {
    newOptions.splice(position - 1, 0, newOption) // position is 1-indexed on the server
  } else {
    newOptions.push(newOption)
  }

  return newOptions
}

/**
 * destroy an option from the column settings
 * @param persistedOptions - the existing options in the column settings for a field
 * @param id - the option id to destroy
 * @returns the new list of options
 */
export function destroyOptionById(persistedOptions: Array<PersistedOption>, id: string) {
  return persistedOptions.filter(o => o.id !== id)
}

export function createOptions(options: UpdateOptions): Array<PersistedOption> {
  return options.map((o, i) => ({id: o.id ? o.id : `${i + 1}`, nameHtml: o.name, descriptionHtml: o.description, ...o}))
}

export function createColumnWithOptions(options: UpdateOptions) {
  return createColumn({
    dataType: MemexColumnDataType.SingleSelect,
    id: 55,
    name: 'Aardvarks',
    userDefined: true,
    defaultColumn: false,
    settings: {
      options: createOptions(options),
    },
  })
}
