import type {ValueType} from '@github-ui/custom-properties-types'
import {FilterProviderType, type SuppliedFilterProviderOptions} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {NoteIcon} from '@primer/octicons-react'

import {TRUE_FALSE_FILTER_VALUES} from './static'

export interface PropertyDefinition {
  propertyName: string
  allowedValues?: string[] | null
  required?: boolean
  valueType: ValueType
}

export function getCustomPropertiesProviders(definitions: PropertyDefinition[]) {
  return definitions.map(definition => new CustomPropertyFilterProvider(definition))
}

const NOT_SHOWN = 10

class CustomPropertyFilterProvider extends StaticFilterProvider {
  constructor(definition: PropertyDefinition) {
    const {propertyName, valueType} = definition

    const allowedValues = definition.allowedValues || []
    const filter = {
      displayName: `Property: ${propertyName}`,
      key: `props.${propertyName}`,
      priority: NOT_SHOWN,
      icon: NoteIcon,
    }

    const values = allowedValues.map((value, index) => ({value, displayName: value, priority: index + 1}))

    const filterValues = valueType === 'true_false' ? TRUE_FALSE_FILTER_VALUES : values
    const filterOptions = getFilterOptions(definition)

    super(filter, filterValues, filterOptions)

    this.type = this.filterProviderType(valueType)
  }

  filterProviderType = (valueType: ValueType) => {
    switch (valueType) {
      case 'single_select':
        return FilterProviderType.Select
      case 'multi_select':
        return FilterProviderType.Select
      case 'true_false':
        return FilterProviderType.Boolean
      case 'string':
        return FilterProviderType.Text
    }
  }
}

function getFilterOptions({valueType, required}: PropertyDefinition): SuppliedFilterProviderOptions {
  return {
    filterTypes: {multiKey: valueType === 'multi_select', multiValue: true, valueless: !required},
  }
}
