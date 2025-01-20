import {
  type FilterConfig,
  type FilterProviderOptions,
  type FilterSettings,
  NOT_SHOWN,
  ProviderSupportStatus,
} from '../types'

export const defaultFilterConfig: FilterConfig = {
  filterDelimiter: ':',
  valueDelimiter: ',',
  variant: 'full',
}

export const defaultFilterProviderOptions: FilterProviderOptions = {
  priority: NOT_SHOWN,
  filterTypes: {
    inclusive: true,
    exclusive: true,
    valueless: true,
    multiKey: true,
    multiValue: true,
  },
  support: {
    status: ProviderSupportStatus.Supported,
  },
}

export const defaultFilterSettings: FilterSettings = {
  aliasMatching: false,
  disableAdvancedTextFilter: false,
}
