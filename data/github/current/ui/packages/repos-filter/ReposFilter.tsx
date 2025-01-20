import {Filter, type FilterProps} from '@github-ui/filter'

import {getCustomPropertiesProviders, type PropertyDefinition} from './providers/custom-properties'
import {getAllDateProviders} from './providers/date'
import {LanguageStaticFilterProvider} from './providers/languages'
import {getAllNumberProviders} from './providers/number'
import {getAllStaticProviders} from './providers/static'

export type {PropertyDefinition}

interface Props extends Omit<FilterProps, 'providers'> {
  definitions: PropertyDefinition[]
}

export function ReposFilter({definitions, ...props}: Props) {
  const providers = [
    ...getAllStaticProviders(),
    ...getAllNumberProviders(),
    ...getAllDateProviders(),
    ...getCustomPropertiesProviders(definitions),
    new LanguageStaticFilterProvider(),
  ]

  return <Filter {...props} providers={providers} />
}
