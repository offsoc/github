import type {OrgEditPermissions, PropertyDefinition} from '@github-ui/custom-properties-types'
import {Link} from '@github-ui/react-core/link'
import {Box, Button} from '@primer/react'

import {useNewPropertyPath} from '../hooks/use-property-details-paths'
import {DefinitionsLimitBanner, isDefinitionsLimitReached} from './Banners'
import {PropertyPageHeader} from './PageHeader'
import {PropertiesPageTabs} from './PropertiesPageTabs'

export function PropertiesHeaderPageTabs({
  permissions,
  definitions,
}: {
  permissions: OrgEditPermissions
  definitions: PropertyDefinition[]
}) {
  return (
    <>
      <DefinitionsPageHeader definitions={definitions} permissions={permissions} />
      {permissions === 'all' && <PropertiesPageTabs permissions={permissions} definitionsCount={definitions.length} />}
    </>
  )
}

export function DefinitionsPageHeader({
  definitions,
  permissions,
}: {
  definitions: PropertyDefinition[]
  permissions: OrgEditPermissions
}) {
  const newPropertyPath = useNewPropertyPath()

  const definitionLimitReached = isDefinitionsLimitReached(definitions)
  const canCreateProperty = !definitionLimitReached && (permissions === 'all' || permissions === 'definitions')

  return (
    <>
      <PropertyPageHeader
        title="Custom properties"
        subtitle="Custom properties allow you to decorate your repositories with information such as compliance frameworks, data
      sensitivity, or project details."
        actions={
          canCreateProperty && (
            <Button as={Link} to={newPropertyPath} variant="primary" data-testid="add-definition-button">
              New property
            </Button>
          )
        }
      />
      {definitionLimitReached && (
        <Box sx={{mb: 2}}>
          <DefinitionsLimitBanner />
        </Box>
      )}
    </>
  )
}
