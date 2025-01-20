import {customPropertyDetailsPath} from '@github-ui/paths'

import {usePropertySource} from './use-property-source'

export function useNewPropertyPath() {
  const {pathPrefix, sourceName} = usePropertySource()
  return customPropertyDetailsPath({pathPrefix, sourceName})
}

export function useEditPropertyPath(propertyName: string) {
  const {pathPrefix, sourceName} = usePropertySource()
  return customPropertyDetailsPath({pathPrefix, sourceName, propertyName})
}
