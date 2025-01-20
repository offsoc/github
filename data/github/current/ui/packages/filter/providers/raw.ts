import {TypographyIcon} from '@primer/octicons-react'

import {defaultFilterProviderOptions} from '../constants/defaults'
import {type FilterProvider, FilterProviderType} from '../types'

export const RawTextProvider: FilterProvider = {
  type: FilterProviderType.RawText,
  icon: TypographyIcon,
  options: defaultFilterProviderOptions,
  key: 'text',
  priority: 5,
  displayName: 'Text',
  getSuggestions: () => [],
  validateFilterBlockValues: () => [],
  getValueRowProps: () => ({text: ''}),
}
