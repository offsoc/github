import {propertyDefinitionSettingsPath} from '@github-ui/paths'

import {usePropertySource} from './use-property-source'

export function useDeletePropertyPath(propertyName: string) {
  const {pathPrefix, sourceName} = usePropertySource()
  return propertyDefinitionSettingsPath({pathPrefix, sourceName, propertyName})
}

export function useSavePropertyPath() {
  const {pathPrefix, sourceName} = usePropertySource()
  return propertyDefinitionSettingsPath({pathPrefix, sourceName})
}

export function useListPropertiesPath() {
  const {pathPrefix, sourceName} = usePropertySource()
  return propertyDefinitionSettingsPath({pathPrefix, sourceName})
}
