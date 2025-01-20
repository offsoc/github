import type {CustomPropertiesDefinitionsPagePayload} from '@github-ui/custom-properties-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {DefinitionsList} from '../components/DefinitionsPage'
import {DefinitionsPageHeader} from '../components/PropertiesHeaderPageTabs'

export function BusinessCustomPropertiesPage() {
  const {definitions} = useRoutePayload<CustomPropertiesDefinitionsPagePayload>()

  return (
    <>
      <DefinitionsPageHeader permissions="definitions" definitions={definitions} />
      <DefinitionsList definitions={definitions} />
    </>
  )
}
