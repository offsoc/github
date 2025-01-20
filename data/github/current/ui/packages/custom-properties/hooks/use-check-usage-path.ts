import {checkPropertyUsagePath} from '@github-ui/paths'

import {usePropertySource} from './use-property-source'

export function useCheckUsagePath(propertyName: string) {
  const {pathPrefix, sourceName} = usePropertySource()
  return checkPropertyUsagePath({pathPrefix, sourceName, propertyName})
}
