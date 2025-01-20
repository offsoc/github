import {Factory} from 'fishery'

import type {PersistedOption} from '../../../client/api/columns/contracts/single-select'
import {emptySingleSelectOption} from '../../../client/helpers/new-column'

export const singleSelectOptionFactory = Factory.define<PersistedOption, {name: string}>(
  ({sequence, transientParams: {name = 'Option name'}}) => ({
    ...emptySingleSelectOption,
    id: sequence.toString(),
    nameHtml: name,
    name,
    descriptionHtml: emptySingleSelectOption.description,
  }),
)
