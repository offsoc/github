import type {PersistedOption, SingleSelectValue} from '../../client/api/columns/contracts/single-select'
import {emptySingleSelectOption} from '../../client/helpers/new-column'

export const statusOptions = new Array<PersistedOption>(
  {
    id: '20e5d8ab',
    name: 'Backlog',
    nameHtml: 'Backlog',
    color: 'GRAY',
    description: "Don't work on this right now",
    descriptionHtml: "Don't work on this right now",
  },
  {
    id: '47fc9ee4',
    name: 'In Progress',
    nameHtml: 'In Progress',
    color: 'BLUE',
    description: 'Someone is working on this',
    descriptionHtml: 'Someone is working on this',
  },
  {
    id: 'ed508725',
    name: 'Ready',
    nameHtml: 'Ready',
    color: 'ORANGE',
    description: 'Feel free to start working on this',
    descriptionHtml: 'Feel free to start working on this',
  },
  {
    id: '98236657',
    name: 'Done',
    nameHtml: 'Done',
    color: 'GREEN',
    description: 'Completed work',
    descriptionHtml: 'Completed work',
  },
)

export const aardvarkOptions = new Array<PersistedOption>(
  {id: '1', nameHtml: 'Aric', ...emptySingleSelectOption, name: 'Aric', descriptionHtml: ''},
  {id: '2', nameHtml: 'Brendan', ...emptySingleSelectOption, name: 'Brendan', descriptionHtml: ''},
  {id: '3', nameHtml: 'Derrick', ...emptySingleSelectOption, name: 'Derrick', descriptionHtml: ''},
  {id: '4', nameHtml: 'Kate', ...emptySingleSelectOption, name: 'Kate', descriptionHtml: ''},
  {id: '5', nameHtml: 'Kelsey', ...emptySingleSelectOption, name: 'Kelsey', descriptionHtml: ''},
  {id: '6', nameHtml: 'Lere', ...emptySingleSelectOption, name: 'Lere', descriptionHtml: ''},
  {id: '7', nameHtml: 'Matt', ...emptySingleSelectOption, name: 'Matt', descriptionHtml: ''},
  {id: '8', nameHtml: 'Max', ...emptySingleSelectOption, name: 'Max', descriptionHtml: ''},
)
export const stageOptions = new Array<PersistedOption>(
  {
    id: 'on_hold',
    nameHtml: 'On Hold',
    ...emptySingleSelectOption,
    name: 'On Hold',
    color: 'RED',
    descriptionHtml: '',
  },
  {
    id: 'up_next',
    nameHtml: 'Up Next',
    ...emptySingleSelectOption,
    name: 'Up Next',
    color: 'BLUE',
    descriptionHtml: '',
  },
  {
    id: 'in_progress',
    nameHtml: 'In Progress',
    ...emptySingleSelectOption,
    name: 'In Progress',
    color: 'ORANGE',
    descriptionHtml: '',
  },
  {
    id: 'closed',
    nameHtml: 'Closed',
    ...emptySingleSelectOption,
    name: 'Closed',
    color: 'PURPLE',
    descriptionHtml: '',
  },
)

export function getSingleSelectOptionValueFromName(name: string | undefined, options: Array<PersistedOption>) {
  const optionId = name ? options.find(o => o.name === name)?.id : undefined
  const stageOptionValue: SingleSelectValue | null = optionId != null ? {id: optionId} : null
  return stageOptionValue
}
